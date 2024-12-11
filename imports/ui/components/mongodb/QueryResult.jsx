import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';

export const QueryResult = ({ result, index, onCreateIndex }) => {
  const [isExpanded, setIsExpanded] = useState(false);

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

  return (
    <div className="mb-6 p-4 bg-gray-800 shadow rounded">
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
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-200"
          >
            Query Details
            {isExpanded ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {isExpanded && result.queryDetails && (
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
                <div className="mt-1">
                  <div className="p-2 bg-gray-900 rounded font-mono text-sm text-blue-400">
                    {issue.recommendedIndex}
                  </div>
                  <button
                    onClick={() => onCreateIndex(issue.recommendedIndex)}
                    className="mt-2 px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-1"
                  >
                    Create Index
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 