import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap } from 'lucide-react';

/**
 * ProtectedRoute Wrapper
 * - Shows an elegant loading animation while checking Supabase auth status
 * - Redirects unauthenticated visitors to /login preserving the requested location
 * - Renders children when authenticated
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 animate-spin opacity-80 blur-sm"></div>
          <div className="absolute w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center border border-white/10 shadow-2xl">
            <GraduationCap className="w-6 h-6 text-blue-400 animate-pulse" />
          </div>
        </div>
        <p className="mt-5 text-sm font-medium text-slate-400 tracking-wide">
          Verifying your academic footprints...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
