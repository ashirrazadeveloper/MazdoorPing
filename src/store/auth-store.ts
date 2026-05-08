import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Profile, Worker, Employer } from '@/types';
import type { User, Session } from '@supabase/supabase-js';

// Check if Supabase is properly configured
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

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  workerProfile: Worker | null;
  employerProfile: Employer | null;
  isLoading: boolean;
  initialized: boolean;
  supabaseReady: boolean;
  connectionError: string | null;

  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string, role: string, phone: string) => Promise<{ error: string | null; needsConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  fetchProfiles: () => Promise<void>;
}

function getFriendlyErrorMessage(errorMsg: string): string {
  const lower = errorMsg.toLowerCase();

  if (lower.includes('invalid login credentials') || lower.includes('invalid email or password')) {
    return 'Email ya password galat hai. Dobara check karein.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Email confirm nahi hua. Pehle apne email mein aayi link par click karein.';
  }
  if (lower.includes('user already registered') || lower.includes('already registered')) {
    return 'Ye email pehle se registered hai. Login karein ya different email use karein.';
  }
  if (lower.includes('rate limit') || lower.includes('too many requests')) {
    return 'Bohat zyada try kiya. Thori dair baad dobara try karein.';
  }
  if (lower.includes('password') && (lower.includes('weak') || lower.includes('short') || lower.includes('length'))) {
    return 'Password kam az kam 8 characters ka hona chahiye.';
  }
  if (lower.includes('network') || lower.includes('fetch') || lower.includes('failed to connect')) {
    return 'Internet connection mein masla hai. Dobara try karein.';
  }
  if (lower.includes('row-level security') || lower.includes('rls') || lower.includes('406') || lower.includes('not acceptable')) {
    return 'Database permission error. SQL Editor mein RLS policies add karein.';
  }
  if (lower.includes('duplicate key') || lower.includes('unique constraint')) {
    return 'Ye record pehle se mojood hai.';
  }
  if (lower.includes('invalid email')) {
    return 'Email address theek nahi hai. Sahi email enter karein.';
  }

  return errorMsg;
}

// Helper to safely fetch worker profile without complex joins
async function fetchWorkerProfile(userId: string): Promise<Worker | null> {
  try {
    // First try simple query (no joins) - most likely to work even without RLS on related tables
    const { data: worker, error } = await supabase
      .from('workers')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !worker) return null;
    return worker as Worker;
  } catch {
    return null;
  }
}

// Helper to safely fetch employer profile
async function fetchEmployerProfile(userId: string): Promise<Employer | null> {
  try {
    const { data: employer, error } = await supabase
      .from('employers')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !employer) return null;
    return employer as Employer;
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  workerProfile: null,
  employerProfile: null,
  isLoading: true,
  initialized: false,
  supabaseReady: isSupabaseConfigured(),
  connectionError: null,

  initialize: async () => {
    if (!isSupabaseConfigured()) {
      set({
        initialized: true,
        isLoading: false,
        supabaseReady: false,
        connectionError: 'Supabase configured nahi hai. Environment variables set karein.',
      });
      return;
    }

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        set({
          initialized: true,
          isLoading: false,
          connectionError: getFriendlyErrorMessage(sessionError.message),
        });
        return;
      }

      if (session?.user) {
        let profile: Profile | null = null;

        try {
          const { data: profData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          profile = (profData as unknown as Profile) || null;
        } catch {
          profile = null;
        }

        set({ user: session.user, session, profile });

        if (profile?.role === 'worker') {
          const worker = await fetchWorkerProfile(session.user.id);
          set({ workerProfile: worker });
        } else if (profile?.role === 'employer') {
          const employer = await fetchEmployerProfile(session.user.id);
          set({ employerProfile: employer });
        }
      }
      set({ initialized: true, isLoading: false, connectionError: null });
    } catch {
      set({
        initialized: true,
        isLoading: false,
        connectionError: 'Connection mein masla hai. Dobara try karein.',
      });
    }
  },

  signIn: async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      return { error: 'Supabase configured nahi hai. Pehle Supabase setup complete karein.' };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: getFriendlyErrorMessage(error.message) };

      // DON'T fetch profiles here - it can hang.
      // Profile will be fetched after redirect on the dashboard page.
      // Just set the basic session info.
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        set({ user: session.user, session });
      }
      return { error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login mein masla hai';
      return { error: getFriendlyErrorMessage(message) };
    }
  },

  signUp: async (email: string, password: string, fullName: string, role: string, phone: string) => {
    if (!isSupabaseConfigured()) {
      return { error: 'Supabase configured nahi hai. Pehle Supabase setup complete karein.', needsConfirmation: false };
    }

    try {
      // Step 1: Create auth user - the database trigger handle_new_user() will
      // automatically create profile + worker/employer records
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, role, phone } },
      });

      if (error) {
        const friendlyMsg = getFriendlyErrorMessage(error.message);
        // If RLS or database error, give actionable advice
        if (error.message.includes('Database error') || error.message.includes('relation') || error.message.includes('function')) {
          return { error: 'Database mein masla hai. Supabase SQL Editor mein ye SQL run karein aur dobara try karein. Error: ' + friendlyMsg, needsConfirmation: false };
        }
        return { error: friendlyMsg, needsConfirmation: false };
      }

      if (data.user) {
        // Step 2: Wait a moment for the trigger to create profile + worker/employer
        // The trigger handle_new_user() runs automatically after auth.users INSERT
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Step 3: Verify profile was created by trigger, if not create it manually
        try {
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', data.user.id)
            .single();

          if (!existingProfile) {
            // Trigger didn't create profile - create manually
            const { error: profileErr } = await supabase.from('profiles').insert({
              id: data.user.id,
              email,
              full_name: fullName,
              phone,
              role,
            });
            if (profileErr) {
              console.warn('Profile insert failed (trigger may have created it):', profileErr.message);
            }
          }
        } catch {
          // Profile might exist or RLS blocks read - ignore
        }

        // Step 4: Verify worker/employer record exists
        if (role === 'worker') {
          try {
            const { data: existingWorker } = await supabase
              .from('workers')
              .select('id')
              .eq('user_id', data.user.id)
              .single();

            if (!existingWorker) {
              const { error: workerErr } = await supabase.from('workers').insert({
                user_id: data.user.id,
                profile_id: data.user.id,
                status: 'pending',
              });
              if (workerErr) {
                console.warn('Worker insert failed:', workerErr.message);
              }
            }
          } catch { /* ignore */ }
        } else if (role === 'employer') {
          try {
            const { data: existingEmployer } = await supabase
              .from('employers')
              .select('id')
              .eq('user_id', data.user.id)
              .single();

            if (!existingEmployer) {
              const { error: employerErr } = await supabase.from('employers').insert({
                user_id: data.user.id,
                profile_id: data.user.id,
              });
              if (employerErr) {
                console.warn('Employer insert failed:', employerErr.message);
              }
            }
          } catch { /* ignore */ }
        }

        // Check if email confirmation is needed
        const needsConfirmation = !data.session;
        return { error: null, needsConfirmation };
      }

      return { error: null, needsConfirmation: false };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Account create mein masla hai';
      return { error: getFriendlyErrorMessage(message), needsConfirmation: false };
    }
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut();
    } catch { /* ignore */ }
    set({
      user: null,
      session: null,
      profile: null,
      workerProfile: null,
      employerProfile: null,
    });
  },

  fetchProfiles: async () => {
    if (!isSupabaseConfigured()) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      let profile: Profile | null = null;
      try {
        const { data: profData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        profile = profData || null;
      } catch {
        profile = null;
      }

      set({ user: session.user, session, profile });

      if (profile?.role === 'worker') {
        const worker = await fetchWorkerProfile(session.user.id);
        set({ workerProfile: worker });
      } else if (profile?.role === 'employer') {
        const employer = await fetchEmployerProfile(session.user.id);
        set({ employerProfile: employer });
      }
    } catch {
      // Silent fail
    }
  },
}));
