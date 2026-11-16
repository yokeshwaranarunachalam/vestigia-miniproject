import React from 'react';
import { Calendar, MapPin, Users, Award, ExternalLink, Edit2, Trash2 } from 'lucide-react';

export default function HackathonCard({ 
  name, 
  date, 
  location, 
  projectTitle, 
  teamSize, 
  technologies = [], 
  outcome, 
  projectUrl,
  onEdit,
  onDelete 
}) {
  const formattedDate = date ? (() => {
    const parts = String(date).split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(Date.UTC(year, month, day));
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
      }
    }
    const d = new Date(date);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  })() : '—';

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all group flex flex-col justify-between">
      <div>
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-white flex justify-between items-start">
          <div className="min-w-0 pr-2">
            <h3 className="text-xl font-bold mb-1 truncate" title={name}>{name}</h3>
            <p className="text-indigo-100 text-sm font-medium truncate" title={projectTitle}>{projectTitle || 'Project Submission'}</p>
          </div>
          
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {outcome && (
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white border border-white/30">
                {outcome}
              </div>
            )}
            {(onEdit || onDelete) && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {onEdit && (
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }}
                    className="p-1 hover:bg-white/20 rounded text-white transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {onDelete && (
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    className="p-1 hover:bg-white/20 rounded text-white hover:text-red-200 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="p-5">
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              <span className="truncate">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              <span className="truncate">{location || 'Online'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              <span>Team of {teamSize || 1}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Award className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              <span className="font-medium text-indigo-700 truncate">{outcome || 'Participant'}</span>
            </div>
          </div>
          
          {technologies && technologies.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Tech Stack</p>
              <div className="flex flex-wrap gap-1.5">
                {technologies.map((tech, idx) => (
                  <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium border border-gray-200">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {projectUrl && (
        <div className="px-5 pb-5">
          <a 
            href={projectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 bg-indigo-50 text-indigo-700 font-medium rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors"
          >
            View Project Details <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  );
}
