import React, { useState, useEffect, useCallback } from 'react';
import AchievementCard from '../components/AchievementCard';
import { 
  listAchievements, 
  addAchievement, 
  updateAchievement, 
  deleteAchievement 
} from '../lib/achievements';
import { friendlyError } from '../lib/errors';
import { 
  Trophy, 
  Plus, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';

/**
 * Format YYYY-MM-DD string to "Mon YYYY" (e.g. "Mar 2024")
 * Uses UTC to prevent time zone shifts on raw date strings.
 */
function formatAchievedDate(dateStr) {
  if (!dateStr) return '—';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(Date.UTC(year, month, day));
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
    }
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState(null);

  // Modal State (Used for both Add and Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    organization: '',
    achievedOn: '',
    description: '',
  });
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch achievements from backend
  const fetchAchievements = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      const data = await listAchievements();
      setAchievements(data);
    } catch (err) {
      console.error('[Achievements] Failed to list achievements:', err);
      setListError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  // Open modal for Add
  const handleOpenAddModal = () => {
    setEditingAchievement(null);
    setFormData({
      title: '',
      organization: '',
      achievedOn: '',
      description: '',
    });
    setFormError(null);
    setSubmitSuccess(false);
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (achievement) => {
    setEditingAchievement(achievement);
    setFormData({
      title: achievement.title || '',
      organization: achievement.organization || '',
      achievedOn: achievement.achieved_on || '',
      description: achievement.description || '',
    });
    setFormError(null);
    setSubmitSuccess(false);
    setIsModalOpen(true);
  };

  // Submit handler (Add or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.title.trim()) {
      setFormError('Please enter an achievement title.');
      return;
    }
    if (formData.title.trim().length > 200) {
      setFormError('Achievement title cannot exceed 200 characters.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingAchievement) {
        await updateAchievement(editingAchievement.id, {
          title: formData.title,
          organization: formData.organization,
          achievedOn: formData.achievedOn,
          description: formData.description,
        });
      } else {
        await addAchievement({
          title: formData.title,
          organization: formData.organization,
          achievedOn: formData.achievedOn,
          description: formData.description,
        });
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        fetchAchievements();
      }, 700);
    } catch (err) {
      setFormError(friendlyError(err));
    } finally {
      setSubmitting(false);
    }
  };

  // Delete handler with confirmation
  const handleDelete = async (achievement) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${achievement.title}"?`);
    if (!confirmed) return;

    try {
      await deleteAchievement(achievement.id);
      await fetchAchievements();
    } catch (err) {
      alert(`Failed to delete achievement: ${err.message}`);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 hidden">Achievements</h1>
          <p className="text-gray-500 font-medium">
            You have <span className="text-orange-600 font-bold">{achievements.length}</span> recognized achievements
          </p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors shadow-sm w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" /> Add Achievement
        </button>
      </div>

      {/* List Error Banner */}
      {listError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{listError}</span>
        </div>
      )}

      {/* List or Empty State */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-gray-500">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-3" />
          <p className="text-sm">Loading achievements...</p>
        </div>
      ) : achievements.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 flex flex-col items-center justify-center text-center">
          <Trophy className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">No achievements added yet</h3>
          <p className="text-gray-500 max-w-sm mb-4">
            Record honors, hackathon awards, academic distinctions, and leadership accolades.
          </p>
          <button 
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Achievement
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {achievements.map((achievement) => {
            const metadata = {};
            if (achievement.organization) {
              metadata.organization = achievement.organization;
            }
            if (achievement.achieved_on) {
              metadata.date = formatAchievedDate(achievement.achieved_on);
            }

            return (
              <AchievementCard 
                key={achievement.id}
                icon={Trophy}
                title={achievement.title}
                metadata={metadata}
                description={achievement.description}
                onEdit={() => handleOpenEditModal(achievement)}
                onDelete={() => handleDelete(achievement)}
              />
            );
          })}
        </div>
      )}

      {/* Add / Edit Achievement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {editingAchievement ? 'Edit Achievement' : 'Add Achievement'}
                </h3>
                <p className="text-xs text-gray-500">
                  {editingAchievement ? 'Update details of your achievement' : 'Record an award, honor, or milestone'}
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
                  <span>Achievement saved successfully! Updating list...</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Title / Honor <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  maxLength={200}
                  placeholder="e.g. 1st Place - Intra-College Coding Marathon"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  disabled={submitting}
                  className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Organization / Issuer
                </label>
                <input 
                  type="text"
                  placeholder="e.g. IEEE Chapter, University Dean Office, HackerRank"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  disabled={submitting}
                  className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Date Received
                </label>
                <input 
                  type="date"
                  value={formData.achievedOn}
                  onChange={(e) => setFormData({ ...formData, achievedOn: e.target.value })}
                  disabled={submitting}
                  className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Description (max 2000 chars)
                </label>
                <textarea 
                  rows="3"
                  maxLength={2000}
                  placeholder="Details of the award, competition track, or criteria..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={submitting}
                  className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
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
                  className="inline-flex items-center gap-2 px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg shadow-sm disabled:opacity-50 transition-colors"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : editingAchievement ? (
                    'Save Changes'
                  ) : (
                    'Add Achievement'
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
