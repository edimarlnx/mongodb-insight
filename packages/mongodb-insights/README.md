# MongoDB Insights for Meteor

MongoDB Insights is a Meteor package that provides real-time monitoring and analysis tools for MongoDB operations in your Meteor application. It helps developers identify performance bottlenecks, optimize queries, and maintain database efficiency.

## Key Features

- Real-time query profiling and analysis
- Slow query detection and alerting
- Index usage monitoring and recommendations
- Performance metrics visualization
- Secure authentication system
- Customizable monitoring parameters

## Installation

```bash
meteor add mongodb-insights
```

## Usage

### 1. Basic Setup

The simplest way to use MongoDB Insights is with your existing MongoDB connection:

```javascript
import { setAuthenticationHook } from 'meteor/mongodb-insights';

// Set up authentication (required)
setAuthenticationHook(() => {
  const user = Meteor.user();
  return user && user.isAdmin;
});
```

### 2. Advanced Setup with Separate Analysis Database

For production environments, it's recommended to use a separate MongoDB connection for analysis:

```javascript
import { configureAnalysisConnection } from 'meteor/mongodb-insights';

// Configure a read-only connection for analysis
await configureAnalysisConnection(process.env.MONGO_ANALYSIS_URL);
```

The analysis connection is automatically configured as read-only and restricted to the system.profile collection for security.

### 3. Available Methods

```javascript
// Get current profiling status
Meteor.call('mongodb.profile.status', (error, result) => {
  console.log('Current profile level:', result.was);
});

// Set profiling level (0: off, 1: slow queries, 2: all)
Meteor.call('mongodb.profile.set', 1, (error) => {
  if (!error) console.log('Profiling enabled for slow queries');
});

// Analyze queries with filters
const params = {
  minMillis: 100,        // Minimum execution time
  collection: 'users',   // Target collection (optional)
  startDate: new Date(), // Analysis start date (optional)
  endDate: new Date()    // Analysis end date (optional)
};

Meteor.call('mongodb.profile.analyze', params, (error, results) => {
  if (!error) console.log('Analysis results:', results);
});

// Create a suggested index
Meteor.call('mongodb.createIndex', 'collectionName', { field1: 1, field2: 1 }, (error, result) => {
  if (!error) console.log('Index created successfully:', result);
});
```

### 4. Security Considerations

- The package enforces read-only access to the analysis database
- Only the system.profile collection is accessible
- All write operations are blocked on the analysis connection
- Authentication is required for all operations

### 5. Configuration Options

When using `configureAnalysisConnection`, you can pass additional MongoDB options:

```javascript
await configureAnalysisConnection(process.env.MONGO_ANALYSIS_URL, {
  readConcern: { level: 'local' },
  monitorCommands: true,
  // Any other MongoDB connection options
});
```

### 6. Analysis Results

The analysis provides detailed information about each query:

```javascript
{
  operation: 'query',           // Operation type
  namespace: 'db.collection',   // Collection being queried
  executionTime: 150,          // Time in milliseconds
  issues: [{
    type: 'NO_INDEX',          // Issue type
    severity: 'high',          // high, medium, or low
    message: 'Description',    // Issue description
    suggestion: 'Action item', // Recommended action
    recommendedIndex: 'db.collection.createIndex({ field: 1 })'
  }]
}
```

### 7. Index Management

The package provides functionality to create suggested indexes directly from the analysis results:

```javascript
// Example of creating an index from analysis recommendations
const analysis = await Meteor.callAsync('mongodb.profile.analyze', params);
const recommendation = analysis[0].issues.find(issue => issue.recommendedIndex);

if (recommendation) {
  // Parse the recommended index string into collection and spec
  const [_, collection, indexSpec] = recommendation.recommendedIndex.match(/db\.(\w+)\.createIndex\((.+)\)/);
  
  // Create the suggested index
  await Meteor.callAsync('mongodb.createIndex', collection, JSON.parse(indexSpec));
}
```

Note: Index creation is allowed even in read-only mode to enable performance optimization based on analysis results.

## Best Practices

1. Use a separate MongoDB connection for analysis in production
2. Start with profiling level 1 to capture slow queries
3. Gradually adjust the minMillis threshold based on your performance requirements
4. Review and implement index recommendations carefully
5. Monitor the analysis database's resource usage

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MONGO_ANALYSIS_URL` | MongoDB URL for analysis connection | No | Main app connection |
| `ADMIN_USERNAME` | Admin username | No | "admin" |
| `ADMIN_PASSWORD` | Admin password | No | "admin" |

## License

MIT