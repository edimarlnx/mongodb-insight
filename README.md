# MongoDB Insights

A Meteor package that provides real-time monitoring and analysis tools for MongoDB operations in your Meteor application.

For detailed documentation, please see [packages/mongodb-insights/README.md](packages/mongodb-insights/README.md).

## Quick Installation

```bash
meteor add mongodb-insights
```

## Key Features

- Real-time query profiling and analysis
- Slow query detection and alerting
- Index usage monitoring and recommendations
- Performance metrics visualization
- Secure authentication system
- Customizable monitoring parameters

## Running the Project

1. Clone the repository:

```bash
git clone <repository-url>
cd <project-directory>
```

2. Install dependencies:

```bash
meteor npm install
```

3. Start the application:

```bash
meteor run
```

The application will be available at `http://localhost:3000`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ADMIN_USERNAME` | Username for admin access | `admin` |
| `ADMIN_PASSWORD` | Password for admin access | `admin` |
| `MONGO_ANALYSIS_URL` | Optional MongoDB URL for separate analysis connection | - |

**Important:** Environment variables must be defined directly in the system environment. Adding them only to the `.env` file is not sufficient.

## License

MIT