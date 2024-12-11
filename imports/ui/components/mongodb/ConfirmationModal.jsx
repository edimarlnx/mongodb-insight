import React from 'react';

export const ConfirmationModal = ({ isOpen, onClose, onConfirm, indexDetails }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-lg max-w-lg w-full">
        <h3 className="text-xl font-bold mb-4 text-white">Create Index</h3>
        <p className="text-gray-300 mb-4">Are you sure you want to create this index?</p>
        <pre className="bg-gray-900 p-3 rounded mb-4 text-blue-400 overflow-x-auto">
          {indexDetails}
        </pre>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create Index
          </button>
        </div>
      </div>
    </div>
  );
}; 