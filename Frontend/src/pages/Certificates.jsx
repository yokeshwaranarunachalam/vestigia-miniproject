import React, { useState } from 'react';
import ModuleCard from '../components/ModuleCard';
import { mockCertificates } from '../lib/mockData';
import { Award, Plus, Search, Filter } from 'lucide-react';

export default function Certificates() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCertificates = mockCertificates.filter(cert => 
    cert.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    cert.provider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 hidden">Certificates</h1>
          <p className="text-gray-500 font-medium">You have earned <span className="text-blue-600 font-bold">{mockCertificates.length}</span> certificates</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm w-full sm:w-auto justify-center">
          <Plus className="w-4 h-4" /> Add Certificate
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search certificates by name or provider..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm sm:w-auto">
          <Filter className="w-4 h-4" /> <span className="hidden sm:inline">Filters</span>
        </button>
      </div>

      {/* Grid */}
      {filteredCertificates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCertificates.map(cert => (
            <ModuleCard 
              key={cert.id}
              icon={Award}
              title={cert.name}
              subtitle={`${cert.provider} • Issued ${new Date(cert.issueDate).getFullYear()}`}
              onView={() => console.log('View', cert.id)}
              onDownload={() => console.log('Download', cert.id)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl p-12 flex flex-col items-center justify-center text-center">
          <Award className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">No certificates found</h3>
          <p className="text-gray-500">We couldn't find any certificates matching "{searchTerm}"</p>
          <button 
            onClick={() => setSearchTerm('')}
            className="mt-4 text-blue-600 font-medium hover:underline"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}
