import React from 'react';
import { mockUser, mockStats, mockAchievements } from '../lib/mockData';
import { Edit2, LogOut, Mail, Building, Calendar, Award, Briefcase, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // In a real app, you would clear context/tokens here
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      {/* Profile Header Card */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm relative">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        
        <div className="px-6 pb-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 mb-6">
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 rounded-full bg-white p-1.5 shadow-md">
                <div className="w-full h-full rounded-full bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-600">
                  {mockUser.initials}
                </div>
              </div>
              <div className="pb-2">
                <h1 className="text-2xl font-bold text-gray-900">{mockUser.name}</h1>
                <p className="text-gray-500 font-medium">Computer Science Student</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm">
                <Edit2 className="w-4 h-4" /> Edit Profile
              </button>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 border border-red-200 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors shadow-sm"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
              <Mail className="w-5 h-5 text-gray-400" />
              <span>{mockUser.email}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
              <Building className="w-5 h-5 text-gray-400" />
              <span>{mockUser.institution}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 md:col-span-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span>Joined August 2022 • Graduating May 2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <h2 className="text-lg font-semibold text-gray-900 mt-2">Activity Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <Award className="w-6 h-6" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{mockStats.certificates}</p>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Certificates</p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <Briefcase className="w-6 h-6" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{mockStats.projects}</p>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Projects</p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-3">
            <Trophy className="w-6 h-6" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{mockAchievements.length}</p>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Achievements</p>
        </div>
      </div>
    </div>
  );
}
