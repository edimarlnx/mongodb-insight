# MongoDB Insights for Meteor

MongoDB Insights is a Meteor package that provides monitoring and analysis tools for MongoDB operations in your Meteor application. It helps you identify performance issues, slow queries, and provides index recommendations.

## Installation

```bash
meteor add mongodb-insights
```

## Features

- Query profiling and analysis
- Slow query detection
- Index usage monitoring
- Performance recommendations
- Customizable authentication

## Usage

### Basic Setup

First, import and configure the authentication hook in your server code:

```javascript
import { setAuthenticationHook } from 'meteor/mongodb-insights';

// Example: Only allow admin users to access insights
setAuthenticationHook(() => {
  const user = Meteor.user();
  return user && user.isAdmin;
});
```

### Available Methods

#### 1. Profile Status

Check the current profiling status:

```javascript
Meteor.call('mongodb.profile.status', (error, result) => {
  if (!error) {
    console.log('Profile status:', result);
  }
});
```

#### 2. Set Profile Level

Set the profiling level (0: off, 1: slow queries, 2: all queries):

```javascript
Meteor.call('mongodb.profile.set', 1, (error, result) => {
  if (!error) {
    console.log('Profile level set');
  }
});
```

#### 3. Query Analysis

Analyze queries with custom filters:

```javascript
const params = {
  minMillis: 100,        // Minimum execution time in milliseconds (default: 100)
  collection: 'users',   // Optional: Filter by collection name
  startDate: new Date('2024-01-01'), // Optional: Filter by start date
  endDate: new Date()    // Optional: Filter by end date
};

Meteor.call('mongodb.profile.analyze', params, (error, results) => {
  if (!error) {
    results.forEach(result => {
      console.log('Namespace:', result.namespace);
      console.log('Operation:', result.operation);
      console.log('Query:', result.query);
      console.log('Execution time:', result.executionTime);
      console.log('Timestamp:', result.timestamp);
      console.log('Issues:', result.issues);
    });
  }
});
```

### Analysis Results

The analysis provides information about:

- Queries not using indexes
- High scan-to-return ratios
- Slow queries (>1000ms)
- Index recommendations

Each issue includes:
- Type of issue
- Severity (low, medium, high)
- Description message
- Suggested solution
- Recommended index creation command (when applicable)

## Security

By default, the package requires authentication to be configured. Use `setAuthenticationHook` to define your access control logic:

```javascript
import { setAuthenticationHook } from 'meteor/mongodb-insights';

setAuthenticationHook(() => {
  // Your authentication logic here
  // Return true to allow access, false to deny
  return Meteor.user()?.roles?.includes('dbAdmin');
});
```

## API Reference

### Methods

#### `mongodb.profile.status()`
Returns the current profiling status of MongoDB.

#### `mongodb.profile.set(level)`
Sets the profiling level:
- `0`: Profiling off
- `1`: Profile slow queries (>100ms)
- `2`: Profile all queries

#### `mongodb.profile.queries(params)`
Retrieves raw profiled queries with optional filters:
- `minMillis`: Minimum query time in milliseconds (default: 100)
- `collection`: Filter by collection name
- `startDate`: Start date for query range
- `endDate`: End date for query range

#### `mongodb.profile.analyze(params)`
Analyzes queries and provides performance recommendations. Accepts the same parameters as `mongodb.profile.queries`.

Returns an array of analyzed queries, each containing:
- `operation`: Type of operation ('query' or 'command')
- `namespace`: Database and collection name
- `query`: The query object
- `executionTime`: Query execution time in milliseconds
- `timestamp`: When the query was executed
- `issues`: Array of detected issues, each containing:
  - `type`: Issue type ('NO_INDEX', 'HIGH_SCAN_RATIO', or 'SLOW_QUERY')
  - `severity`: Issue severity ('low', 'medium', or 'high')
  - `message`: Description of the issue
  - `suggestion`: Recommended action
  - `recommendedIndex`: Suggested index creation command (when applicable)

## Best Practices

1. Start with profiling level 1 in production to capture slow queries
2. Use specific date ranges when analyzing queries to limit data volume
3. Implement proper authentication to protect sensitive query data
4. Review and test recommended indexes before applying them in production

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.