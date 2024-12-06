import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';

export const MongoDBInsights = () => {
  const [profileLevel, setProfileLevel] = useState(0);
  const [minMillis, setMinMillis] = useState('100');
  const [collection, setCollection] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [expandedQueries, setExpandedQueries] = useState(new Set());

  const handleSetProfileLevel = (level) => {
    setLoading(true);
    Meteor.call('mongodb.profile.set', level, (error) => {
      setLoading(false);
      if (error) {
        setError(error.message);
      } else {
        setProfileLevel(level);
        setError(null);
      }
    });
  };

  const handleAnalyze = () => {
    setLoading(true);
    setCurrentPage(1);
    const params = {
      minMillis: parseInt(minMillis, 10),
      collection: collection || undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined
    };

    Meteor.call('mongodb.profile.analyze', params, (error, result) => {
      setLoading(false);
      if (error) {
        setError(error.message);
      } else {
        setResults(result);
        setError(null);
      }
    });
  };

  const paginatedResults = () => {
    if (!results) return [];
    
    const filteredResults = results.filter(result => {
      if (severityFilter === 'all') return true;
      return result.issues.some(issue => 
        issue.severity.toLowerCase() === severityFilter.toLowerCase()
      );
    });
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredResults.slice(startIndex, endIndex);
  };

  const totalPages = results ? Math.ceil(paginatedResults().length / itemsPerPage) : 0;

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'bg-red-600';
      case 'medium':
        return 'bg-yellow-600';
      case 'low':
        return 'bg-blue-600';
      default:
        return 'bg-gray-600';
    }
  };

  const toggleQueryDetails = (index) => {
    setExpandedQueries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <div className="p-6 bg-gray-900">
      <h1 className="text-2xl font-bold mb-6 text-white">MongoDB Insights</h1>
      
      {/* Profile Level Controls */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2 text-white">Profile Level</h2>
        <div className="flex gap-2">
          {[0, 1, 2].map((level) => (
            <button
              key={level}
              onClick={() => handleSetProfileLevel(level)}
              className={`px-4 py-2 rounded ${
                profileLevel === level
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              }`}
            >
              Level {level}
            </button>
          ))}
        </div>
      </div>

      {/* Analysis Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">Min Milliseconds</label>
          <input
            type="number"
            value={minMillis}
            onChange={(e) => setMinMillis(e.target.value)}
            className="w-full p-2 border rounded bg-gray-800 border-gray-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">Collection</label>
          <input
            type="text"
            value={collection}
            onChange={(e) => setCollection(e.target.value)}
            className="w-full p-2 border rounded bg-gray-800 border-gray-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">Start Date</label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-2 border rounded bg-gray-800 border-gray-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">End Date</label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full p-2 border rounded bg-gray-800 border-gray-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-800 disabled:text-gray-300"
      >
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-900 border border-red-700 text-red-200 rounded">
          {error}
        </div>
      )}

      {/* Results Display */}
      {results && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Analysis Results</h2>
            <div className="flex items-center gap-4">
              <select
                value={severityFilter}
                onChange={(e) => {
                  setSeverityFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-gray-800 border border-gray-700 text-white rounded px-3 py-1"
              >
                <option value="all">All Severities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-gray-800 border border-gray-700 text-white rounded px-3 py-1"
              >
                {[5, 10, 20, 50].map((value) => (
                  <option key={value} value={value}>
                    {value} per page
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded bg-gray-700 text-white disabled:bg-gray-800 disabled:text-gray-500"
                >
                  Previous
                </button>
                <span className="text-gray-300">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded bg-gray-700 text-white disabled:bg-gray-800 disabled:text-gray-500"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
          
          {paginatedResults().map((result, index) => (
            <div key={index} className="mb-6 p-4 bg-gray-800 shadow rounded">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="mb-2 text-gray-200">
                    <span className="font-semibold">Operation:</span> {result.operation}
                  </div>
                  <div className="mb-2 text-gray-200">
                    <span className="font-semibold">Namespace:</span> {result.namespace}
                  </div>
                  <div className="mb-2 text-gray-200">
                    <span className="font-semibold">Execution Time:</span> {result.executionTime}ms
                  </div>
                  <div className="mb-2 text-gray-200">
                    <span className="font-semibold">Timestamp:</span>{' '}
                    {result.timestamp ? new Date(result.timestamp).toLocaleString() : 'N/A'}
                  </div>
                </div>
                
                {result.queryDetails && (
                  <button
                    onClick={() => toggleQueryDetails(index)}
                    className="flex items-center gap-1 px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-200"
                  >
                    Query Details
                    {expandedQueries.has(index) ? (
                      <ChevronUpIcon className="w-4 h-4" />
                    ) : (
                      <ChevronDownIcon className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>

              {expandedQueries.has(index) && result.queryDetails && (
                <div className="mt-4 p-3 bg-gray-700 rounded">
                  <pre className="text-sm text-gray-200 overflow-x-auto">
                    {JSON.stringify(result.queryDetails, null, 2)}
                  </pre>
                </div>
              )}

              {result.issues.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2 text-gray-200">Issues:</h3>
                  {result.issues.map((issue, issueIndex) => (
                    <div key={issueIndex} className="ml-4 mb-2 p-2 bg-gray-700 rounded">
                      <div className="text-sm text-gray-200">
                        <span className="font-semibold">Type:</span> {issue.type}
                      </div>
                      <div className="text-sm text-gray-200">
                        <span className="font-semibold">Severity:</span>{' '}
                        <span className={`${getSeverityColor(issue.severity)} px-2 py-0.5 rounded-full text-xs`}>
                          {issue.severity}
                        </span>
                      </div>
                      <div className="text-sm text-gray-200">{issue.message}</div>
                      <div className="text-sm text-gray-400">{issue.suggestion}</div>
                      {issue.recommendedIndex && (
                        <div className="mt-1 p-2 bg-gray-900 rounded font-mono text-sm text-blue-400">
                          {issue.recommendedIndex}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 