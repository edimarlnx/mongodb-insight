import React from 'react';
import { QueryResult } from './QueryResult';
import { Pagination } from './Pagination';

export const ResultsDisplay = ({
  results,
  currentPage,
  itemsPerPage,
  severityFilter,
  onSeverityFilterChange,
  onItemsPerPageChange,
  onPageChange,
  paginatedResults,
  totalPages
}) => (
  <div className="mt-6">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-semibold text-white">Analysis Results</h2>
      <div className="flex items-center gap-4">
        <select
          value={severityFilter}
          onChange={onSeverityFilterChange}
          className="bg-gray-800 border border-gray-700 text-white rounded px-3 py-1"
        >
          <option value="all">All Severities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select
          value={itemsPerPage}
          onChange={onItemsPerPageChange}
          className="bg-gray-800 border border-gray-700 text-white rounded px-3 py-1"
        >
          {[5, 10, 20, 50].map((value) => (
            <option key={value} value={value}>
              {value} per page
            </option>
          ))}
        </select>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </div>
    
    {paginatedResults.map((result, index) => (
      <QueryResult key={index} result={result} index={index} />
    ))}
  </div>
); 