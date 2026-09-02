import React from 'react';
import { Bell, Search, Menu } from 'lucide-react';

export default function TopBar({ title, subtitle }) {
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

      {/* Right side: Search & Notifications */}
      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-48 lg:w-64 transition-all"
          />
        </div>
        
        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
      </div>
    </div>
  );
}
