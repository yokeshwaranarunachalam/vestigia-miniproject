import React from 'react';
import { Eye, Download } from 'lucide-react';

export default function ModuleCard({ icon: Icon, title, subtitle, onView, onDownload }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all group flex flex-col h-full">
      <div className="h-32 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center border-b border-gray-100 group-hover:from-blue-100 group-hover:to-indigo-100 transition-colors">
        {Icon && <Icon className="w-12 h-12 text-blue-500 opacity-80" />}
      </div>
      
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 text-lg leading-tight mb-1 truncate" title={title}>
          {title}
        </h3>
        <p className="text-sm text-gray-500 mb-6 truncate" title={subtitle}>
          {subtitle}
        </p>
        
        <div className="mt-auto flex gap-2">
          {onView && (
            <button 
              onClick={onView}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
            >
              <Eye className="w-4 h-4" /> View
            </button>
          )}
          {onDownload && (
            <button 
              onClick={onDownload}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700 hover:shadow-sm transition-all"
            >
              <Download className="w-4 h-4" /> Download
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
