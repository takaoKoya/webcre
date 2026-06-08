import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Dev mode: if no real Supabase keys are configured, auth is skipped
export const isSupabaseConfigured =
  supabaseUrl.length > 0 &&
  !supabaseUrl.includes('dummy') &&
  supabaseAnonKey.length > 0 &&
  !supabaseAnonKey.includes('dummy');

// Always create the client (with fallback values for type safety)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

export type { User, Session } from '@supabase/supabase-js';
