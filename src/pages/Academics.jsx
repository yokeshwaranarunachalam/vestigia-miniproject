import React, { useState, useEffect, useCallback } from 'react';
import SemesterPill from '../components/SemesterPill';
import { getAcademics, saveSemester } from '../lib/academics';
import { validateFile } from '../lib/fileValidation';
import { supabase } from '../lib/supabase';
import { friendlyError } from '../lib/errors';
import { 
  Download, 
  Upload, 
  BookOpen, 
  TrendingUp, 
  Plus, 
  Trash2, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const GRADE_OPTIONS = ['O', 'A+', 'A', 'B+', 'B', 'C', 'F', 'RA'];
const GRADE_POINTS = {
  'O': 10,
  'A+': 9,
  'A': 8,
  'B+': 7,
  'B': 6,
  'C': 5,
  'F': 0,
  'RA': 0,
};

export default function Academics() {
  const [activeSem, setActiveSem] = useState(1);
  const [semesterData, setSemesterData] = useState({ subjects: [], gpa: null, cgpa: null });
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Marksheet Upload Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadSem, setUploadSem] = useState(1);
  const [uploadFile, setUploadFile] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [subjectRows, setSubjectRows] = useState([
    { id: 1, name: '', credits: 3, grade: 'A' },
  ]);
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Load academics data for active semester
  const loadSemesterData = useCallback(async (sem) => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await getAcademics(sem);
      // Support various edge function response structures safely
      const subjects = data?.subjects || data?.data?.subjects || (Array.isArray(data) ? data : []);
      const gpa = data?.gpa ?? data?.sgpa ?? data?.data?.gpa ?? null;
      const cgpa = data?.cgpa ?? data?.data?.cgpa ?? null;

      setSemesterData({
        subjects,
        gpa,
        cgpa,
      });
    } catch (err) {
      console.warn(`[Academics] Failed to load data for semester ${sem}:`, err);
      // Gracefully fall back to empty state
      setSemesterData({ subjects: [], gpa: null, cgpa: null });
      setFetchError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSemesterData(activeSem);
  }, [activeSem, loadSemesterData]);

  // Handle Download Report (window.print())
  const handleDownloadReport = () => {
    // TODO: Replace window.print() with a dedicated PDF export library (e.g. jsPDF / html2pdf) later
    window.print();
  };

  // Open Upload Modal
  const openUploadModal = () => {
    setUploadSem(activeSem);
    setSubjectRows([
      { id: Date.now(), name: '', credits: 3, grade: 'A' },
    ]);
    setUploadFile(null);
    setFileError(null);
    setFormError(null);
    setSubmitSuccess(false);
    setIsModalOpen(true);
  };

  // Subject rows manipulation in modal
  const handleAddSubjectRow = () => {
    setSubjectRows((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), name: '', credits: 3, grade: 'A' },
    ]);
  };

  const handleRemoveSubjectRow = (id) => {
    if (subjectRows.length <= 1) {
      setFormError('You must include at least one subject row.');
      return;
    }
    setSubjectRows((prev) => prev.filter((row) => row.id !== id));
  };

  const handleSubjectChange = (id, field, value) => {
    setSubjectRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
    if (formError) setFormError(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setUploadFile(null);
      setFileError(null);
      return;
    }

    const validation = validateFile(file);
    if (!validation.valid) {
      setFileError(validation.error);
      setUploadFile(null);
      e.target.value = '';
    } else {
      setFileError(null);
      setUploadFile(file);
    }
  };

  // Client-side validation & submission
  const handleSubmitMarksheet = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Validate file if present
    if (uploadFile) {
      const validation = validateFile(uploadFile);
      if (!validation.valid) {
        setFormError(validation.error);
        return;
      }
    }

    // Validate subject rows
    if (!subjectRows || subjectRows.length === 0) {
      setFormError('Please add at least one subject.');
      return;
    }

    const trimmedNames = [];
    for (let i = 0; i < subjectRows.length; i++) {
      const row = subjectRows[i];
      const name = (row.name || '').trim();
      const credits = Number(row.credits);

      if (!name) {
        setFormError(`Subject name in row ${i + 1} cannot be empty.`);
        return;
      }

      if (!Number.isInteger(credits) || credits <= 0) {
        setFormError(`Credits for "${name}" must be a positive whole number.`);
        return;
      }

      if (!GRADE_OPTIONS.includes(row.grade)) {
        setFormError(`Please select a valid grade for "${name}".`);
        return;
      }

      const lowerName = name.toLowerCase();
      if (trimmedNames.includes(lowerName)) {
        setFormError(`Duplicate subject detected: "${name}". Each subject must be unique.`);
        return;
      }
      trimmedNames.push(lowerName);
    }

    // Format subjects payload (do NOT compute or send gpa/cgpa from client)
    const payloadSubjects = subjectRows.map((row) => ({
      name: row.name.trim(),
      credits: Number(row.credits),
      grade: row.grade,
    }));

    setSubmitting(true);
    try {
      await saveSemester(uploadSem, payloadSubjects);

      // Record uploaded marksheet file in uploads table if attached
      if (uploadFile) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const sanitizedName = uploadFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
            const storagePath = `${user.id}/${Date.now()}-${sanitizedName}`;
            await supabase.storage.from('certificates').upload(storagePath, uploadFile, { upsert: false });
            await supabase.from('uploads').insert({
              user_id: user.id,
              kind: 'marksheet',
              file_name: uploadFile.name,
              file_size_bytes: uploadFile.size,
              storage_path: storagePath,
            });
          }
        } catch (uploadErr) {
          console.warn('[Academics] Failed to record marksheet upload:', uploadErr);
        }
      }

      setSubmitSuccess(true);

      // Refresh data and switch to uploaded semester
      setTimeout(() => {
        setIsModalOpen(false);
        if (activeSem === uploadSem) {
          loadSemesterData(uploadSem);
        } else {
          setActiveSem(uploadSem);
        }
      }, 1000);
    } catch (err) {
      setFormError(friendlyError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const currentSubjects = semesterData.subjects || [];
  const displayGpa = semesterData.gpa != null ? Number(semesterData.gpa).toFixed(2) : '—';
  const displayCgpa = semesterData.cgpa != null ? Number(semesterData.cgpa).toFixed(2) : '—';

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Semester Tabs */}
        <div className="w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide flex gap-2">
          {SEMESTERS.map((sem) => (
            <SemesterPill 
              key={sem} 
              number={sem} 
              isActive={activeSem === sem} 
              onClick={setActiveSem} 
            />
          ))}
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={openUploadModal}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Upload className="w-4 h-4" /> 
            <span>Upload Marksheet</span>
          </button>
          <button 
            onClick={handleDownloadReport}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" /> 
            <span>Download Report</span>
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
            <p className="text-2xl font-bold text-gray-900">{displayGpa}</p>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 shadow-sm hover:border-blue-200 transition-colors">
          <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Overall CGPA</p>
            <p className="text-2xl font-bold text-gray-900">{displayCgpa}</p>
          </div>
        </div>
      </div>

      {/* Subjects Table / Empty State */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Academic Record - Sem {activeSem}</h2>
          {loading && (
            <div className="flex items-center gap-1.5 text-xs text-blue-600">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading...
            </div>
          )}
        </div>
        
        {loading ? (
          <div className="py-16 text-center text-gray-500 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
            <p className="text-sm">Fetching semester marks...</p>
          </div>
        ) : currentSubjects.length > 0 ? (
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
                {currentSubjects.map((subject, idx) => {
                  const gradePoint = subject.gradePoint ?? GRADE_POINTS[subject.grade] ?? 0;
                  return (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{subject.name}</td>
                      <td className="px-6 py-4 text-center text-gray-600">{subject.credits}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full font-bold text-xs ${
                          subject.grade === 'O' || subject.grade === 'A+' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : subject.grade === 'A' 
                            ? 'bg-blue-100 text-blue-700' 
                            : subject.grade === 'B+' || subject.grade === 'B'
                            ? 'bg-indigo-100 text-indigo-700'
                            : subject.grade === 'C'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {subject.grade}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-700">
                        {Number(gradePoint).toFixed(1)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Table Footer Summary */}
              <tfoot className="bg-gray-50 border-t border-gray-200">
                <tr>
                  <td className="px-6 py-4 font-bold text-gray-900 text-right uppercase text-xs tracking-wider" colSpan="3">
                    Semester SGPA
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-blue-600 text-lg">
                    {displayGpa}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <BookOpen className="w-12 h-12 text-gray-300 mb-3" />
            <h3 className="text-base font-semibold text-gray-800 mb-1">
              No marks uploaded for this semester
            </h3>
            <p className="text-sm text-gray-500 max-w-sm mb-4">
              Upload your semester mark details to track your SGPA and overall degree CGPA.
            </p>
            <button
              onClick={openUploadModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
              <Upload className="w-4 h-4" /> Upload Marksheet
            </button>
          </div>
        )}
      </div>

      {/* Upload Marksheet Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-2xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Upload Marksheet</h3>
                <p className="text-xs text-gray-500">Record semester grades and subjects</p>
              </div>
              <button 
                onClick={() => !submitting && setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={submitting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitMarksheet} className="p-6 space-y-6">
              
              {/* Feedback messages */}
              {formError && (
                <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {submitSuccess && (
                <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>Marksheet saved successfully! Updating records...</span>
                </div>
              )}

              {/* Semester & File selection grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Select Semester
                  </label>
                  <select 
                    value={uploadSem}
                    onChange={(e) => setUploadSem(Number(e.target.value))}
                    disabled={submitting}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    {SEMESTERS.map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Marksheet File (Optional)
                  </label>
                  <input 
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                    onChange={handleFileChange}
                    disabled={submitting}
                    className="block w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-gray-300 rounded-lg p-1"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">JPG, PNG, or PDF (max 2 MB)</p>
                  {fileError && (
                    <p className="text-xs text-red-600 mt-1 font-medium">{fileError}</p>
                  )}
                </div>
              </div>

              {/* Subjects Table Editor */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Subjects & Grades
                  </label>
                  <button
                    type="button"
                    onClick={handleAddSubjectRow}
                    disabled={submitting}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Subject Row
                  </button>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {subjectRows.map((row, index) => (
                    <div 
                      key={row.id} 
                      className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg"
                    >
                      {/* Row index indicator */}
                      <span className="text-xs font-semibold text-gray-400 w-5 text-center">
                        {index + 1}
                      </span>

                      {/* Subject Name */}
                      <input 
                        type="text"
                        placeholder="Subject Name (e.g. Mathematics-I)"
                        value={row.name}
                        onChange={(e) => handleSubjectChange(row.id, 'name', e.target.value)}
                        disabled={submitting}
                        className="flex-1 min-w-0 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                      />

                      {/* Credits */}
                      <div className="w-20">
                        <input 
                          type="number"
                          placeholder="Credits"
                          min="1"
                          max="20"
                          value={row.credits}
                          onChange={(e) => handleSubjectChange(row.id, 'credits', e.target.value)}
                          disabled={submitting}
                          title="Credits (positive integer)"
                          className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-md text-sm text-center text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          required
                        />
                      </div>

                      {/* Grade Dropdown */}
                      <div className="w-24">
                        <select
                          value={row.grade}
                          onChange={(e) => handleSubjectChange(row.id, 'grade', e.target.value)}
                          disabled={submitting}
                          className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded-md text-sm font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          {GRADE_OPTIONS.map((g) => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                      </div>

                      {/* Remove Row Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveSubjectRow(row.id)}
                        disabled={submitting || subjectRows.length <= 1}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-md disabled:opacity-30 disabled:hover:text-gray-400"
                        title="Delete row"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Actions */}
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
                    'Submit Marksheet'
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
