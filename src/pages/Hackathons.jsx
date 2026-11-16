import React, { useState, useEffect, useCallback } from 'react';
import HackathonCard from '../components/HackathonCard';
import { 
  listHackathons, 
  addHackathon, 
  updateHackathon, 
  deleteHackathon 
} from '../lib/hackathons';
import { friendlyError } from '../lib/errors';
import { 
  Code, 
  Plus, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';

export default function Hackathons() {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState(null);

  // Modal State (Used for both Add and Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHackathon, setEditingHackathon] = useState(null);
  const [formData, setFormData] = useState({
    eventName: '',
    projectName: '',
    eventDate: '',
    location: '',
    teamSize: 1,
    prize: '',
    techStack: '',
    projectUrl: '',
  });
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch hackathons from backend
  const fetchHackathons = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      const data = await listHackathons();
      setHackathons(data);
    } catch (err) {
      console.error('[Hackathons] Failed to list hackathons:', err);
      setListError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHackathons();
  }, [fetchHackathons]);

  // Open modal for Add
  const handleOpenAddModal = () => {
    setEditingHackathon(null);
    setFormData({
      eventName: '',
      projectName: '',
      eventDate: '',
      location: '',
      teamSize: 1,
      prize: '',
      techStack: '',
      projectUrl: '',
    });
    setFormError(null);
    setSubmitSuccess(false);
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (hackathon) => {
    setEditingHackathon(hackathon);
    setFormData({
      eventName: hackathon.event_name || '',
      projectName: hackathon.project_name || '',
      eventDate: hackathon.event_date || '',
      location: hackathon.location || '',
      teamSize: hackathon.team_size || 1,
      prize: hackathon.prize || '',
      techStack: Array.isArray(hackathon.tech_stack) ? hackathon.tech_stack.join(', ') : '',
      projectUrl: hackathon.project_url || '',
    });
    setFormError(null);
    setSubmitSuccess(false);
    setIsModalOpen(true);
  };

  // Submit handler (Add or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.eventName.trim()) {
      setFormError('Please enter the hackathon event name.');
      return;
    }
    if (formData.eventName.trim().length > 200) {
      setFormError('Event name cannot exceed 200 characters.');
      return;
    }

    if (formData.teamSize) {
      const size = Number(formData.teamSize);
      if (!Number.isInteger(size) || size < 1 || size > 50) {
        setFormError('Team size must be between 1 and 50.');
        return;
      }
    }

    if (formData.projectUrl && !/^https?:\/\//i.test(formData.projectUrl.trim())) {
      setFormError('Project URL must start with http:// or https://');
      return;
    }

    setSubmitting(true);
    try {
      if (editingHackathon) {
        await updateHackathon(editingHackathon.id, {
          eventName: formData.eventName,
          projectName: formData.projectName,
          eventDate: formData.eventDate,
          location: formData.location,
          teamSize: formData.teamSize,
          prize: formData.prize,
          techStack: formData.techStack,
          projectUrl: formData.projectUrl,
        });
      } else {
        await addHackathon({
          eventName: formData.eventName,
          projectName: formData.projectName,
          eventDate: formData.eventDate,
          location: formData.location,
          teamSize: formData.teamSize,
          prize: formData.prize,
          techStack: formData.techStack,
          projectUrl: formData.projectUrl,
        });
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        fetchHackathons();
      }, 700);
    } catch (err) {
      setFormError(friendlyError(err));
    } finally {
      setSubmitting(false);
    }
  };

  // Delete handler with confirmation
  const handleDelete = async (hackathon) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${hackathon.event_name}"?`);
    if (!confirmed) return;

    try {
      await deleteHackathon(hackathon.id);
      await fetchHackathons();
    } catch (err) {
      alert(`Failed to delete hackathon: ${err.message}`);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 hidden">Hackathons</h1>
          <p className="text-gray-500 font-medium">
            You have participated in <span className="text-indigo-600 font-bold">{hackathons.length}</span> hackathons
          </p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-sm w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" /> Add Hackathon
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
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
          <p className="text-sm">Loading hackathons...</p>
        </div>
      ) : hackathons.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 flex flex-col items-center justify-center text-center">
          <Code className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">No hackathons recorded yet</h3>
          <p className="text-gray-500 max-w-sm mb-4">
            Showcase competitive coding hackathons, projects built under 48 hours, and winning prizes.
          </p>
          <button 
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Hackathon
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hackathons.map((hackathon) => (
            <HackathonCard 
              key={hackathon.id}
              name={hackathon.event_name}
              projectTitle={hackathon.project_name}
              date={hackathon.event_date}
              location={hackathon.location}
              teamSize={hackathon.team_size}
              technologies={hackathon.tech_stack || []}
              outcome={hackathon.prize || 'Participant'}
              projectUrl={hackathon.project_url}
              onEdit={() => handleOpenEditModal(hackathon)}
              onDelete={() => handleDelete(hackathon)}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Hackathon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {editingHackathon ? 'Edit Hackathon' : 'Add Hackathon'}
                </h3>
                <p className="text-xs text-gray-500">
                  {editingHackathon ? 'Update your hackathon submission details' : 'Record a hackathon event and your project submission'}
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
                  <span>Hackathon saved successfully! Updating list...</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Event Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text"
                    maxLength={200}
                    placeholder="e.g. Smart India Hackathon 2024"
                    value={formData.eventName}
                    onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                    disabled={submitting}
                    className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Project Name
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g. EcoRoute Planner"
                    value={formData.projectName}
                    onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                    disabled={submitting}
                    className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Event Date
                  </label>
                  <input 
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    disabled={submitting}
                    className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Location
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g. Online, IIT Madras"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    disabled={submitting}
                    className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Team Size (1–50)
                  </label>
                  <input 
                    type="number"
                    min="1"
                    max="50"
                    value={formData.teamSize}
                    onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                    disabled={submitting}
                    className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Prize / Outcome
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g. 1st Place, Finalist, Special Mention"
                    value={formData.prize}
                    onChange={(e) => setFormData({ ...formData, prize: e.target.value })}
                    disabled={submitting}
                    className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Tech Stack (comma-separated, max 20)
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g. React, Node.js, OpenCV, Docker"
                    value={formData.techStack}
                    onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                    disabled={submitting}
                    className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Project URL / Repository
                </label>
                <input 
                  type="url"
                  placeholder="https://..."
                  value={formData.projectUrl}
                  onChange={(e) => setFormData({ ...formData, projectUrl: e.target.value })}
                  disabled={submitting}
                  className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
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
                  className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm disabled:opacity-50 transition-colors"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : editingHackathon ? (
                    'Save Changes'
                  ) : (
                    'Add Hackathon'
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
