'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { supabase } from '@/lib/supabase';

// Check if Supabase is configured
function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url && key &&
    !url.includes('your-project') &&
    !url.includes('placeholder') &&
    key !== 'your-anon-key' &&
    key !== 'placeholder'
  );
}

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize);
  const initialized = useAuthStore((s) => s.initialized);
  const initCalledRef = useRef(false);

  useEffect(() => {
    if (initCalledRef.current) return;
    initCalledRef.current = true;

    if (!isSupabaseConfigured()) {
      useAuthStore.setState({
        initialized: true,
        isLoading: false,
        supabaseReady: false,
        connectionError: 'Supabase configured nahi hai. Environment variables set karein.',
      });
      return;
    }

    // Call initialize - it handles everything internally
    // No artificial timeout that could cut off profile fetching
    initialize();

    // Listen for auth state changes (login, logout, etc.)
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        // Re-initialize on any auth change
        // This handles: LOGIN, LOGOUT, TOKEN_REFRESH, USER_UPDATED
        useAuthStore.getState().initialize();
      });
      return () => {
        subscription.unsubscribe();
      };
    } catch {
      // Supabase not reachable - already initialized above
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ALWAYS render children immediately - never block the UI
  return <>{children}</>;
}
