import React from 'react';
import { Bell, Search, Menu, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function TopBar({ title, subtitle }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error('Failed to log out:', err);
    }
  };

  const userEmail = user?.email || 'student@vestigia.app';

  return (
    <div className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between flex-shrink-0">
      {/* Left side: Mobile Menu (visible on small screens) + Title */}
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md">
          <Menu className="w-5 h-5" />
        </button>
        <div>
          {subtitle && (
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
              {subtitle}
            </p>
          )}
          <h1 className="text-xl font-bold text-gray-900 leading-none capitalize">
            {title}
          </h1>
        </div>
      </div>

      {/* Right side: Search, Notifications, User info & Logout */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="relative hidden sm:block">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-40 lg:w-56 transition-all"
          />
        </div>
        
        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors" title="Notifications">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>

        {/* User Email Pill */}
        <div className="hidden md:flex items-center gap-2 pl-2 border-l border-gray-200 text-xs text-gray-600 font-medium">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            {userEmail.charAt(0).toUpperCase()}
          </div>
          <span className="max-w-[130px] truncate" title={userEmail}>
            {userEmail}
          </span>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          title="Sign out of Vestigia"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200/60"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </div>
  );
}
