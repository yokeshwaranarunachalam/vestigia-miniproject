import { addCertificate as addCertificateBackend } from './certificates';
import { addProject as addProjectBackend } from './projects';
import { addAchievement as addAchievementBackend } from './achievements';
import { addHackathon as addHackathonBackend } from './hackathons';

/**
 * Records API handlers.
 * Certificates, projects, achievements, and hackathons are all connected directly to Supabase.
 */

export async function addCertificate(data) {
  return addCertificateBackend(data);
}

export async function addProject(data) {
  return addProjectBackend(data);
}

export async function addAchievement(data) {
  return addAchievementBackend(data);
}

export async function addHackathon(data) {
  return addHackathonBackend(data);
}
