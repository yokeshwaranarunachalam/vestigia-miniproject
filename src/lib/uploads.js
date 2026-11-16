import { supabase } from './supabase';

/**
 * List recent uploads from public.uploads table.
 * Used as a standalone query or fallback if get_dashboard does not include them.
 * @param {number} limit
 * @returns {Promise<Array>}
 */
export async function listRecentUploads(limit = 3) {
  const { data, error } = await supabase
    .from('uploads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[listRecentUploads] Error fetching uploads:', error);
    throw error;
  }

  return data || [];
}

/**
 * Record a new upload in the public.uploads table.
 * @param {{ kind: 'certificate'|'marksheet'|'photo'|'other', fileName: string, fileSizeBytes?: number, storagePath: string }} params
 */
export async function recordUpload({ kind, fileName, fileSizeBytes, storagePath }) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('You must be logged in to record an upload.');
  }

  const { data, error } = await supabase
    .from('uploads')
    .insert({
      user_id: user.id,
      kind,
      file_name: fileName,
      file_size_bytes: fileSizeBytes || null,
      storage_path: storagePath,
    })
    .select()
    .single();

  if (error) {
    console.error('[recordUpload] Error inserting upload row:', error);
    throw error;
  }

  return data;
}

