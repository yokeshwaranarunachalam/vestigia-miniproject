import { supabase } from './supabase';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB (2,097,152 bytes)
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

/**
 * Validate certificate file on the client.
 * @param {File} file
 */
function validateCertificateFile(file) {
  if (!file) return;

  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();

  const isTypeValid =
    ALLOWED_MIME_TYPES.includes(fileType) ||
    ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext));

  if (!isTypeValid) {
    throw new Error('Invalid file type. Only PDF, JPG, and PNG files are allowed.');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size exceeds 2 MB limit.');
  }
}

/**
 * List all certificates for the currently authenticated user.
 * Ordered by issued_on desc nulls last, created_at desc.
 * @param {{ search?: string }} options
 * @returns {Promise<Array>}
 */
export async function listCertificates({ search } = {}) {
  let query = supabase
    .from('certificates')
    .select('*')
    .order('issued_on', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  const cleanSearch = (search || '').trim();
  if (cleanSearch) {
    query = query.or(`title.ilike.%${cleanSearch}%,provider.ilike.%${cleanSearch}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error('[listCertificates] Error fetching certificates:', error);
    throw error;
  }

  return data || [];
}

/**
 * Add a new certificate record, optionally uploading a certificate document/image.
 * Also records the file in the public.uploads table when provided.
 * @param {{ title: string, provider?: string, issuedOn?: string, file?: File, credentialUrl?: string }} data
 * @returns {Promise<Object>}
 */
export async function addCertificate({ title, provider, issuedOn, file, credentialUrl }) {
  // 1. Client-side validation
  const cleanTitle = (title || '').trim();
  if (!cleanTitle) {
    throw new Error('Certificate title is required.');
  }
  if (cleanTitle.length > 200) {
    throw new Error('Certificate title cannot exceed 200 characters.');
  }

  if (file) {
    validateCertificateFile(file);
  }

  // 2. Ensure user is authenticated
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('You must be logged in to add a certificate.');
  }

  let uploadedFilePath = null;
  let uploadedFileName = null;
  let uploadedFileSizeBytes = null;
  let uploadedFileType = null;

  // 3. Upload file if provided
  if (file) {
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    uploadedFilePath = `${user.id}/${Date.now()}-${sanitizedName}`;
    uploadedFileName = file.name;
    uploadedFileSizeBytes = file.size;
    uploadedFileType = file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');

    const { error: uploadError } = await supabase.storage
      .from('certificates')
      .upload(uploadedFilePath, file, {
        contentType: uploadedFileType,
        upsert: false,
      });

    if (uploadError) {
      console.error('[addCertificate] Storage upload error:', uploadError);
      throw new Error(`Failed to upload certificate file: ${uploadError.message}`);
    }
  }

  // 4. Insert database row into public.certificates
  const newRow = {
    user_id: user.id,
    title: cleanTitle,
    provider: (provider || '').trim() || null,
    issued_on: issuedOn || null,
    file_path: uploadedFilePath,
    file_name: uploadedFileName,
    file_size_bytes: uploadedFileSizeBytes,
    file_type: uploadedFileType,
    credential_url: (credentialUrl || '').trim() || null,
  };

  const { data: insertedData, error: insertError } = await supabase
    .from('certificates')
    .insert(newRow)
    .select()
    .single();

  // 5. Clean up uploaded file if database insert fails
  if (insertError) {
    if (uploadedFilePath) {
      await supabase.storage
        .from('certificates')
        .remove([uploadedFilePath])
        .catch((err) => console.warn('[addCertificate] Failed to clean up file after insert failure:', err));
    }
    console.error('[addCertificate] Database insert error:', insertError);
    throw insertError;
  }

  // 6. Record in public.uploads table for recent uploads tracker
  if (uploadedFilePath) {
    const { error: uploadRecordError } = await supabase
      .from('uploads')
      .insert({
        user_id: user.id,
        kind: 'certificate',
        file_name: uploadedFileName,
        file_size_bytes: uploadedFileSizeBytes,
        storage_path: uploadedFilePath,
      });

    if (uploadRecordError) {
      console.warn('[addCertificate] Warning: failed to record file in uploads table:', uploadRecordError);
    }
  }

  return insertedData;
}

/**
 * Delete a certificate record, its uploads table record, and its storage file.
 * @param {{ id: string, file_path?: string }} certificate
 * @returns {Promise<boolean>}
 */
export async function deleteCertificate(certificate) {
  if (!certificate?.id) {
    throw new Error('Certificate ID is required for deletion.');
  }

  // 1. Delete database row from certificates
  const { error: deleteRowError } = await supabase
    .from('certificates')
    .delete()
    .eq('id', certificate.id);

  if (deleteRowError) {
    console.error('[deleteCertificate] Error deleting row:', deleteRowError);
    throw deleteRowError;
  }

  // 2. Delete uploads row and storage file if one was attached
  if (certificate.file_path) {
    await supabase
      .from('uploads')
      .delete()
      .eq('storage_path', certificate.file_path)
      .catch((err) => console.warn('[deleteCertificate] Failed to delete uploads row:', err));

    const { error: storageError } = await supabase.storage
      .from('certificates')
      .remove([certificate.file_path]);

    if (storageError) {
      console.warn('[deleteCertificate] Warning: failed to remove file from storage:', storageError);
    }
  }

  return true;
}

/**
 * Generate a temporary signed URL for viewing or downloading a private certificate file.
 * @param {{ file_path?: string }} certificate
 * @returns {Promise<string|null>}
 */
export async function getCertificateFileUrl(certificate) {
  if (!certificate?.file_path) {
    return null;
  }

  const { data, error } = await supabase.storage
    .from('certificates')
    .createSignedUrl(certificate.file_path, 300); // 300 seconds (5 minutes)

  if (error) {
    console.error('[getCertificateFileUrl] Error creating signed URL:', error);
    throw error;
  }

  return data?.signedUrl || null;
}
