import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import { getDashboard } from '../lib/dashboard';
import { 
  GraduationCap, 
  Award, 
  Briefcase, 
  Code, 
  FileText, 
  UploadCloud, 
  Loader2 
} from 'lucide-react';

function formatFileSize(bytes) {
  if (!bytes) return '< 1 MB';
  const mb = bytes / (1024 * 1024);
  if (mb < 0.1) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${mb.toFixed(1)} MB`;
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return 'Recently';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins <= 1 ? 'Just now' : `${mins}m ago`}`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const res = await getDashboard();
        setData(res);
      } catch (err) {
        console.warn('[Dashboard] Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const currentCgpa = data?.current_cgpa != null ? Number(data.current_cgpa).toFixed(2) : '—';
  const cgpaChange = data?.cgpa_change_percent != null ? Number(data.cgpa_change_percent) : null;
  const certificatesCount = data?.total_certificates ?? 0;
  const projectsCount = data?.projects_built ?? 0;
  const hackathonsCount = data?.hackathons ?? 0;
  const gpaTrend = data?.gpa_trend || [];
  const recentUploads = data?.recent_uploads || [];

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      
      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Current CGPA" 
          value={loading ? '—' : currentCgpa} 
          icon={GraduationCap} 
          trend={cgpaChange} 
        />
        <StatCard 
          label="Total Certificates" 
          value={loading ? 0 : certificatesCount} 
          icon={Award} 
        />
        <StatCard 
          label="Projects Built" 
          value={loading ? 0 : projectsCount} 
          icon={Briefcase} 
        />
        <StatCard 
          label="Hackathons" 
          value={loading ? 0 : hackathonsCount} 
          icon={Code} 
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Section (60%) - GPA Trend Chart Container */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">GPA Trend by Semester</h2>
            <select disabled={gpaTrend.length === 0} className="bg-gray-50 border border-gray-200 text-sm rounded-md px-3 py-1.5 text-gray-600 focus:outline-none">
              <option>All Semesters</option>
            </select>
          </div>
          
          {loading ? (
            <div className="h-[250px] flex items-center justify-center text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading GPA trend...
            </div>
          ) : gpaTrend.length > 0 ? (
            <div className="h-[250px] flex items-end justify-between gap-3 px-4 relative pt-4">
              {/* Background grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
                {[10, 8, 6, 4, 2, 0].map((val) => (
                  <div key={val} className="w-full border-b border-gray-100 flex items-center h-0">
                    <span className="absolute -left-2 text-[10px] text-gray-400 font-medium">{val}</span>
                  </div>
                ))}
              </div>

              {/* Bars */}
              {gpaTrend.map((sem) => {
                const heightPercentage = Math.min(100, Math.max(10, (Number(sem.gpa) / 10) * 100));
                return (
                  <div key={sem.semester} className="w-full flex flex-col items-center group relative z-10">
                    {/* Tooltip */}
                    <div className="absolute -top-8 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                      Sem {sem.semester}: {Number(sem.gpa).toFixed(2)} GPA
                    </div>
                    
                    {/* Bar */}
                    <div 
                      className="w-full max-w-[44px] bg-blue-100 rounded-t-sm relative overflow-hidden group-hover:bg-blue-200 transition-colors cursor-pointer"
                      style={{ height: `${heightPercentage}%` }}
                    >
                      <div className="absolute bottom-0 w-full bg-blue-600 h-full rounded-t-sm origin-bottom scale-y-100 opacity-90 group-hover:opacity-100"></div>
                    </div>
                    
                    {/* Label */}
                    <span className="text-xs font-medium text-gray-500 mt-2">Sem {sem.semester}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-[250px] flex flex-col items-center justify-center text-center p-6 border border-dashed border-gray-200 rounded-lg">
              <GraduationCap className="w-10 h-10 text-gray-300 mb-2" />
              <p className="text-sm font-medium text-gray-700">No GPA trend data yet</p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm">
                Your semester GPA progression will appear here once you upload marksheets in the Academics tab.
              </p>
            </div>
          )}
        </div>

        {/* Right Section (40%) - Recent Uploads */}
        <div className="lg:col-span-1 bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Uploads</h2>
            <button className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-1.5 rounded-md transition-colors" title="Upload files">
              <UploadCloud className="w-5 h-5" />
            </button>
          </div>
          
          {loading ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading uploads...
            </div>
          ) : recentUploads.length > 0 ? (
            <div className="flex-1 flex flex-col gap-3">
              {recentUploads.map((file) => (
                <div key={file.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors group">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 truncate" title={file.file_name}>
                      {file.file_name}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.file_size_bytes)} • <span className="capitalize">{file.kind}</span> • {formatRelativeTime(file.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-gray-200 rounded-lg">
              <FileText className="w-10 h-10 text-gray-300 mb-2" />
              <p className="text-sm font-medium text-gray-700">No recent uploads</p>
              <p className="text-xs text-gray-400 mt-1 max-w-xs">
                Uploaded marksheets and certificates will be listed here.
              </p>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
