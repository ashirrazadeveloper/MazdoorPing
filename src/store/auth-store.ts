import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Profile, Worker, Employer } from '@/types';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  workerProfile: Worker | null;
  employerProfile: Employer | null;
  isLoading: boolean;
  initialized: boolean;

  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string, role: string, phone: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  fetchProfiles: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  workerProfile: null,
  employerProfile: null,
  isLoading: true,
  initialized: false,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        set({ user: session.user, session, profile: profile || null });

        if (profile?.role === 'worker') {
          const { data: worker } = await supabase
            .from('workers')
            .select('*, skills:worker_skills(*, category:categories(*))')
            .eq('user_id', session.user.id)
            .single();
          set({ workerProfile: worker || null });
        } else if (profile?.role === 'employer') {
          const { data: employer } = await supabase
            .from('employers')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
          set({ employerProfile: employer || null });
        }
      }
      set({ initialized: true, isLoading: false });
    } catch {
      set({ initialized: true, isLoading: false });
    }
  },

  signIn: async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    await get().fetchProfiles();
    return { error: null };
  },

  signUp: async (email: string, password: string, fullName: string, role: string, phone: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role, phone } },
    });
    if (error) return { error: error.message };
    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        email,
        full_name: fullName,
        phone,
        role,
      });
      if (profileError) return { error: profileError.message };

      if (role === 'worker') {
        await supabase.from('workers').insert({
          user_id: data.user.id,
          profile_id: data.user.id,
          status: 'pending',
        });
      } else if (role === 'employer') {
        await supabase.from('employers').insert({
          user_id: data.user.id,
          profile_id: data.user.id,
        });
      }

      await get().fetchProfiles();
    }
    return { error: null };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({
      user: null,
      session: null,
      profile: null,
      workerProfile: null,
      employerProfile: null,
    });
  },

  fetchProfiles: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    set({ user: session.user, session, profile: profile || null });

    if (profile?.role === 'worker') {
      const { data: worker } = await supabase
        .from('workers')
        .select('*, skills:worker_skills(*, category:categories(*))')
        .eq('user_id', session.user.id)
        .single();
      set({ workerProfile: worker || null });
    } else if (profile?.role === 'employer') {
      const { data: employer } = await supabase
        .from('employers')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
      set({ employerProfile: employer || null });
    }
  },
}));
