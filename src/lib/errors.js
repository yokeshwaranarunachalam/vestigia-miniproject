/**
 * User-friendly error message mapping for common Supabase configuration errors.
 * @param {Error|string|any} err
 * @returns {string}
 */
export function friendlyError(err) {
  if (!err) return '';

  const rawMessage = typeof err === 'string' 
    ? err 
    : err.message || err.error_description || String(err);

  // 1. Missing Database Table
  if (
    rawMessage.includes('schema cache') || 
    rawMessage.includes('Could not find the table') ||
    rawMessage.includes('relation') && rawMessage.includes('does not exist')
  ) {
    return 'The database table for this feature is missing. Run supabase/setup_all.sql in the Supabase SQL Editor.';
  }

  // 2. Missing Storage Bucket
  if (
    rawMessage.includes('Bucket not found') ||
    rawMessage.includes('bucket_id') && rawMessage.includes('not found')
  ) {
    return 'The certificates storage bucket is missing. Run supabase/setup_all.sql.';
  }

  // 3. Unreachable / Non-deployed Edge Function or CORS issue
  if (
    rawMessage.includes('Failed to send a request to the Edge Function') ||
    rawMessage.includes('FunctionsFetchError') ||
    rawMessage.includes('relay error')
  ) {
    return 'The server function is not reachable. Check that it is deployed and CORS is set.';
  }

  return rawMessage;
}

