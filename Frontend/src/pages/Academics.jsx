import React, { useState } from 'react';
import SemesterPill from '../components/SemesterPill';
import { mockSemesters, mockStats } from '../lib/mockData';
import { Download, Upload, BookOpen, TrendingUp } from 'lucide-react';

export default function Academics() {
  const [activeSem, setActiveSem] = useState(mockSemesters[0].number);

  const currentSemesterData = mockSemesters.find(s => s.number === activeSem) || mockSemesters[0];

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 hidden">Academics</h1> {/* Handled by TopBar */}
        <div className="w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide flex gap-2">
          {mockSemesters.map((sem) => (
            <SemesterPill 
              key={sem.number} 
              number={sem.number} 
              isActive={activeSem === sem.number} 
              onClick={setActiveSem} 
            />
          ))}
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm">
            <Upload className="w-4 h-4" /> <span className="hidden sm:inline">Upload Marksheet</span>
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm">
            <Download className="w-4 h-4" /> <span className="hidden sm:inline">Download Report</span>
          </button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 shadow-sm hover:border-blue-200 transition-colors">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Semester {activeSem} GPA</p>
            <p className="text-2xl font-bold text-gray-900">{currentSemesterData.gpa.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 shadow-sm hover:border-blue-200 transition-colors">
          <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Overall CGPA</p>
            <p className="text-2xl font-bold text-gray-900">{mockStats.cgpa.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Subjects Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-900">Academic Record - Sem {activeSem}</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="px-6 py-4">Subject Name</th>
                <th className="px-6 py-4 text-center">Credits</th>
                <th className="px-6 py-4 text-center">Grade</th>
                <th className="px-6 py-4 text-right">Grade Point</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {currentSemesterData.subjects.map((subject, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{subject.name}</td>
                  <td className="px-6 py-4 text-center text-gray-600">{subject.credits}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full font-bold text-xs ${
                      subject.grade === 'O' || subject.grade === 'A+' ? 'bg-emerald-100 text-emerald-700' :
                      subject.grade === 'A' ? 'bg-blue-100 text-blue-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {subject.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-700">{subject.gradePoint.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
            {/* Table Footer Summary */}
            <tfoot className="bg-gray-50 border-t border-gray-200">
              <tr>
                <td className="px-6 py-4 font-bold text-gray-900 text-right uppercase text-xs tracking-wider" colSpan="3">
                  Total SGPA
                </td>
                <td className="px-6 py-4 text-right font-bold text-blue-600 text-lg">
                  {currentSemesterData.gpa.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
