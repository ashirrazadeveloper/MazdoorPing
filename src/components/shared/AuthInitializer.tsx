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
  const initCalledRef = useRef(false);

  useEffect(() => {
    // Prevent double initialization in StrictMode
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

    // Initialize auth - fetch session and profile
    useAuthStore.getState().initialize();

    // Listen for auth state changes
    // CRITICAL: Only subscribe ONCE to prevent duplicate listeners on reload
    let subscription: { unsubscribe: () => void } | null = null;
    try {
      const { data } = supabase.auth.onAuthStateChange((event) => {
        console.log('[Auth] State change:', event);
        // Re-initialize on auth events
        // TOKEN_REFRESHED: session refreshed silently
        // SIGNED_IN: user logged in
        // SIGNED_OUT: user logged out
        useAuthStore.getState().initialize();
      });
      subscription = data.subscription;
    } catch (err) {
      console.warn('[Auth] Could not subscribe to auth changes:', err);
    }

    // Cleanup on unmount
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // ALWAYS render children immediately - never block the UI
  return <>{children}</>;
}
