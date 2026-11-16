import { supabase } from './supabase';

/**
 * Validates optional YYYY-MM-DD date string
 * @param {string} dateStr
 * @returns {string|null}
 */
function validateDate(dateStr) {
  if (!dateStr) return null;
  const trimmed = dateStr.trim();
  if (!trimmed) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed) || isNaN(Date.parse(trimmed))) {
    throw new Error('Achieved date must be a valid date in YYYY-MM-DD format.');
  }
  return trimmed;
}

/**
 * Validates achievement fields
 * @param {{ title?: string, organization?: string, achievedOn?: string, description?: string }} fields
 * @param {boolean} isUpdate
 */
function validateAchievementFields(fields, isUpdate = false) {
  if (!isUpdate || fields.title !== undefined) {
    const cleanTitle = (fields.title || '').trim();
    if (!cleanTitle) {
      throw new Error('Achievement title is required.');
    }
    if (cleanTitle.length > 200) {
      throw new Error('Achievement title cannot exceed 200 characters.');
    }
  }

  if (fields.description !== undefined && fields.description !== null) {
    const cleanDesc = (fields.description || '').trim();
    if (cleanDesc.length > 2000) {
      throw new Error('Achievement description cannot exceed 2000 characters.');
    }
  }

  const achievedOn = fields.achievedOn !== undefined ? validateDate(fields.achievedOn) : undefined;

  return {
    achievedOn,
  };
}

/**
 * List all achievements for the currently authenticated user.
 * Ordered by achieved_on desc nulls last, created_at desc.
 * @returns {Promise<Array>}
 */
export async function listAchievements() {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .order('achieved_on', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[listAchievements] Error fetching achievements:', error);
    throw error;
  }

  return data || [];
}

/**
 * Add a new achievement.
 * @param {{ title: string, organization?: string, achievedOn?: string, description?: string }} data
 * @returns {Promise<Object>}
 */
export async function addAchievement({ title, organization, achievedOn, description }) {
  const sanitized = validateAchievementFields({ title, organization, achievedOn, description });

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('You must be logged in to add an achievement.');
  }

  const newRow = {
    user_id: user.id,
    title: title.trim(),
    organization: (organization || '').trim() || null,
    achieved_on: sanitized.achievedOn || null,
    description: (description || '').trim() || null,
  };

  const { data, error } = await supabase
    .from('achievements')
    .insert(newRow)
    .select()
    .single();

  if (error) {
    console.error('[addAchievement] Insert error:', error);
    throw error;
  }

  return data;
}

/**
 * Update an existing achievement.
 * @param {string} id
 * @param {{ title?: string, organization?: string, achievedOn?: string, description?: string }} fields
 * @returns {Promise<Object>}
 */
export async function updateAchievement(id, fields) {
  if (!id) {
    throw new Error('Achievement ID is required for update.');
  }

  const sanitized = validateAchievementFields(fields, true);

  const updates = {};
  if (fields.title !== undefined) updates.title = fields.title.trim();
  if (fields.organization !== undefined) updates.organization = (fields.organization || '').trim() || null;
  if (sanitized.achievedOn !== undefined) updates.achieved_on = sanitized.achievedOn;
  if (fields.description !== undefined) updates.description = (fields.description || '').trim() || null;

  const { data, error } = await supabase
    .from('achievements')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[updateAchievement] Update error:', error);
    throw error;
  }

  return data;
}

/**
 * Delete an achievement by ID.
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function deleteAchievement(id) {
  if (!id) {
    throw new Error('Achievement ID is required for deletion.');
  }

  const { error } = await supabase
    .from('achievements')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[deleteAchievement] Delete error:', error);
    throw error;
  }

  return true;
}

