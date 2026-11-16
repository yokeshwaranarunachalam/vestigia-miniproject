import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Activity, CheckCircle, XCircle, RefreshCw, X, AlertTriangle } from 'lucide-react';

export default function BackendHealth() {
  const [isOpen, setIsOpen] = useState(false);
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState({
    auth: { status: 'pending', message: '' },
    tables: {},
    storage: { status: 'pending', message: '' },
    rpc: {},
    functions: {}
  });

  const runHealthCheck = useCallback(async () => {
    setChecking(true);
    const newResults = {
      auth: { status: 'checking', message: '' },
      tables: {},
      storage: { status: 'checking', message: '' },
      rpc: {},
      functions: {}
    };

    // 1. Check Auth / Session
    try {
      const { data: { session }, error: authErr } = await supabase.auth.getSession();
      if (authErr) {
        newResults.auth = { status: 'error', message: authErr.message };
      } else {
        newResults.auth = { 
          status: 'ok', 
          message: session ? `Logged in as ${session.user.email}` : 'No active session (Public access ok)' 
        };
      }
    } catch (e) {
      newResults.auth = { status: 'error', message: e.message };
    }

    // 2. Check Database Tables
    const requiredTables = [
      'profiles', 
      'semesters', 
      'certificates', 
      'projects', 
      'achievements', 
      'hackathons', 
      'uploads'
    ];

    for (const table of requiredTables) {
      try {
        const { error } = await supabase.from(table).select('id').limit(1);
        if (error) {
          if (error.code === 'PGRST204' || error.message.includes('relation') || error.message.includes('schema cache')) {
            newResults.tables[table] = { status: 'error', message: 'Table missing! Run setup_all.sql' };
          } else {
            newResults.tables[table] = { status: 'warning', message: error.message };
          }
        } else {
          newResults.tables[table] = { status: 'ok', message: 'Ready' };
        }
      } catch (e) {
        newResults.tables[table] = { status: 'error', message: e.message };
      }
    }

    // 3. Check Storage Bucket 'certificates'
    try {
      const { data: buckets, error: storageErr } = await supabase.storage.listBuckets();
      if (storageErr) {
        newResults.storage = { status: 'error', message: storageErr.message };
      } else {
        const hasBucket = buckets?.some(b => b.name === 'certificates');
        if (hasBucket) {
          newResults.storage = { status: 'ok', message: 'certificates bucket exists' };
        } else {
          newResults.storage = { status: 'error', message: 'Bucket missing! Run setup_all.sql' };
        }
      }
    } catch (e) {
      newResults.storage = { status: 'error', message: e.message };
    }

    // 4. Check RPC functions
    try {
      const { error: rpcErr } = await supabase.rpc('get_dashboard');
      if (rpcErr && (rpcErr.message.includes('does not exist') || rpcErr.code === 'PGRST202')) {
        newResults.rpc['get_dashboard'] = { status: 'error', message: 'RPC missing! Run setup_all.sql' };
      } else {
        newResults.rpc['get_dashboard'] = { status: 'ok', message: 'Ready' };
      }
    } catch (e) {
      newResults.rpc['get_dashboard'] = { status: 'error', message: e.message };
    }

    // 5. Check Edge Functions (get-academics)
    try {
      const { error: fnErr } = await supabase.functions.invoke('get-academics', {
        body: { semester: 1 }
      });
      if (fnErr && fnErr.message.includes('Failed to send a request to the Edge Function')) {
        newResults.functions['get-academics'] = { status: 'error', message: 'Not deployed yet' };
      } else {
        newResults.functions['get-academics'] = { status: 'ok', message: 'Reachable' };
      }
    } catch (e) {
      newResults.functions['get-academics'] = { status: 'error', message: e.message };
    }

    setResults(newResults);
    setChecking(false);
  }, []);

  useEffect(() => {
    runHealthCheck();
  }, [runHealthCheck]);

  // Evaluate general health status
  const tableValues = Object.values(results.tables);
  const hasTableError = tableValues.some(t => t.status === 'error');
  const hasStorageError = results.storage.status === 'error';
  const hasFunctionError = Object.values(results.functions).some(f => f.status === 'error');
  const overallError = hasTableError || hasStorageError;

  return (
    <>
      {/* Floating Dev Health Badge */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg transition-all ${
            checking
              ? 'bg-gray-800 text-gray-200'
              : overallError
              ? 'bg-rose-600 text-white animate-pulse hover:bg-rose-700'
              : hasFunctionError
              ? 'bg-amber-600 text-white hover:bg-amber-700'
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}
          title="Supabase Dev Health Check"
        >
          <Activity className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
          <span>
            {checking
              ? 'Checking...'
              : overallError
              ? 'DB Setup Needed'
              : hasFunctionError
              ? 'Deploy Functions'
              : 'Backend Ready'}
          </span>
        </button>
      </div>

      {/* Diagnostics Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-gray-900 text-base">Backend Health Diagnostics</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={runHealthCheck}
                  disabled={checking}
                  className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
                  title="Re-run health check"
                >
                  <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin text-indigo-600' : ''}`} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-sm">
              {overallError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-xs">Action Required: Tables or Storage missing</p>
                    <p className="text-xs mt-1">
                      Copy the contents of <span className="font-mono font-bold">supabase/setup_all.sql</span> and run it in the Supabase SQL Editor.
                    </p>
                  </div>
                </div>
              )}

              {/* Database Tables Section */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Database Tables
                </h4>
                <div className="grid grid-cols-1 gap-1.5">
                  {requiredTables.map((t) => {
                    const res = results.tables[t] || { status: 'checking', message: 'checking...' };
                    return (
                      <div
                        key={t}
                        className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 border border-gray-100 text-xs"
                      >
                        <span className="font-mono font-medium text-gray-800">{t}</span>
                        <div className="flex items-center gap-1.5">
                          <span className={res.status === 'ok' ? 'text-gray-500' : 'text-rose-600 font-medium'}>
                            {res.message}
                          </span>
                          {res.status === 'ok' ? (
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-500" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Storage Bucket */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Storage Buckets
                </h4>
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 border border-gray-100 text-xs">
                  <span className="font-mono font-medium text-gray-800">certificates</span>
                  <div className="flex items-center gap-1.5">
                    <span className={results.storage.status === 'ok' ? 'text-gray-500' : 'text-rose-600 font-medium'}>
                      {results.storage.message || 'Checking...'}
                    </span>
                    {results.storage.status === 'ok' ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500" />
                    )}
                  </div>
                </div>
              </div>

              {/* Edge Functions */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Edge Functions
                </h4>
                <div className="space-y-1.5">
                  {['get-academics', 'save-semester'].map((fn) => {
                    const res = results.functions[fn] || { status: 'checking', message: 'Checking...' };
                    return (
                      <div
                        key={fn}
                        className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 border border-gray-100 text-xs"
                      >
                        <span className="font-mono font-medium text-gray-800">{fn}</span>
                        <div className="flex items-center gap-1.5">
                          <span className={res.status === 'ok' ? 'text-gray-500' : 'text-amber-600 font-medium'}>
                            {res.message}
                          </span>
                          {res.status === 'ok' ? (
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

