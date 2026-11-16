import React, { useState, useEffect, useCallback, useRef } from 'react';
import ModuleCard from '../components/ModuleCard';
import { 
  listCertificates, 
  addCertificate, 
  deleteCertificate, 
  getCertificateFileUrl 
} from '../lib/certificates';
import { 
  Award, 
  Plus, 
  Search, 
  Filter, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';
import { friendlyError } from '../lib/errors';

export default function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState(null);

  // Add Certificate Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    provider: '',
    issuedOn: '',
    credentialUrl: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Action loading states
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Ref to track debounce timer
  const debounceTimerRef = useRef(null);

  // Load certificates from backend
  const fetchCertificates = useCallback(async (searchQuery = '') => {
    setLoading(true);
    setListError(null);
    try {
      const data = await listCertificates({ search: searchQuery });
      setCertificates(data);
    } catch (err) {
      console.error('[Certificates] Failed to list certificates:', err);
      setListError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchCertificates('');
  }, [fetchCertificates]);

  // Debounced search (300 ms)
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchCertificates(val);
    }, 300);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setSelectedFile(null);
      setFileError(null);
      return;
    }

    // Client-side quick check
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    const validExt = ['.pdf', '.jpg', '.jpeg', '.png'].some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (!allowed.includes(file.type) && !validExt) {
      setFileError('Invalid file type. Only PDF, JPG, and PNG are allowed.');
      setSelectedFile(null);
      e.target.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setFileError('File size exceeds the 2 MB limit.');
      setSelectedFile(null);
      e.target.value = '';
      return;
    }

    setFileError(null);
    setSelectedFile(file);
  };

  const handleOpenModal = () => {
    setFormData({ title: '', provider: '', issuedOn: '', credentialUrl: '' });
    setSelectedFile(null);
    setFileError(null);
    setFormError(null);
    setSubmitSuccess(false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.title.trim()) {
      setFormError('Please enter a certificate title.');
      return;
    }

    setSubmitting(true);
    try {
      await addCertificate({
        title: formData.title,
        provider: formData.provider,
        issuedOn: formData.issuedOn,
        file: selectedFile,
        credentialUrl: formData.credentialUrl,
      });

      setSubmitSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        fetchCertificates(searchTerm);
      }, 700);
    } catch (err) {
      setFormError(friendlyError(err));
    } finally {
      setSubmitting(false);
    }
  };

  // View certificate file via signed URL
  const handleView = async (cert) => {
    if (!cert.file_path) return;
    setActionLoadingId(cert.id);
    try {
      const url = await getCertificateFileUrl(cert);
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        alert('File could not be found.');
      }
    } catch (err) {
      alert(`Error opening file: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Download certificate file via signed URL
  const handleDownload = async (cert) => {
    if (!cert.file_path) return;
    setActionLoadingId(cert.id);
    try {
      const url = await getCertificateFileUrl(cert);
      if (url) {
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = cert.file_name || `${cert.title || 'certificate'}.pdf`;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
      } else {
        alert('File could not be found.');
      }
    } catch (err) {
      alert(`Error downloading file: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete certificate with confirmation
  const handleDelete = async (cert) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${cert.title}"?`);
    if (!confirmed) return;

    setActionLoadingId(cert.id);
    try {
      await deleteCertificate(cert);
      await fetchCertificates(searchTerm);
    } catch (err) {
      alert(`Failed to delete certificate: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 hidden">Certificates</h1>
          <p className="text-gray-500 font-medium">
            You have earned <span className="text-blue-600 font-bold">{certificates.length}</span> certificates
          </p>
        </div>
        <button 
          onClick={handleOpenModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm w-full sm:w-auto justify-center"
        >
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
          <p className="text-sm">Loading certificates...</p>
        </div>
      ) : certificates.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 flex flex-col items-center justify-center text-center">
          <Award className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">No certificates found</h3>
          <p className="text-gray-500 max-w-sm mb-4">
            {searchTerm 
              ? `We couldn't find any certificates matching "${searchTerm}"`
              : 'Upload your online course, bootcamp, and professional certifications to verify your credentials.'}
          </p>
          {searchTerm ? (
            <button 
              onClick={() => {
                setSearchTerm('');
                fetchCertificates('');
              }}
              className="text-blue-600 font-medium hover:underline text-sm"
            >
              Clear search
            </button>
          ) : (
            <button 
              onClick={handleOpenModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Certificate
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {certificates.map((cert) => {
            const hasFile = Boolean(cert.file_path);
            const issuedYear = cert.issued_on ? new Date(cert.issued_on).getFullYear() : null;
            const subtitle = `${cert.provider || 'Independent'}${issuedYear ? ` • Issued ${issuedYear}` : ''}`;

            return (
              <ModuleCard 
                key={cert.id}
                icon={Award}
                title={cert.title}
                subtitle={subtitle}
                onView={hasFile ? () => handleView(cert) : null}
                onDownload={hasFile ? () => handleDownload(cert) : null}
                onDelete={() => handleDelete(cert)}
              />
            );
          })}
        </div>
      )}

      {/* Add Certificate Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Add Certificate</h3>
                <p className="text-xs text-gray-500">Upload and record a new certification</p>
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
                  <span>Certificate added successfully! Updating records...</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Certificate Title <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  maxLength={200}
                  placeholder="e.g. AWS Certified Solutions Architect"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  disabled={submitting}
                  className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Issuing Organization / Provider
                </label>
                <input 
                  type="text"
                  placeholder="e.g. Amazon Web Services, Coursera, Meta"
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  disabled={submitting}
                  className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Issued On (Date)
                  </label>
                  <input 
                    type="date"
                    value={formData.issuedOn}
                    onChange={(e) => setFormData({ ...formData, issuedOn: e.target.value })}
                    disabled={submitting}
                    className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Credential URL (Optional)
                  </label>
                  <input 
                    type="url"
                    placeholder="https://..."
                    value={formData.credentialUrl}
                    onChange={(e) => setFormData({ ...formData, credentialUrl: e.target.value })}
                    disabled={submitting}
                    className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Certificate Document / Image (Optional)
                </label>
                <input 
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                  onChange={handleFileChange}
                  disabled={submitting}
                  className="block w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-gray-300 rounded-lg p-1"
                />
                <p className="text-[11px] text-gray-400 mt-1">PDF, JPG, or PNG (max 2 MB)</p>
                {fileError && (
                  <p className="text-xs text-red-600 mt-1 font-medium">{fileError}</p>
                )}
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
                  ) : (
                    'Add Certificate'
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
