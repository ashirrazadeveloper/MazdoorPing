'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRole?: string;
}

const PROFILE_MAX_WAIT = 10000; // 10 seconds max wait for profile
const PROFILE_RETRY_INTERVAL = 2000; // Retry profile fetch every 2 seconds

/**
 * AuthGuard - Protects routes that require authentication.
 *
 * KEY INSIGHT: We check `user` (session) FIRST, not `profile`.
 * - If `user` exists → user IS authenticated → wait for profile
 * - If `user` is null → user is NOT authenticated → redirect to login
 * - Profile can take a moment to load from Supabase, that's OK
 */
export function AuthGuard({ children, allowedRole }: AuthGuardProps) {
  const { user, profile, initialized, fetchProfiles } = useAuthStore();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const redirectedRef = useRef(false);
  const profileWaitStartRef = useRef<number | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [profileExpired, setProfileExpired] = useState(false);

  // Ensure we're on client
  useEffect(() => { setMounted(true); }, []);

  // Profile retry mechanism - fetch profile periodically if user exists but profile hasn't loaded
  const retryProfileFetch = useCallback(() => {
    if (user && !profile && initialized && !redirectedRef.current) {
      fetchProfiles();
    }
  }, [user, profile, initialized, fetchProfiles]);

  useEffect(() => {
    if (!mounted || !initialized) return;

    if (user && !profile) {
      // Start tracking wait time
      if (!profileWaitStartRef.current) {
        profileWaitStartRef.current = Date.now();
        // Immediately try once
        fetchProfiles();
      }

      // Set up periodic retry
      retryTimerRef.current = setInterval(retryProfileFetch, PROFILE_RETRY_INTERVAL);

      // Check if we've waited too long
      const checkTimeout = setInterval(() => {
        if (profileWaitStartRef.current && Date.now() - profileWaitStartRef.current > PROFILE_MAX_WAIT) {
          setProfileExpired(true);
          clearInterval(checkTimeout);
        }
      }, 1000);

      return () => {
        clearInterval(retryTimerRef.current!);
        clearInterval(checkTimeout);
      };
    } else {
      // Reset wait tracking when profile loads
      profileWaitStartRef.current = null;
      setProfileExpired(false);
      if (retryTimerRef.current) {
        clearInterval(retryTimerRef.current);
        retryTimerRef.current = null;
      }
    }
  }, [mounted, initialized, user, profile, fetchProfiles, retryProfileFetch]);

  // Handle auth state decisions
  useEffect(() => {
    if (!mounted) return;
    if (!initialized) return;
    if (redirectedRef.current) return;

    // CASE 1: No user at all = not authenticated → redirect to login
    if (!user) {
      redirectedRef.current = true;
      window.location.href = `/login?redirect=${encodeURIComponent(pathname)}`;
      return;
    }

    // CASE 2: User exists, profile loaded, but wrong role → redirect to correct section
    if (profile && allowedRole && profile.role !== allowedRole) {
      redirectedRef.current = true;
      const redirectPath =
        profile.role === 'worker' ? '/worker' :
        profile.role === 'employer' ? '/employer' :
        profile.role === 'admin' ? '/admin' : '/';
      window.location.href = redirectPath;
      return;
    }
  }, [mounted, initialized, user, profile, allowedRole, pathname]);

  // Don't render until client-side hydration
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mesh">
        <div className="w-8 h-8 border-2 border-white/10 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Still initializing auth (checking session)
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mesh">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-white/10 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-white/50 text-sm">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // No user = redirecting to login
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mesh">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-white/10 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-white/50 text-sm">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // User is authenticated but profile is still loading (haven't timed out yet)
  if (user && !profile && !profileExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mesh">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-white/10 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-white/50 text-sm">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Profile loaded but wrong role = redirecting
  if (profile && allowedRole && profile.role !== allowedRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mesh">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-white/10 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-white/50 text-sm">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  // All good - user authenticated with correct role
  // OR profile timed out but user is valid - let them through anyway
  return <>{children}</>;
}
