import React from 'react';
import { Eye, Download, Trash2, Edit2, GitBranch } from 'lucide-react';

export default function ModuleCard({ 
  icon: Icon, 
  title, 
  subtitle, 
  description,
  tags,
  githubUrl,
  onView, 
  onDownload, 
  onEdit,
  onDelete 
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all group flex flex-col h-full relative">
      <div className="h-32 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center border-b border-gray-100 group-hover:from-blue-100 group-hover:to-indigo-100 transition-colors relative">
        {Icon && <Icon className="w-12 h-12 text-blue-500 opacity-80" />}

        {(onEdit || onDelete) && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
            {onEdit && (
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-1.5 bg-white/90 hover:bg-white text-gray-400 hover:text-blue-600 rounded-lg shadow-sm border border-gray-200 transition-colors"
                title="Edit"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1.5 bg-white/90 hover:bg-white text-gray-400 hover:text-red-600 rounded-lg shadow-sm border border-gray-200 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
      
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 text-lg leading-tight mb-1 truncate" title={title}>
          {title}
        </h3>

        {description ? (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2" title={description}>
            {description}
          </p>
        ) : subtitle ? (
          <p className="text-sm text-gray-500 mb-4 truncate" title={subtitle}>
            {subtitle}
          </p>
        ) : null}

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4 mt-auto">
            {tags.map((tag, idx) => (
              <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-medium border border-gray-200">
                {tag}
              </span>
            ))}
          </div>
        )}
        
        {(onView || onDownload || githubUrl) && (
          <div className="mt-auto flex gap-2 pt-2">
            {onView && (
              <button 
                type="button"
                onClick={onView}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
              >
                <Eye className="w-4 h-4" /> View
              </button>
            )}
            {githubUrl && (
              <a 
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                title="GitHub Repository"
              >
                <GitBranch className="w-4 h-4 text-gray-600" /> <span className="text-xs">GitHub</span>
              </a>
            )}
            {onDownload && (
              <button 
                type="button"
                onClick={onDownload}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700 hover:shadow-sm transition-all"
              >
                <Download className="w-4 h-4" /> Download
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
