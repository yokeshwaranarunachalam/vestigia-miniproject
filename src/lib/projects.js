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
 * Validates project payload
 * @param {{ title?: string, description?: string, projectUrl?: string, githubUrl?: string, techStack?: any }} fields
 */
function validateProjectFields(fields, isUpdate = false) {
  if (!isUpdate || fields.title !== undefined) {
    const cleanTitle = (fields.title || '').trim();
    if (!cleanTitle) {
      throw new Error('Project title is required.');
    }
    if (cleanTitle.length > 200) {
      throw new Error('Project title cannot exceed 200 characters.');
    }
  }

  if (fields.description !== undefined && fields.description !== null) {
    const cleanDesc = (fields.description || '').trim();
    if (cleanDesc.length > 2000) {
      throw new Error('Project description cannot exceed 2000 characters.');
    }
  }

  const projectUrl = validateUrl(fields.projectUrl, 'Project URL');
  const githubUrl = validateUrl(fields.githubUrl, 'GitHub URL');
  const techStack = fields.techStack !== undefined ? parseTechStack(fields.techStack) : undefined;

  return {
    projectUrl,
    githubUrl,
    techStack,
  };
}

/**
 * List all projects for the currently authenticated user.
 * Ordered by created_at desc.
 * @param {{ search?: string }} options
 * @returns {Promise<Array>}
 */
export async function listProjects({ search } = {}) {
  let query = supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  const cleanSearch = (search || '').trim();
  if (cleanSearch) {
    query = query.or(`title.ilike.%${cleanSearch}%,description.ilike.%${cleanSearch}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error('[listProjects] Error fetching projects:', error);
    throw error;
  }

  return data || [];
}

/**
 * Add a new project.
 * @param {{ title: string, description?: string, techStack?: string|Array<string>, projectUrl?: string, githubUrl?: string }} data
 * @returns {Promise<Object>}
 */
export async function addProject({ title, description, techStack, projectUrl, githubUrl }) {
  const sanitized = validateProjectFields({ title, description, techStack, projectUrl, githubUrl });

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('You must be logged in to add a project.');
  }

  const newRow = {
    user_id: user.id,
    title: title.trim(),
    description: (description || '').trim() || null,
    tech_stack: sanitized.techStack || [],
    project_url: sanitized.projectUrl,
    github_url: sanitized.githubUrl,
  };

  const { data, error } = await supabase
    .from('projects')
    .insert(newRow)
    .select()
    .single();

  if (error) {
    console.error('[addProject] Insert error:', error);
    throw error;
  }

  return data;
}

/**
 * Update an existing project.
 * @param {string} id
 * @param {{ title?: string, description?: string, techStack?: string|Array<string>, projectUrl?: string, githubUrl?: string }} fields
 * @returns {Promise<Object>}
 */
export async function updateProject(id, fields) {
  if (!id) {
    throw new Error('Project ID is required for update.');
  }

  const sanitized = validateProjectFields(fields, true);

  const updates = {};
  if (fields.title !== undefined) updates.title = fields.title.trim();
  if (fields.description !== undefined) updates.description = (fields.description || '').trim() || null;
  if (sanitized.techStack !== undefined) updates.tech_stack = sanitized.techStack;
  if (fields.projectUrl !== undefined) updates.project_url = sanitized.projectUrl;
  if (fields.githubUrl !== undefined) updates.github_url = sanitized.githubUrl;

  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[updateProject] Update error:', error);
    throw error;
  }

  return data;
}

/**
 * Delete a project by ID.
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function deleteProject(id) {
  if (!id) {
    throw new Error('Project ID is required for deletion.');
  }

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[deleteProject] Delete error:', error);
    throw error;
  }

  return true;
}

