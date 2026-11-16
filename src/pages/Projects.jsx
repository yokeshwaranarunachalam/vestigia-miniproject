import React, { useState, useEffect, useCallback, useRef } from 'react';
import ModuleCard from '../components/ModuleCard';
import { 
  listProjects, 
  addProject, 
  updateProject, 
  deleteProject 
} from '../lib/projects';
import { 
  Briefcase, 
  Plus, 
  Search, 
  Filter, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';
import { friendlyError } from '../lib/errors';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState(null);

  // Modal State (Used for both Add and Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    techStack: '',
    projectUrl: '',
    githubUrl: '',
  });
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Debounce ref
  const debounceTimerRef = useRef(null);

  // Fetch projects from backend
  const fetchProjects = useCallback(async (query = '') => {
    setLoading(true);
    setListError(null);
    try {
      const data = await listProjects({ search: query });
      setProjects(data);
    } catch (err) {
      console.error('[Projects] Failed to list projects:', err);
      setListError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchProjects('');
  }, [fetchProjects]);

  // Debounced search (300 ms)
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchProjects(val);
    }, 300);
  };

  // Open modal for Add
  const handleOpenAddModal = () => {
    setEditingProject(null);
    setFormData({
      title: '',
      description: '',
      techStack: '',
      projectUrl: '',
      githubUrl: '',
    });
    setFormError(null);
    setSubmitSuccess(false);
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title || '',
      description: project.description || '',
      techStack: Array.isArray(project.tech_stack) ? project.tech_stack.join(', ') : '',
      projectUrl: project.project_url || '',
      githubUrl: project.github_url || '',
    });
    setFormError(null);
    setSubmitSuccess(false);
    setIsModalOpen(true);
  };

  // Submit handler (Add or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Client-side quick check
    if (!formData.title.trim()) {
      setFormError('Please enter a project title.');
      return;
    }
    if (formData.title.trim().length > 200) {
      setFormError('Project title cannot exceed 200 characters.');
      return;
    }
    if (formData.projectUrl && !/^https?:\/\//i.test(formData.projectUrl.trim())) {
      setFormError('Project URL must start with http:// or https://');
      return;
    }
    if (formData.githubUrl && !/^https?:\/\//i.test(formData.githubUrl.trim())) {
      setFormError('GitHub URL must start with http:// or https://');
      return;
    }

    setSubmitting(true);
    try {
      if (editingProject) {
        await updateProject(editingProject.id, {
          title: formData.title,
          description: formData.description,
          techStack: formData.techStack,
          projectUrl: formData.projectUrl,
          githubUrl: formData.githubUrl,
        });
      } else {
        await addProject({
          title: formData.title,
          description: formData.description,
          techStack: formData.techStack,
          projectUrl: formData.projectUrl,
          githubUrl: formData.githubUrl,
        });
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        fetchProjects(searchTerm);
      }, 700);
    } catch (err) {
      setFormError(friendlyError(err));
    } finally {
      setSubmitting(false);
    }
  };

  // Delete handler with confirmation
  const handleDelete = async (project) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${project.title}"?`);
    if (!confirmed) return;

    try {
      await deleteProject(project.id);
      await fetchProjects(searchTerm);
    } catch (err) {
      alert(`Failed to delete project: ${err.message}`);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 hidden">Projects</h1>
          <p className="text-gray-500 font-medium">
            You have built <span className="text-blue-600 font-bold">{projects.length}</span> projects
          </p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search projects by name or description..." 
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm sm:w-auto">
          <Filter className="w-4 h-4" /> <span className="hidden sm:inline">Filters</span>
        </button>
      </div>

      {/* List Error Banner */}
      {listError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{listError}</span>
        </div>
      )}

      {/* Grid or Empty State */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-gray-500">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
          <p className="text-sm">Loading projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 flex flex-col items-center justify-center text-center">
          <Briefcase className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">No projects found</h3>
          <p className="text-gray-500 max-w-sm mb-4">
            {searchTerm
              ? `We couldn't find any projects matching "${searchTerm}"`
              : "Showcase the web apps, mobile applications, and open-source software you've built."}
          </p>
          {searchTerm ? (
            <button 
              onClick={() => {
                setSearchTerm('');
                fetchProjects('');
              }}
              className="text-blue-600 font-medium hover:underline text-sm"
            >
              Clear search
            </button>
          ) : (
            <button 
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ModuleCard 
              key={project.id}
              icon={Briefcase}
              title={project.title}
              description={project.description}
              tags={project.tech_stack || []}
              onView={project.project_url ? () => window.open(project.project_url, '_blank', 'noopener,noreferrer') : null}
              githubUrl={project.github_url || null}
              onEdit={() => handleOpenEditModal(project)}
              onDelete={() => handleDelete(project)}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {editingProject ? 'Edit Project' : 'Add Project'}
                </h3>
                <p className="text-xs text-gray-500">
                  {editingProject ? 'Update project details and links' : 'Showcase a new project you built'}
                </p>
              </div>
              <button 
                onClick={() => !submitting && setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={submitting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {submitSuccess && (
                <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>Project saved successfully! Updating list...</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Project Title <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  maxLength={200}
                  placeholder="e.g. Student Skill Tracker"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  disabled={submitting}
                  className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Description (max 2000 chars)
                </label>
                <textarea 
                  rows="3"
                  maxLength={2000}
                  placeholder="Short description of what the project does, key architecture, or goals..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={submitting}
                  className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Tech Stack (comma-separated, max 20 items)
                </label>
                <input 
                  type="text"
                  placeholder="e.g. React, Node.js, PostgreSQL, Tailwind"
                  value={formData.techStack}
                  onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                  disabled={submitting}
                  className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Live Demo / Project URL
                  </label>
                  <input 
                    type="url"
                    placeholder="https://..."
                    value={formData.projectUrl}
                    onChange={(e) => setFormData({ ...formData, projectUrl: e.target.value })}
                    disabled={submitting}
                    className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    GitHub Repository URL
                  </label>
                  <input 
                    type="url"
                    placeholder="https://github.com/..."
                    value={formData.githubUrl}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    disabled={submitting}
                    className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || submitSuccess}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm disabled:opacity-50 transition-colors"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : editingProject ? (
                    'Save Changes'
                  ) : (
                    'Add Project'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
