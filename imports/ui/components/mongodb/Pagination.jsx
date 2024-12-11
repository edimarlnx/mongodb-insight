import React from 'react';

export const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <div className="flex items-center gap-2">
    <button
      onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
      disabled={currentPage === 1}
      className="px-3 py-1 rounded bg-gray-700 text-white disabled:bg-gray-800 disabled:text-gray-500"
    >
      Previous
    </button>
    <span className="text-gray-300">
      Page {currentPage} of {totalPages}
    </span>
    <button
      onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
      disabled={currentPage === totalPages}
      className="px-3 py-1 rounded bg-gray-700 text-white disabled:bg-gray-800 disabled:text-gray-500"
    >
      Next
    </button>
  </div>
); 