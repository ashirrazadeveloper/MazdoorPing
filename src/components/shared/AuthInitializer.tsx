'use client';

import { useEffect } from 'react';
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

  useEffect(() => {
    if (!initialized) {
      // Add timeout - if init takes more than 4 seconds, force finish
      const timeout = setTimeout(() => {
        useAuthStore.setState({ initialized: true, isLoading: false });
      }, 4000);

      initialize().finally(() => {
        clearTimeout(timeout);
      });

      // Set up auth state change listener only if Supabase is configured
      if (isSupabaseConfigured()) {
        try {
          const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            initialize();
          });
          return () => {
            clearTimeout(timeout);
            subscription.unsubscribe();
          };
        } catch {
          // If Supabase is not reachable, just clean up
          return () => clearTimeout(timeout);
        }
      }

      return () => clearTimeout(timeout);
    }
  }, [initialize, initialized]);

  // ALWAYS render children immediately - never block the UI
  return <>{children}</>;
}
