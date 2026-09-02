import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

export default function AchievementCard({ icon: Icon, title, metadata, description, onView, onEdit, onDelete }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-200 hover:shadow-md transition-all flex flex-col sm:flex-row gap-5 items-start relative group">
      <div className="w-14 h-14 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0">
        {Icon && <Icon className="w-7 h-7 text-orange-500" />}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <h3 className="text-lg font-bold text-gray-900 truncate pr-16">{title}</h3>
          
          <div className="flex items-center gap-2 sm:absolute sm:top-5 sm:right-5 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button onClick={onEdit} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md">
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button onClick={onDelete} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3 text-sm">
          {metadata && Object.entries(metadata).map(([key, value]) => (
            <div key={key} className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
              <span className="font-medium capitalize text-gray-500">{key}:</span> 
              <span className="text-gray-800">{value}</span>
            </div>
          ))}
        </div>
        
        <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
