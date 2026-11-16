import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export default function ProfileCheck() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setError(null);
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .single();

      if (fetchError) {
        setError(fetchError.message);
        setProfile(null);
      } else {
        setProfile(data);
        setError(null);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  if (authLoading) {
    return (
      <div className="p-4 rounded-lg bg-gray-100 text-gray-700 text-sm">
        Checking authentication status...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
        <p className="font-semibold">ProfileCheck Component (Test Mode)</p>
        <p>No authenticated user detected. Sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-md space-y-4 border border-gray-200 my-4 text-left">
      <div className="border-b pb-2">
        <h3 className="text-lg font-bold text-gray-900">Profile Check (Test Component)</h3>
        <p className="text-xs text-gray-500">User ID: {user.id}</p>
        <p className="text-xs text-gray-500">Email: {user.email}</p>
      </div>

      {loading && (
        <p className="text-sm text-blue-600">Fetching profile from Supabase...</p>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          <p className="font-semibold">Error fetching profile:</p>
          <p className="font-mono text-xs mt-1">{error}</p>
        </div>
      )}

      {profile && (
        <div className="space-y-2 text-sm text-gray-800">
          <p className="font-semibold text-emerald-600">Profile loaded successfully!</p>
          <pre className="bg-gray-50 p-3 rounded border text-xs overflow-x-auto text-gray-700">
            {JSON.stringify(profile, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

