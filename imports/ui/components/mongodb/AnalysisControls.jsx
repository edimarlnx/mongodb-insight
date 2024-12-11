import React from 'react';

export const AnalysisControls = ({ 
  minMillis, 
  collection, 
  startDate, 
  endDate,
  onMinMillisChange,
  onCollectionChange,
  onStartDateChange,
  onEndDateChange 
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <InputField
      label="Min Milliseconds"
      type="number"
      value={minMillis}
      onChange={onMinMillisChange}
    />
    <InputField
      label="Collection"
      type="text"
      value={collection}
      onChange={onCollectionChange}
    />
    <InputField
      label="Start Date"
      type="datetime-local"
      value={startDate}
      onChange={onStartDateChange}
    />
    <InputField
      label="End Date"
      type="datetime-local"
      value={endDate}
      onChange={onEndDateChange}
    />
  </div>
);

const InputField = ({ label, type, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium mb-1 text-gray-300">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      className="w-full p-2 border rounded bg-gray-800 border-gray-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
    />
  </div>
); 