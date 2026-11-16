import { supabase } from './supabase';

/**
 * Validates optional HTTP/HTTPS URL
 * @param {string} url
 * @param {string} fieldName
 * @returns {string|null}
 */
function validateUrl(url, fieldName) {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (!/^https?:\/\//i.test(trimmed)) {
    throw new Error(`${fieldName} must start with http:// or https://`);
  }
  return trimmed;
}

/**
 * Converts tech stack input to sanitized array (max 20 items)
 * @param {string|Array<string>} techStack
 * @returns {Array<string>}
 */
function parseTechStack(techStack) {
  if (!techStack) return [];
  let items = [];
  if (Array.isArray(techStack)) {
    items = techStack.map((item) => String(item).trim()).filter(Boolean);
  } else if (typeof techStack === 'string') {
    items = techStack
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (items.length > 20) {
    throw new Error('Tech stack cannot contain more than 20 items.');
  }

  return items;
}

/**
 * Validates hackathon fields
 * @param {{ eventName?: string, teamSize?: any, projectUrl?: string, techStack?: any }} fields
 * @param {boolean} isUpdate
 */
function validateHackathonFields(fields, isUpdate = false) {
  if (!isUpdate || fields.eventName !== undefined) {
    const cleanName = (fields.eventName || '').trim();
    if (!cleanName) {
      throw new Error('Event name is required.');
    }
    if (cleanName.length > 200) {
      throw new Error('Event name cannot exceed 200 characters.');
    }
  }

  if (fields.teamSize !== undefined && fields.teamSize !== null && fields.teamSize !== '') {
    const size = Number(fields.teamSize);
    if (!Number.isInteger(size) || size < 1 || size > 50) {
      throw new Error('Team size must be a whole number between 1 and 50.');
    }
  }

  const projectUrl = validateUrl(fields.projectUrl, 'Project URL');
  const techStack = fields.techStack !== undefined ? parseTechStack(fields.techStack) : undefined;

  return {
    projectUrl,
    techStack,
  };
}

/**
 * List all hackathons for the currently authenticated user.
 * Ordered by event_date desc nulls last.
 * @returns {Promise<Array>}
 */
export async function listHackathons() {
  const { data, error } = await supabase
    .from('hackathons')
    .select('*')
    .order('event_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[listHackathons] Error fetching hackathons:', error);
    throw error;
  }

  return data || [];
}

/**
 * Add a new hackathon.
 * @param {{ eventName: string, projectName?: string, eventDate?: string, location?: string, teamSize?: number, prize?: string, techStack?: string|Array<string>, projectUrl?: string }} data
 * @returns {Promise<Object>}
 */
export async function addHackathon({
  eventName,
  projectName,
  eventDate,
  location,
  teamSize,
  prize,
  techStack,
  projectUrl,
}) {
  const sanitized = validateHackathonFields({ eventName, teamSize, projectUrl, techStack });

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('You must be logged in to add a hackathon.');
  }

  const newRow = {
    user_id: user.id,
    event_name: eventName.trim(),
    project_name: (projectName || '').trim() || null,
    event_date: eventDate || null,
    location: (location || '').trim() || null,
    team_size: teamSize ? Number(teamSize) : null,
    prize: (prize || '').trim() || null,
    tech_stack: sanitized.techStack || [],
    project_url: sanitized.projectUrl,
  };

  const { data, error } = await supabase
    .from('hackathons')
    .insert(newRow)
    .select()
    .single();

  if (error) {
    console.error('[addHackathon] Insert error:', error);
    throw error;
  }

  return data;
}

/**
 * Update an existing hackathon.
 * @param {string} id
 * @param {{ eventName?: string, projectName?: string, eventDate?: string, location?: string, teamSize?: number, prize?: string, techStack?: string|Array<string>, projectUrl?: string }} fields
 * @returns {Promise<Object>}
 */
export async function updateHackathon(id, fields) {
  if (!id) {
    throw new Error('Hackathon ID is required for update.');
  }

  const sanitized = validateHackathonFields(fields, true);

  const updates = {};
  if (fields.eventName !== undefined) updates.event_name = fields.eventName.trim();
  if (fields.projectName !== undefined) updates.project_name = (fields.projectName || '').trim() || null;
  if (fields.eventDate !== undefined) updates.event_date = fields.eventDate || null;
  if (fields.location !== undefined) updates.location = (fields.location || '').trim() || null;
  if (fields.teamSize !== undefined) updates.team_size = fields.teamSize ? Number(fields.teamSize) : null;
  if (fields.prize !== undefined) updates.prize = (fields.prize || '').trim() || null;
  if (sanitized.techStack !== undefined) updates.tech_stack = sanitized.techStack;
  if (fields.projectUrl !== undefined) updates.project_url = sanitized.projectUrl;

  const { data, error } = await supabase
    .from('hackathons')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[updateHackathon] Update error:', error);
    throw error;
  }

  return data;
}

/**
 * Delete a hackathon by ID.
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function deleteHackathon(id) {
  if (!id) {
    throw new Error('Hackathon ID is required for deletion.');
  }

  const { error } = await supabase
    .from('hackathons')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[deleteHackathon] Delete error:', error);
    throw error;
  }

  return true;
}

