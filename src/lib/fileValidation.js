/**
 * File validation utilities for upload forms (marksheet, certificates, etc.)
 * Validates file format (JPG, PNG, PDF) and max size (2 MB).
 */

export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB in bytes
export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
export const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf'];

export function validateFile(file) {
  if (!file) {
    return { valid: true };
  }

  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();

  const isTypeValid =
    ALLOWED_MIME_TYPES.includes(fileType) ||
    ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext));

  if (!isTypeValid) {
    return {
      valid: false,
      error: 'Invalid file format. Only JPG, PNG, and PDF files are allowed.',
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'File size exceeds the 2 MB limit (max 2 MB allowed).',
    };
  }

  return { valid: true };
}

