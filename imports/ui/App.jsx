import React, { useState, useEffect } from 'react';
import { MongoDBInsights } from './MongoDBInsights.jsx';
import { Login } from './Login.jsx';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';

export const App = () => {
  const { isAuthenticated } = useTracker(() => {
    return {
      isAuthenticated: !!Meteor.userId()
    };
  });

  const handleLogin = (credentials) => {
    Meteor.loginWithPassword(credentials.username, credentials.password, (error) => {
      if (error) {
        console.error('Login failed:', error.reason);
      }
    });
  };

  const handleLogout = () => {
    Meteor.logout((error) => {
      if (error) {
        console.error('Logout failed:', error.reason);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto sm:pt-10">
        <header className="flex justify-between items-center mb-8 px-4">
          <a 
            href="https://www.quave.cloud" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center"
          >
            <img 
              src="https://zcloud-static-assets.s3.amazonaws.com/zcloud-images/zcloud-logo.svg" 
              alt="Quave Cloud Logo" 
              className="h-12"
            />
          </a>
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          )}
        </header>
        
        {isAuthenticated ? (
          <MongoDBInsights />
        ) : (
          <Login onLogin={handleLogin} />
        )}
      </div>
    </div>
  );
};