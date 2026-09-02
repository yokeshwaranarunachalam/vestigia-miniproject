import React from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  GraduationCap, 
  Award, 
  Briefcase, 
  Trophy, 
  Code, 
  MessageSquare,
  User
} from 'lucide-react';

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'academics', label: 'Academics', icon: GraduationCap, path: '/academics' },
  { id: 'certificates', label: 'Certificates', icon: Award, path: '/certificates' },
  { id: 'projects', label: 'Projects', icon: Briefcase, path: '/projects' },
  { id: 'achievements', label: 'Achievements', icon: Trophy, path: '/achievements' },
  { id: 'hackathons', label: 'Hackathons', icon: Code, path: '/hackathons' },
];

export default function Sidebar({ activePage, onNavigate, userName }) {
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="w-[220px] h-screen bg-gray-50 border-r border-gray-200 flex flex-col hidden md:flex flex-shrink-0">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3 border-b border-gray-200">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <GraduationCap className="text-white w-5 h-5" />
        </div>
        <span className="text-xl font-bold text-gray-900 tracking-tight">Vestigia</span>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          
          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                isActive 
                  ? 'bg-blue-50 text-blue-600 font-medium' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
        
        {/* AI Assistant - special trigger */}
        <button
          onClick={() => onNavigate('ai-assistant')}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-purple-600 hover:bg-purple-50 font-medium mt-2 border border-purple-100"
        >
          <MessageSquare className="w-5 h-5" />
          <span>AI Assistant</span>
        </button>
      </div>

      {/* Profile Card */}
      <div className="p-4 border-t border-gray-200">
        <Link 
          to="/profile"
          onClick={() => onNavigate('profile')}
          className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 transition-colors"
        >
          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
            {getInitials(userName)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {userName || 'Student'}
            </p>
            <p className="text-xs text-gray-500 truncate">View Profile</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
