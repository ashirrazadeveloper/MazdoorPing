import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Lazy-init to avoid build-time crash when env vars are not set
let _client: SupabaseClient | null = null;

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_client) {
      if (!supabaseUrl) {
        // During build/SSG, return a no-op proxy
        return (...args: unknown[]) => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } });
      }
      _client = createClient(supabaseUrl, supabaseAnonKey);
    }
    const value = (Reflect.get(_client, prop) as unknown);
    return typeof value === 'function' ? value.bind(_client) : value;
  },
});
