'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { supabase } from '@/lib/supabase';
import { getInitials, timeAgo } from '@/lib/utils';
import {
  Heart,
  Trash2,
  MapPin,
  Star,
  Briefcase,
  CheckCircle,
  Loader2,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import type { SavedWorker, Worker } from '@/types';
import { useLanguageStore } from '@/store/language-store';

interface SavedWorkerWithDetails extends SavedWorker {
  worker?: Worker;
}

export default function FavoritesPage() {
  const { employerProfile } = useAuthStore();
  const { t } = useLanguageStore();
  const [savedWorkers, setSavedWorkers] = useState<SavedWorkerWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!employerProfile?.id || cancelled) return;

      setLoading(true);

      try {
        const { data, error } = await supabase
          .from('saved_workers')
          .select('*, worker:workers(*, skills:worker_skills(*, category:categories(*)), profile:profiles(*))')
          .eq('employer_id', employerProfile.id)
          .order('created_at', { ascending: false });

        if (!cancelled) {
          if (error) {
            console.error('Error fetching saved workers:', error);
            setSavedWorkers([]);
          } else {
            setSavedWorkers((data as SavedWorkerWithDetails[]) || []);
          }
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to fetch saved workers:', err);
          setLoading(false);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [employerProfile?.id]);

  const handleRemove = async (savedWorkerId: string) => {
    setRemoving(savedWorkerId);
    setConfirmRemove(null);

    try {
      const { error } = await supabase
        .from('saved_workers')
        .delete()
        .eq('id', savedWorkerId);

      if (error) {
        console.error('Error removing saved worker:', error);
        return;
      }

      setSavedWorkers((prev) => prev.filter((sw) => sw.id !== savedWorkerId));
    } catch (err) {
      console.error('Failed to remove saved worker:', err);
    } finally {
      setRemoving(null);
    }
  };

  const workerSkills = (worker: Worker) => {
    if (!worker.skills || worker.skills.length === 0) return [];
    return worker.skills.slice(0, 4);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <div className="skeleton h-8 w-48 mb-2" />
          <div className="skeleton h-4 w-64" />
        </div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-5">
              <div className="flex items-start gap-4">
                <div className="skeleton w-14 h-14 rounded-xl shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="skeleton h-5 w-32" />
                  <div className="skeleton h-3 w-24" />
                  <div className="skeleton h-3 w-full" />
                  <div className="flex gap-2 mt-2">
                    <div className="skeleton h-6 w-16 rounded-full" />
                    <div className="skeleton h-6 w-20 rounded-full" />
                  </div>
                </div>
                <div className="skeleton w-9 h-9 rounded-lg shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Saved Workers</h1>
        <p className="text-white/50 mt-1">
          {savedWorkers.length > 0
            ? `You have ${savedWorkers.length} saved worker${savedWorkers.length !== 1 ? 's' : ''}`
            : 'Workers you save will appear here'}
        </p>
      </div>

      {savedWorkers.length === 0 && (
        <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
          <div className="p-4 rounded-2xl bg-white/5 mb-4">
            <Heart className="w-12 h-12 text-white/20" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No saved workers yet</h3>
          <p className="text-white/40 text-sm max-w-md">
            Browse workers and save the ones you&apos;d like to hire for future projects.
          </p>
          <Link
            href="/employer/find-workers"
            className="mt-4 px-4 py-2 text-sm font-medium rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/20 transition-all"
          >
            Find Workers
          </Link>
        </div>
      )}

      {savedWorkers.length > 0 && (
        <div className="space-y-4">
          {savedWorkers.map((saved) => {
            const worker = saved.worker;
            if (!worker) return null;

            const skills = workerSkills(worker);

            return (
              <div key={saved.id} className="glass-card p-5 animate-fade-in group">
                <div className="flex items-start gap-4">
                  {/* Worker Avatar */}
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-600/10 flex items-center justify-center text-blue-400 font-bold text-lg shrink-0 border border-blue-500/20">
                    {worker.profile ? getInitials(worker.profile.full_name) : 'W'}
                  </div>

                  {/* Worker Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white truncate">
                        {worker.profile?.full_name || 'Worker'}
                      </h3>
                      {worker.availability && (
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                    </div>

                    {worker.profile?.phone && (
                      <p className="text-sm text-white/40 mb-2">{worker.profile.phone}</p>
                    )}

                    <div className="flex flex-wrap gap-3 mb-3">
                      <div className="flex items-center gap-1 text-sm text-white/50">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{worker.city}, {worker.province}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-white/50">
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>{worker.completed_jobs} jobs</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-yellow-400">
                        <Star className="w-3.5 h-3.5 fill-yellow-400" />
                        <span>{worker.rating.toFixed(1)} ({worker.total_reviews})</span>
                      </div>
                    </div>

                    {/* Skills */}
                    {skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {skills.map((skill) => (
                          <span
                            key={skill.id}
                            className="px-2 py-0.5 text-xs rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          >
                            {skill.category?.name || 'Skill'}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Hourly Rate & Saved Date */}
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-emerald-400">
                        PKR {worker.hourly_rate}/hr
                      </span>
                      <span className="text-xs text-white/30">
                        Saved {timeAgo(saved.created_at)}
                      </span>
                    </div>

                    {/* Bio Preview */}
                    {worker.bio && (
                      <p className="text-sm text-white/40 mt-2 line-clamp-2">{worker.bio}</p>
                    )}
                  </div>

                  {/* Remove Button */}
                  <div className="shrink-0">
                    {confirmRemove === saved.id ? (
                      <div className="flex flex-col items-end gap-2 animate-fade-in">
                        <p className="text-xs text-red-400 font-medium">Remove?</p>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleRemove(saved.id)}
                            disabled={removing === saved.id}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20 transition-all text-xs font-medium disabled:opacity-50"
                          >
                            {removing === saved.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <CheckCircle className="w-3 h-3" />
                            )}
                            Yes
                          </button>
                          <button
                            onClick={() => setConfirmRemove(null)}
                            className="px-2.5 py-1.5 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 border border-white/10 transition-all text-xs font-medium"
                          >
                            No
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmRemove(saved.id)}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500/10 text-white/30 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {savedWorkers.length > 0 && (
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/employer/find-workers"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition-all text-sm font-medium"
          >
            <Search className="w-4 h-4" />
            Find More Workers
          </Link>
        </div>
      )}
    </div>
  );
}
