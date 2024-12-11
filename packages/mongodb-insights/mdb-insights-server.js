import { check, Match } from 'meteor/check';
import { MongoInternals } from 'meteor/mongo';
import { MongoClient } from 'mongodb';

let authenticationHook = () => true;
let mongoConnectionHook = () => MongoInternals.defaultRemoteCollectionDriver().mongo.db;
let mongoClient = null;

const createReadOnlyProxy = (db) => {
  const handler = {
    get: (target, prop) => {
      // Allow createIndex operation but block other write operations
      if (['insert', 'update', 'delete', 'remove', 'drop'].includes(prop)) {
        return () => { throw new Error('Write operations not allowed in analysis mode'); };
      }
      // Allow access to system.profile collection and createIndex operations
      if (prop === 'collection') {
        return (name) => {
          if (name !== 'system.profile' && !name.endsWith('.createIndex')) {
            throw new Error('Access denied. Only system.profile collection and index creation are allowed.');
          }
          return target[prop](name);
        };
      }
      return target[prop];
    }
  };
  return new Proxy(db, handler);
};

const configureAnalysisConnection = async (connectionString, options = {}) => {
  if (!connectionString) {
    throw new Error('MongoDB connection string is required');
  }

  // Close existing connection if any
  if (mongoClient) {
    await mongoClient.close();
  }

  // Create new connection
  mongoClient = new MongoClient(connectionString, {
    readConcern: { level: 'local' },
    monitorCommands: true,
    ...options
  });

  await mongoClient.connect();

  // Update the connection hook
  mongoConnectionHook = () => {
    const db = mongoClient.db();
    return createReadOnlyProxy(db);
  };

  return mongoClient;
};

const setAuthenticationHook = (hook) => {
  if (typeof hook !== 'function') {
    throw new Error('Authentication hook must be a function');
  }
  authenticationHook = hook;
};

const setMongoConnectionHook = (hook) => {
  if (typeof hook !== 'function') {
    throw new Error('MongoDB connection hook must be a function');
  }
  mongoConnectionHook = hook;
};

Meteor.startup(async () => {
  console.log('MongoDB insights server started');
});

const getMongoDB = () => mongoConnectionHook();

const getProfileStatus = () => {
  return getMongoDB().command({ profile: -1 });
};

const setProfileLevel = (level) => {
  check(level, Match.Integer);
  if (level < 0 || level > 2) {
    throw new Meteor.Error('invalid-level', 'Profile level must be 0, 1, or 2');
  }
  return getMongoDB().command({ profile: level });
};

const getProfileQueries = async ({ minMillis = 100, collection = null, startDate = null, endDate = null }) => {
  const filter = {
    millis: { $gte: minMillis },
    op: { $in: ['query', 'command'] },
    'command.aggregate': { $exists: true },
    ns: { $ne: getMongoDB().databaseName + '.system.profile' } // Exclude system.profile collection
  };

  if (collection) {
    filter.ns = new RegExp(collection);
  }

  if (startDate) {
    filter.ts = filter.ts || {};
    filter.ts.$gte = new Date(startDate);
  }

  if (endDate) {
    filter.ts = filter.ts || {};
    filter.ts.$lte = new Date(endDate);
  }

  const profileCollection = getMongoDB().collection('system.profile');
  const queries = await profileCollection.find(filter).sort({ ts: -1 }).toArray();

  return queries.filter(query =>
    query.op === 'query' ||
    (query.op === 'command' && query.command?.aggregate)
  );
};

const analyzeQueries = async ({ minMillis = 100, collection = null, startDate = null, endDate = null }) => {
  const queries = await getProfileQueries({ minMillis, collection, startDate, endDate });
  return queries.map(query => {
    const issues = [];

    const generateIndexSuggestion = (query) => {
      if (query.op === 'query') {
        if (query.query && Object.keys(query.query).length > 0) {
          const fields = Object.keys(query.query);
          return `db.${query.ns.split('.')[1]}.createIndex({ ${fields.map(f => `${f}: 1`).join(', ')} })`;
        } else if (query.orderby && Object.keys(query.orderby).length > 0) {
          const fields = Object.keys(query.orderby);
          return `db.${query.ns.split('.')[1]}.createIndex({ ${fields.map(f => `${f}: 1`).join(', ')} })`;
        }
      } else if (query.op === 'command' && query.command?.aggregate) {
        const pipeline = query.command.pipeline;
        if (pipeline && pipeline.length > 0) {
          const matchStage = pipeline.find(stage => stage.$match);
          if (matchStage && Object.keys(matchStage.$match).length > 0) {
            const fields = Object.keys(matchStage.$match);
            return `db.${query.command.aggregate}.createIndex({ ${fields.map(f => `${f}: 1`).join(', ')} })`;
          }
          const sortStage = pipeline.find(stage => stage.$sort);
          if (sortStage && Object.keys(sortStage.$sort).length > 0) {
            const fields = Object.keys(sortStage.$sort);
            return `db.${query.command.aggregate}.createIndex({ ${fields.map(f => `${f}: 1`).join(', ')} })`;
          }
        }
      }
      return null;
    };

    const indexSuggestion = generateIndexSuggestion(query);

    if (!query.planSummary?.includes('IXSCAN')) {
      let severity = 'medium';
      if (query.millis > 1000) {
        severity = 'high';
      } else if (query.millis > 100) {
        severity = 'medium';
      } else {
        severity = 'low';
      }

      issues.push({
        type: 'NO_INDEX',
        severity,
        message: 'Query is not using any index',
        suggestion: 'Consider creating an index for the queried fields',
        recommendedIndex: indexSuggestion
      });
    }

    if (query.nscanned && query.nreturned) {
      const scanRatio = query.nscanned / query.nreturned;
      if (scanRatio > 100) {
        issues.push({
          type: 'HIGH_SCAN_RATIO',
          severity: 'medium',
          message: `Scanned ${query.nscanned} documents but only returned ${query.nreturned}`,
          suggestion: 'Review query filters and indexes to reduce the number of scanned documents',
          recommendedIndex: indexSuggestion
        });
      }
    }

    if (query.millis > 1000) {
      issues.push({
        type: 'SLOW_QUERY',
        severity: 'high',
        message: `Query took ${query.millis}ms to execute`,
        suggestion: 'Optimize query performance or consider adding indexes',
        recommendedIndex: indexSuggestion
      });
    }

    let queryDetails;
    if (query.op === 'query') {
      queryDetails = {
        type: 'find',
        filter: query.query || {},
        sort: query.orderby
      };
    } else if (query.op === 'command' && query.command?.aggregate) {
      queryDetails = {
        type: 'aggregate',
        pipeline: query.command.pipeline || []
      };
    }

    return {
      operation: query.op,
      namespace: query.ns,
      query: query.query,
      queryDetails,
      executionTime: query.millis,
      timestamp: query.ts,
      issues
    };
  });
};

const createSuggestedIndex = async (collection, indexSpec) => {
  check(collection, String);
  check(indexSpec, Object);

  const db = getMongoDB();
  try {
    const result = await db.collection(collection).createIndex(indexSpec);
    return { success: true, result };
  } catch (error) {
    throw new Meteor.Error('index-creation-failed', `Failed to create index: ${error.message}`);
  }
};

Meteor.methods({
  'mongodb.profile.status': async () => {
    if (!authenticationHook()) {
      throw new Meteor.Error('unauthorized', 'User not authorized to access MongoDB insights');
    }
    return await getProfileStatus();
  },
  'mongodb.profile.set': async (level) => {
    if (!authenticationHook()) {
      throw new Meteor.Error('unauthorized', 'User not authorized to access MongoDB insights');
    }
    return await setProfileLevel(level);
  },
  'mongodb.profile.queries': async (params) => {
    if (!authenticationHook()) {
      throw new Meteor.Error('unauthorized', 'User not authorized to access MongoDB insights');
    }
    return await getProfileQueries(params);
  },
  'mongodb.profile.analyze': async (params) => {
    if (!authenticationHook()) {
      throw new Meteor.Error('unauthorized', 'User not authorized to access MongoDB insights');
    }
    return await analyzeQueries(params);
  },
  'mongodb.createIndex': async (collection, indexSpec) => {
    if (!authenticationHook()) {
      throw new Meteor.Error('unauthorized', 'User not authorized to access MongoDB insights');
    }
    return await createSuggestedIndex(collection, indexSpec);
  }
});

export { setAuthenticationHook, setMongoConnectionHook, configureAnalysisConnection };
