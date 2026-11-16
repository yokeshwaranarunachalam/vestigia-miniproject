import { supabase } from './supabase';

/**
 * Format CGPA change percentage with explicit sign (+ or -)
 * @param {number|null} percent
 * @returns {string}
 */
export function formatCgpaChange(percent) {
  if (percent === null || percent === undefined || isNaN(percent)) {
    return '';
  }
  const num = Number(percent);
  if (num > 0) {
    return `+${num.toFixed(1)}%`;
  }
  if (num < 0) {
    return `${num.toFixed(1)}%`;
  }
  return '0.0%';
}

/**
 * Fetch complete dashboard metrics, counts, GPA trend, and recent uploads via get_dashboard RPC.
 * @returns {Promise<{
 *   current_cgpa: number|null,
 *   previous_cgpa: number|null,
 *   cgpa_change_percent: number|null,
 *   total_certificates: number,
 *   projects_built: number,
 *   hackathons: number,
 *   gpa_trend: Array<{ semester: number, gpa: number }>,
 *   recent_uploads: Array<{ id: string, kind: string, file_name: string, file_size_bytes: number, storage_path: string, created_at: string }>
 * }>}
 */
export async function getDashboard() {
  const { data, error } = await supabase.rpc('get_dashboard');

  if (error) {
    console.error('[getDashboard] Error invoking get_dashboard:', error);
    throw error;
  }

  return (
    data || {
      current_cgpa: null,
      previous_cgpa: null,
      cgpa_change_percent: null,
      total_certificates: 0,
      projects_built: 0,
      hackathons: 0,
      gpa_trend: [],
      recent_uploads: [],
    }
  );
}

/**
 * Search across all portfolio collections (certificates, projects, achievements, hackathons)
 * @param {string} q
 * @returns {Promise<{ certificates: Array, projects: Array, achievements: Array, hackathons: Array }>}
 */
export async function searchAll(q) {
  const query = (q || '').trim();
  if (query.length < 2) {
    return {
      certificates: [],
      projects: [],
      achievements: [],
      hackathons: [],
    };
  }

  const { data, error } = await supabase.rpc('search_all', { q: query });

  if (error) {
    console.error('[searchAll] Error invoking search_all:', error);
    throw error;
  }

  return (
    data || {
      certificates: [],
      projects: [],
      achievements: [],
      hackathons: [],
    }
  );
}

