'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { supabase } from '@/lib/supabase';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      initialize();
    });

    return () => subscription.unsubscribe();
  }, [initialize]);

  return <>{children}</>;
}
