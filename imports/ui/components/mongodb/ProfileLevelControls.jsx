import React from 'react';

export const ProfileLevelControls = ({ profileLevel, onSetProfileLevel }) => (
  <div className="mb-6">
    <h2 className="text-lg font-semibold mb-2 text-white">Profile Level</h2>
    <div className="flex gap-2">
      {[0, 1, 2].map((level) => (
        <button
          key={level}
          onClick={() => onSetProfileLevel(level)}
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
); 