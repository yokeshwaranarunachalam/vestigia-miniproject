import React from 'react';
import AchievementCard from '../components/AchievementCard';
import { mockAchievements } from '../lib/mockData';
import { Trophy, Plus } from 'lucide-react';

export default function Achievements() {
  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 hidden">Achievements</h1>
          <p className="text-gray-500 font-medium">You have <span className="text-orange-600 font-bold">{mockAchievements.length}</span> recognized achievements</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors shadow-sm w-full sm:w-auto justify-center">
          <Plus className="w-4 h-4" /> Add Achievement
        </button>
      </div>

      {/* List */}
      <div className="flex flex-col gap-4">
        {mockAchievements.map(achievement => (
          <AchievementCard 
            key={achievement.id}
            icon={Trophy}
            title={achievement.title}
            metadata={{
              organization: achievement.organization,
              date: new Date(achievement.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            }}
            description={achievement.description}
            onEdit={() => console.log('Edit', achievement.id)}
            onDelete={() => console.log('Delete', achievement.id)}
          />
        ))}
      </div>
    </div>
  );
}
