import React from 'react';
import { Calendar, MapPin, Users, Award, ExternalLink } from 'lucide-react';

export default function HackathonCard({ name, date, location, projectTitle, teamSize, technologies = [], outcome }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all group">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-white flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold mb-1">{name}</h3>
          <p className="text-indigo-100 text-sm font-medium">{projectTitle}</p>
        </div>
        <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white border border-white/30">
          {outcome}
        </div>
      </div>
      
      <div className="p-5">
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span>{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-indigo-500" />
            <span className="truncate">{location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4 text-indigo-500" />
            <span>Team of {teamSize}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Award className="w-4 h-4 text-indigo-500" />
            <span className="font-medium text-indigo-700">{outcome}</span>
          </div>
        </div>
        
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
        
        <button className="w-full mt-6 py-2 bg-indigo-50 text-indigo-700 font-medium rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors">
          View Project Details <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
