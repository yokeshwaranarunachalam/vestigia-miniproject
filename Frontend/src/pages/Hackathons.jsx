import React from 'react';
import HackathonCard from '../components/HackathonCard';
import { mockHackathons } from '../lib/mockData';
import { Code, Plus } from 'lucide-react';

export default function Hackathons() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 hidden">Hackathons</h1>
          <p className="text-gray-500 font-medium">You have participated in <span className="text-indigo-600 font-bold">{mockHackathons.length}</span> hackathons</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-sm w-full sm:w-auto justify-center">
          <Plus className="w-4 h-4" /> Add Hackathon
        </button>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockHackathons.map(hackathon => (
          <HackathonCard 
            key={hackathon.id}
            {...hackathon}
          />
        ))}
      </div>
    </div>
  );
}
