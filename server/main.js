import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { ADMIN_USERNAME, ADMIN_PASSWORD } from './env';
import { setAuthenticationHook, configureAnalysisConnection } from 'meteor/mongodb-insights';

Meteor.startup(async () => {
    // Create admin user if it doesn't exist
    const adminUser = await Accounts.findUserByUsername(ADMIN_USERNAME);
    if (!adminUser) {
        console.log('Creating admin user...');
        Accounts.createUser({
            username: ADMIN_USERNAME,
            password: ADMIN_PASSWORD,
        });
    }

    // Configure alternative MongoDB connection if MONGO_ANALYSIS_URL is defined
    if (process.env.MONGO_ANALYSIS_URL) {
        console.log('Configuring alternative MongoDB connection for analysis (read-only)...');
        await configureAnalysisConnection(process.env.MONGO_ANALYSIS_URL);
    }

    // Set authentication hook for MongoDB Insights
    setAuthenticationHook(async () => {
        const userId = Meteor.userId();
        if (!userId) {
            return false;
        }
        const user = await Meteor.users.findOneAsync(userId);
        return user?.username === ADMIN_USERNAME;
    });
});
