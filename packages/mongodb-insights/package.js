Package.describe({
  name: 'mongodb-insights',
  version: '0.0.1',
  summary: 'MongoDB insights and monitoring for Meteor applications',
  git: '',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom(['2.7.3', '3.0']);
  
  api.use(['ecmascript', 'mongo']);
  api.imply('mongo');
  api.mainModule('mdb-insights-server.js', 'server');
  api.export('setAuthenticationHook', 'server');
});

