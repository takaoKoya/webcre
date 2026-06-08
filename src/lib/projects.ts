import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { ProjectConfig, GeneratedSite } from '@/types';

export interface Project {
  id: string;
  user_id: string;
  name: string;
  config: ProjectConfig;
  generated_site: GeneratedSite | null;
  status: 'draft' | 'published';
  deploy_url: string | null;
  custom_domain: string | null;
  created_at: string;
  updated_at: string;
}

const LS_KEY = 'webcre_projects';

// ──────────────────────────────────────────
// localStorage helpers
// ──────────────────────────────────────────
function lsGetAll(): Project[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]'); } catch { return []; }
}

function lsSave(projects: Project[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(projects));
}

function devUserId() { return 'dev-user'; }

// ──────────────────────────────────────────
// Public API
// ──────────────────────────────────────────
export async function listProjects(userId: string): Promise<Project[]> {
  if (!isSupabaseConfigured) {
    return lsGetAll().filter(p => p.user_id === userId || p.user_id === devUserId());
  }
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data as Project[];
}

export async function getProject(id: string): Promise<Project | null> {
  if (!isSupabaseConfigured) {
    return lsGetAll().find(p => p.id === id) ?? null;
  }
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return data as Project;
}

export async function createProject(
  userId: string,
  name: string,
  config: ProjectConfig,
  generatedSite?: GeneratedSite
): Promise<Project> {
  const now = new Date().toISOString();
  const project: Project = {
    id: crypto.randomUUID(),
    user_id: userId,
    name,
    config,
    generated_site: generatedSite ?? null,
    status: 'draft',
    deploy_url: null,
    custom_domain: null,
    created_at: now,
    updated_at: now,
  };

  if (!isSupabaseConfigured) {
    const all = lsGetAll();
    lsSave([project, ...all]);
    return project;
  }

  const { data, error } = await supabase.from('projects').insert(project).select().single();
  if (error) throw error;
  return data as Project;
}

export async function updateProject(id: string, updates: Partial<Omit<Project, 'id' | 'user_id' | 'created_at'>>): Promise<Project> {
  const now = new Date().toISOString();

  if (!isSupabaseConfigured) {
    const all = lsGetAll();
    const idx = all.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Project not found');
    all[idx] = { ...all[idx], ...updates, updated_at: now };
    lsSave(all);
    return all[idx];
  }

  const { data, error } = await supabase
    .from('projects')
    .update({ ...updates, updated_at: now })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Project;
}

export async function deleteProject(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    lsSave(lsGetAll().filter(p => p.id !== id));
    return;
  }
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw error;
}

export async function duplicateProject(project: Project): Promise<Project> {
  return createProject(
    project.user_id,
    `${project.name} (コピー)`,
    project.config,
    project.generated_site ?? undefined
  );
}
