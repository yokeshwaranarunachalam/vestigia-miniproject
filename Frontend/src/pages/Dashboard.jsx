import React from 'react';
import StatCard from '../components/StatCard';
import { mockStats, mockSemesters, mockRecentUploads } from '../lib/mockData';
import { 
  GraduationCap, 
  Award, 
  Briefcase, 
  Code,
  FileText,
  UploadCloud,
  MoreVertical
} from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      
      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Current CGPA" 
          value={mockStats.cgpa} 
          icon={GraduationCap} 
          trend={2.4} 
        />
        <StatCard 
          label="Total Certificates" 
          value={mockStats.certificates} 
          icon={Award} 
        />
        <StatCard 
          label="Projects Built" 
          value={mockStats.projects} 
          icon={Briefcase} 
        />
        <StatCard 
          label="Hackathons" 
          value={mockStats.hackathons} 
          icon={Code} 
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Section (60%) - GPA Trend Chart */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">GPA Trend by Semester</h2>
            <select className="bg-gray-50 border border-gray-200 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:border-blue-500">
              <option>All Semesters</option>
              <option>Year 1</option>
              <option>Year 2</option>
            </select>
          </div>
          
          {/* Custom SVG Bar Chart */}
          <div className="h-[250px] flex items-end justify-between gap-2 px-2 relative">
            {/* Background grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {[10, 8, 6, 4, 2, 0].map(val => (
                <div key={val} className="w-full border-b border-gray-100 flex items-center h-0">
                  <span className="absolute -left-5 text-[10px] text-gray-400 font-medium">{val}</span>
                </div>
              ))}
            </div>

            {/* Bars */}
            {mockSemesters.map((sem, idx) => {
              const heightPercentage = (sem.gpa / 10) * 100;
              return (
                <div key={sem.number} className="w-full flex flex-col items-center group relative z-10">
                  {/* Tooltip */}
                  <div className="absolute -top-10 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                    GPA: {sem.gpa}
                  </div>
                  
                  {/* Bar */}
                  <div 
                    className="w-full max-w-[48px] bg-blue-100 rounded-t-sm relative overflow-hidden group-hover:bg-blue-200 transition-colors cursor-pointer"
                    style={{ height: `${heightPercentage}%` }}
                  >
                    <div className="absolute bottom-0 w-full bg-blue-600 h-full rounded-t-sm origin-bottom scale-y-100 opacity-90 group-hover:opacity-100"></div>
                  </div>
                  
                  {/* Label */}
                  <span className="text-xs font-medium text-gray-500 mt-3">Sem {sem.number}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Section (40%) - Recent Uploads */}
        <div className="lg:col-span-1 bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Uploads</h2>
            <button className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-md transition-colors">
              <UploadCloud className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 flex flex-col gap-4">
            {mockRecentUploads.map((file) => (
              <div key={file.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors group cursor-pointer">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">{file.name}</h4>
                  <p className="text-xs text-gray-500">{(Math.random() * 2 + 1).toFixed(1)} MB • Just now</p>
                </div>
                <button className="text-gray-400 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            {/* Empty space filler if few items */}
            {mockRecentUploads.length < 5 && (
              <div className="mt-auto pt-6 pb-2 text-center">
                <p className="text-xs text-gray-400">View all files in your vault</p>
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}
