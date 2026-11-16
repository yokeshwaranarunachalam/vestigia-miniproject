import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  Search, 
  Menu, 
  LogOut, 
  Award, 
  Briefcase, 
  Trophy, 
  Code, 
  Loader2, 
  X 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { searchAll } from '../lib/dashboard';

export default function TopBar({ title, subtitle }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Search state
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef(null);
  const debounceRef = useRef(null);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error('Failed to log out:', err);
    }
  };

  const userEmail = user?.email || 'student@vestigia.app';

  // Debounced search handler
  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (val.trim().length < 2) {
      setResults(null);
      setIsSearching(false);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    setShowDropdown(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const data = await searchAll(val);
        setResults(data);
      } catch (err) {
        console.warn('[TopBar] Search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const totalMatches = results
    ? (results.certificates?.length || 0) +
      (results.projects?.length || 0) +
      (results.achievements?.length || 0) +
      (results.hackathons?.length || 0)
    : 0;

  const handleNavigate = (path) => {
    setShowDropdown(false);
    setQuery('');
    navigate(path);
  };

  return (
    <div className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between flex-shrink-0 relative z-30">
      {/* Left side: Mobile Menu + Title */}
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
        
        {/* Global Search Box with Dropdown */}
        <div ref={searchContainerRef} className="relative hidden sm:block">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input 
            type="text" 
            placeholder="Search anything..." 
            value={query}
            onChange={handleQueryChange}
            onFocus={() => query.trim().length >= 2 && setShowDropdown(true)}
            className="pl-9 pr-8 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-48 lg:w-64 transition-all"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setShowDropdown(false);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Search Dropdown Popup */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden text-left z-50">
              <div className="px-3.5 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-500">
                <span>Search Results</span>
                {isSearching && (
                  <span className="flex items-center gap-1 text-blue-600">
                    <Loader2 className="w-3 h-3 animate-spin" /> Searching...
                  </span>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 text-sm">
                {!isSearching && totalMatches === 0 && (
                  <div className="p-4 text-center text-xs text-gray-500">
                    No results found for "{query}"
                  </div>
                )}

                {/* Certificates */}
                {results?.certificates?.length > 0 && (
                  <div className="p-2">
                    <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      <Award className="w-3.5 h-3.5 text-blue-500" /> Certificates
                    </div>
                    {results.certificates.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleNavigate('/certificates')}
                        className="px-2.5 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <p className="text-xs font-semibold text-gray-800 truncate">{item.title}</p>
                        <p className="text-[11px] text-gray-400 truncate">{item.provider || 'Certificate'}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Projects */}
                {results?.projects?.length > 0 && (
                  <div className="p-2">
                    <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      <Briefcase className="w-3.5 h-3.5 text-blue-500" /> Projects
                    </div>
                    {results.projects.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleNavigate('/projects')}
                        className="px-2.5 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <p className="text-xs font-semibold text-gray-800 truncate">{item.title}</p>
                        <p className="text-[11px] text-gray-400 truncate">{item.description || 'Project'}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Achievements */}
                {results?.achievements?.length > 0 && (
                  <div className="p-2">
                    <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      <Trophy className="w-3.5 h-3.5 text-orange-500" /> Achievements
                    </div>
                    {results.achievements.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleNavigate('/achievements')}
                        className="px-2.5 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <p className="text-xs font-semibold text-gray-800 truncate">{item.title}</p>
                        <p className="text-[11px] text-gray-400 truncate">{item.organization || 'Achievement'}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Hackathons */}
                {results?.hackathons?.length > 0 && (
                  <div className="p-2">
                    <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      <Code className="w-3.5 h-3.5 text-indigo-500" /> Hackathons
                    </div>
                    {results.hackathons.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleNavigate('/hackathons')}
                        className="px-2.5 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <p className="text-xs font-semibold text-gray-800 truncate">{item.event_name}</p>
                        <p className="text-[11px] text-gray-400 truncate">{item.project_name || item.prize || 'Hackathon'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Notifications */}
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
