import { supabase } from './supabase';

/**
 * Fetch academic records for a given semester from the get-academics Edge Function.
 * @param {number|string} semester
 * @returns {Promise<{ subjects: Array, gpa?: number, cgpa?: number }>}
 */
export async function getAcademics(semester) {
  const semNumber = Number(semester);

  const { data, error } = await supabase.functions.invoke('get-academics', {
    body: { semester: semNumber },
  });

  if (error) {
    console.error(`[getAcademics] Error fetching semester ${semester}:`, error);
    throw error;
  }

  return data;
}

/**
 * Save marks/subjects for a semester via the save-semester Edge Function.
 * Note: GPA and CGPA are computed exclusively on the server.
 * @param {number|string} semester
 * @param {Array<{ name: string, credits: number, grade: string }>} subjects
 * @returns {Promise<any>}
 */
export async function saveSemester(semester, subjects) {
  const semNumber = Number(semester);

  const { data, error } = await supabase.functions.invoke('save-semester', {
    body: {
      semester: semNumber,
      subjects,
    },
  });

  if (error) {
    console.error(`[saveSemester] Error saving semester ${semester}:`, error);
    throw error;
  }

  return data;
}

