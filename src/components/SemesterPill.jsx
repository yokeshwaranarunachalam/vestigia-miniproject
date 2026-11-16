import React from 'react';

export default function SemesterPill({ number, isActive, onClick }) {
  return (
    <button
      onClick={() => onClick(number)}
      className={`px-5 py-2 rounded-full font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
        isActive
          ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
          : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      Sem {number}
    </button>
  );
}
