'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRole?: string;
}

export function AuthGuard({ children, allowedRole }: AuthGuardProps) {
  const { profile, initialized } = useAuthStore();
  const pathname = usePathname();
  const [timedOut, setTimedOut] = useState(false);

  // Safety timeout - if auth doesn't initialize in 5 seconds, force action
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimedOut(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Handle auth state
  useEffect(() => {
    if (!initialized && !timedOut) return;

    if (timedOut && !profile) {
      // Auth timed out and no profile - go to login
      window.location.href = `/login?redirect=${encodeURIComponent(pathname)}`;
      return;
    }

    if (initialized && !profile) {
      // Initialized but no profile - go to login
      window.location.href = `/login?redirect=${encodeURIComponent(pathname)}`;
      return;
    }

    if (profile && allowedRole && profile.role !== allowedRole) {
      // Wrong role - redirect to correct section
      const redirectPath = profile.role === 'worker' ? '/worker' : profile.role === 'employer' ? '/employer' : profile.role === 'admin' ? '/admin' : '/';
      window.location.href = redirectPath;
      return;
    }
  }, [initialized, profile, timedOut, pathname, allowedRole]);

  // Show loading while initializing
  if (!initialized && !timedOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mesh">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-white/10 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-white/50 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // If timed out or no profile, show nothing (redirect will happen)
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mesh">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-white/10 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-white/50 text-sm">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Profile exists - render children
  return <>{children}</>;
}
