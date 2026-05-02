'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { supabase } from '@/lib/supabase';
import { formatCurrency, timeAgo, getStatusColor } from '@/lib/utils';
import { ClipboardList, DollarSign, Clock, Briefcase, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import type { Bid } from '@/types';

type TabKey = 'active' | 'completed' | 'cancelled';

const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'active', label: 'Active', icon: <Briefcase className="w-4 h-4" /> },
  { key: 'completed', label: 'Completed', icon: <CheckCircle className="w-4 h-4" /> },
  { key: 'cancelled', label: 'Cancelled', icon: <XCircle className="w-4 h-4" /> },
];

export default function MyJobsPage() {
  const { workerProfile } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabKey>('active');
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    if (!workerProfile) return;

    (async () => {
      if (cancelled) return;

      let jobStatusFilter: string | null = null;
      let bidStatusFilter: string | null = null;

      if (activeTab === 'active') {
        jobStatusFilter = 'in_progress';
        bidStatusFilter = 'accepted';
      } else if (activeTab === 'completed') {
        jobStatusFilter = 'completed';
        bidStatusFilter = 'accepted';
      } else if (activeTab === 'cancelled') {
        bidStatusFilter = 'rejected';
      }

      let query = supabase
        .from('bids')
        .select('*, job:jobs(*, category:categories(*), employer:employers(profile:profiles(*)))')
        .eq('worker_id', workerProfile.id)
        .order('created_at', { ascending: false });

      if (bidStatusFilter && jobStatusFilter) {
        query = query.eq('status', bidStatusFilter);
        query = query.eq('job.status', jobStatusFilter);
      } else if (bidStatusFilter) {
        query = query.eq('status', bidStatusFilter);
      }

      const { data, error } = await query;

      if (!cancelled) {
        if (error) {
          console.error('Error fetching bids:', error);
        } else {
          setBids((data as Bid[]) || []);
        }
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [workerProfile, activeTab]);

  const getEmptyMessage = () => {
    switch (activeTab) {
      case 'active':
        return { title: 'No active jobs', desc: 'Your accepted bids on in-progress jobs will appear here.' };
      case 'completed':
        return { title: 'No completed jobs', desc: 'Jobs you have completed will show up here.' };
      case 'cancelled':
        return { title: 'No cancelled jobs', desc: 'Rejected bids or cancelled jobs will appear here.' };
    }
  };

  const emptyMsg = getEmptyMessage();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">My Jobs</h1>
        <p className="text-white/50 mt-1">Track your bids and job progress</p>
      </div>

      <div className="flex gap-2 p-1 rounded-xl bg-white/5 border border-white/5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 flex-1 justify-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {loading && (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-5">
              <div className="flex items-start gap-4">
                <div className="flex-1 space-y-3">
                  <div className="skeleton h-5 w-3/4" />
                  <div className="skeleton h-4 w-1/3" />
                  <div className="skeleton h-4 w-full" />
                  <div className="flex gap-4 mt-3">
                    <div className="skeleton h-4 w-20" />
                    <div className="skeleton h-4 w-24" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && bids.length === 0 && (
        <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
          <div className="p-4 rounded-2xl bg-white/5 mb-4">
            <ClipboardList className="w-12 h-12 text-white/20" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">{emptyMsg.title}</h3>
          <p className="text-white/40 text-sm max-w-md">{emptyMsg.desc}</p>
          {activeTab === 'active' && (
            <Link
              href="/worker/jobs"
              className="mt-4 px-4 py-2 text-sm font-medium rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20 transition-all"
            >
              Browse Jobs
            </Link>
          )}
        </div>
      )}

      {!loading && bids.length > 0 && (
        <div className="space-y-4">
          {bids.map((bid) => (
            <div key={bid.id} className="glass-card p-5 animate-fade-in">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/worker/jobs/${bid.job_id}`}
                    className="text-lg font-semibold text-white hover:text-emerald-400 transition-colors truncate block"
                  >
                    {bid.job?.title || 'Untitled Job'}
                  </Link>
                  <p className="text-sm text-white/40 mt-1">
                    {bid.job?.category?.name || 'General'} • {bid.job?.employer?.profile?.full_name || 'Employer'}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span className={`badge ${getStatusColor(bid.status)}`}>{bid.status}</span>
                  {bid.job?.status && bid.status === 'accepted' && (
                    <span className={`badge ${getStatusColor(bid.job.status)}`}>
                      {bid.job.status.replace('_', ' ')}
                    </span>
                  )}
                </div>
              </div>

              {bid.job && (
                <p className="text-white/60 text-sm mb-4 line-clamp-2">{bid.job.description}</p>
              )}

              {bid.message && (
                <div className="bg-white/3 rounded-lg p-3 mb-4">
                  <p className="text-xs text-white/30 mb-1">Your bid message:</p>
                  <p className="text-sm text-white/50">{bid.message}</p>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-white/5">
                <div className="flex items-center gap-1.5 text-sm">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-emerald-400">{formatCurrency(bid.amount)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-white/50">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{bid.estimated_days} days estimated</span>
                </div>
                <div className="text-xs text-white/30 ml-auto">
                  Bid placed {timeAgo(bid.created_at)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
