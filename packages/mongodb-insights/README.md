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

## Quick Start

1. Configure authentication in your server code:

```javascript
import { setAuthenticationHook } from 'meteor/mongodb-insights';

setAuthenticationHook(() => {
  const user = Meteor.user();
  return user && user.isAdmin;
});
```

2. Optional: Configure a separate MongoDB connection for analysis:

```javascript
import { setMongoConnectionHook } from 'meteor/mongodb-insights';
import { MongoClient } from 'mongodb';

const mongoClient = new MongoClient(process.env.MONGO_ANALYSIS_URL);
await mongoClient.connect();
setMongoConnectionHook(() => mongoClient.db());
```

## Core Features

### Profile Management
- Set profiling levels (0: off, 1: slow queries, 2: all queries)
- Configure minimum query execution time threshold
- Filter by collection and date range

### Query Analysis
Provides detailed insights including:
- Query execution time
- Index usage
- Scan-to-return ratios
- Performance recommendations
- Suggested indexes

### Security
- Built-in authentication system
- Role-based access control
- Configurable security hooks

## API Reference

### Server Methods

#### `mongodb.profile.status()`
Returns current MongoDB profiling status.

#### `mongodb.profile.set(level)`
Sets profiling level:
- `0`: Disabled
- `1`: Collect slow queries
- `2`: Collect all queries

#### `mongodb.profile.analyze(params)`
Analyzes queries with optional filters:

```javascript
{
  minMillis: 100,        // Minimum execution time
  collection: 'users',   // Target collection
  startDate: new Date(), // Analysis start date
  endDate: new Date()    // Analysis end date
}
```

## Best Practices

1. Start with profiling level 1 in production
2. Use date ranges to limit analysis scope
3. Review index recommendations before implementation
4. Monitor slow queries regularly
5. Implement proper access control

## Environment Variables

- `ADMIN_USERNAME`: Admin user login (default: 'admin')
- `ADMIN_PASSWORD`: Admin password (default: 'admin')
- `MONGO_ANALYSIS_URL`: Optional separate MongoDB connection

## UI Features

- Dark mode interface
- Query result pagination
- Severity-based filtering
- Expandable query details
- Real-time updates

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

MIT