'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { supabase } from '@/lib/supabase';
import { formatCurrency, timeAgo, getStatusColor, getInitials } from '@/lib/utils';
import {
  ClipboardList,
  Briefcase,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Star,
  MessageCircle,
  Check,
  X,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import type { Job, Bid, Worker } from '@/types';
import { useLanguageStore } from '@/store/language-store';

type TabKey = 'active' | 'pending' | 'completed' | 'cancelled';

interface JobWithBids extends Job {
  bids?: (Bid & { worker?: Worker })[];
}

const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'active', label: 'Active', icon: <Briefcase className="w-4 h-4" /> },
  { key: 'pending', label: 'Pending', icon: <Clock className="w-4 h-4" /> },
  { key: 'completed', label: 'Completed', icon: <CheckCircle className="w-4 h-4" /> },
  { key: 'cancelled', label: 'Cancelled', icon: <XCircle className="w-4 h-4" /> },
];

export default function MyBookingsPage() {
  const { employerProfile } = useAuthStore();
  const { t } = useLanguageStore();
  const [activeTab, setActiveTab] = useState<TabKey>('active');
  const [jobs, setJobs] = useState<JobWithBids[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);

  useEffect(() => {
    if (!employerProfile?.id) return;

    let cancelled = false;

    (async () => {
      setLoading(true);

      let statusFilter: string | null = null;
      if (activeTab === 'active') statusFilter = 'in_progress';
      else if (activeTab === 'pending') statusFilter = 'open';
      else if (activeTab === 'completed') statusFilter = 'completed';
      else if (activeTab === 'cancelled') statusFilter = 'cancelled';

      let query = supabase
        .from('jobs')
        .select('*, category:categories(*)')
        .eq('employer_id', employerProfile.id)
        .order('created_at', { ascending: false });

      if (statusFilter) query = query.eq('status', statusFilter);

      const { data, error } = await query;

      if (!cancelled) {
        if (error) {
          console.error('Error fetching jobs:', error);
          setJobs([]);
        } else {
          const jobIds = (data as Job[]).map((j) => j.id);

          let jobsWithBids: JobWithBids[] = (data as Job[]) || [];

          if (jobIds.length > 0) {
            const { data: bidsData } = await supabase
              .from('bids')
              .select('*, worker:workers(*, profile:profiles(*))')
              .in('job_id', jobIds)
              .order('created_at', { ascending: false });

            if (bidsData) {
              const bidsMap: Record<string, (Bid & { worker?: Worker })[]> = {};
              (bidsData as (Bid & { worker?: Worker })[]).forEach((bid) => {
                if (!bidsMap[bid.job_id]) bidsMap[bid.job_id] = [];
                bidsMap[bid.job_id].push(bid);
              });
              jobsWithBids = jobsWithBids.map((job) => ({
                ...job,
                bids: bidsMap[job.id] || [],
              }));
            }
          }

          setJobs(jobsWithBids);
        }
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [employerProfile?.id, activeTab]);

  const handleAcceptBid = async (bidId: string, jobId: string) => {
    setAccepting(bidId);

    try {
      const { error: bidError } = await supabase
        .from('bids')
        .update({ status: 'accepted' })
        .eq('id', bidId);

      if (bidError) {
        console.error('Error accepting bid:', bidError);
        setAccepting(null);
        return;
      }

      const { error: rejectError } = await supabase
        .from('bids')
        .update({ status: 'rejected' })
        .eq('job_id', jobId)
        .neq('id', bidId)
        .eq('status', 'pending');

      if (rejectError) console.error('Error rejecting other bids:', rejectError);

      const { error: jobError } = await supabase
        .from('jobs')
        .update({ status: 'in_progress' })
        .eq('id', jobId);

      if (jobError) console.error('Error updating job status:', jobError);

      setJobs((prev) =>
        prev.map((job) => ({
          ...job,
          bids: job.bids?.map((bid) => ({
            ...bid,
            status: bid.id === bidId ? 'accepted' : (bid.status === 'pending' ? 'rejected' : bid.status),
          })),
        }))
      );

      if (employerProfile?.id) {
        await supabase
          .from('employers')
          .update({ total_posted_jobs: (employerProfile.total_posted_jobs || 0) })
          .eq('id', employerProfile.id);
      }
    } catch (err) {
      console.error('Failed to accept bid:', err);
    } finally {
      setAccepting(null);
    }
  };

  const handleRejectBid = async (bidId: string) => {
    setRejecting(bidId);

    try {
      const { error } = await supabase
        .from('bids')
        .update({ status: 'rejected' })
        .eq('id', bidId);

      if (error) {
        console.error('Error rejecting bid:', error);
        return;
      }

      setJobs((prev) =>
        prev.map((job) => ({
          ...job,
          bids: job.bids?.map((bid) =>
            bid.id === bidId ? { ...bid, status: 'rejected' } : bid
          ),
        }))
      );
    } catch (err) {
      console.error('Failed to reject bid:', err);
    } finally {
      setRejecting(null);
    }
  };

  const toggleExpand = (jobId: string) => {
    setExpandedJob((prev) => (prev === jobId ? null : jobId));
  };

  const getEmptyMessage = () => {
    switch (activeTab) {
      case 'active':
        return { title: 'No active jobs', desc: 'Jobs that are in progress with accepted workers will appear here.' };
      case 'pending':
        return { title: 'No open jobs', desc: 'Jobs waiting for worker bids will show up here.' };
      case 'completed':
        return { title: 'No completed jobs', desc: 'Finished jobs will appear here after completion.' };
      case 'cancelled':
        return { title: 'No cancelled jobs', desc: 'Cancelled job listings will appear here.' };
    }
  };

  const emptyMsg = getEmptyMessage();
  const pendingBidsCount = (bidList: (Bid & { worker?: Worker })[] | undefined) =>
    bidList?.filter((b) => b.status === 'pending').length || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">{t("employer.myBookings")}</h1>
        <p className="text-white/50 mt-1">Manage your jobs and worker bids</p>
      </div>

      <div className="flex gap-2 p-1 rounded-xl bg-white/5 border border-white/5 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setExpandedJob(null); }}
            className={`flex items-center gap-2 flex-1 justify-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20'
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

      {!loading && jobs.length === 0 && (
        <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
          <div className="p-4 rounded-2xl bg-white/5 mb-4">
            <ClipboardList className="w-12 h-12 text-white/20" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">{emptyMsg.title}</h3>
          <p className="text-white/40 text-sm max-w-md">{emptyMsg.desc}</p>
          {activeTab === 'pending' && (
            <Link
              href="/employer/post-job"
              className="mt-4 px-4 py-2 text-sm font-medium rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/20 transition-all"
            >
              Post a Job
            </Link>
          )}
        </div>
      )}

      {!loading && jobs.length > 0 && (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="glass-card p-5 animate-fade-in">
              {/* Job Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white truncate">{job.title}</h3>
                  <p className="text-sm text-white/40 mt-1">
                    {job.category?.name || 'General'} • Posted {timeAgo(job.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span className={`badge ${getStatusColor(job.status)}`}>
                    {job.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Job Meta */}
              <div className="flex flex-wrap gap-3 mb-4">
                <div className="flex items-center gap-1.5 text-sm text-white/50">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{job.city}, {job.province}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-white/50">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span className="font-medium text-blue-400">{formatCurrency(job.budget_min)} - {formatCurrency(job.budget_max)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-white/50">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>{job.bids_count || 0} bids</span>
                </div>
              </div>

              {/* Pending Bids Indicator */}
              {activeTab === 'pending' && pendingBidsCount(job.bids) > 0 && (
                <button
                  onClick={() => toggleExpand(job.id)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/15 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-blue-400">
                      {pendingBidsCount(job.bids)} pending bid{pendingBidsCount(job.bids) !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {expandedJob === job.id ? (
                    <ChevronUp className="w-4 h-4 text-blue-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-blue-400" />
                  )}
                </button>
              )}

              {/* Accepted Worker */}
              {activeTab === 'active' && (job.bids?.length ?? 0) > 0 && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/30 to-emerald-600/10 flex items-center justify-center text-emerald-400 font-bold text-sm">
                        {job.bids?.[0]?.worker?.profile?.full_name
                          ? getInitials(job.bids![0].worker.profile.full_name)
                          : 'W'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {job.bids?.[0]?.worker?.profile?.full_name || 'Worker'}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-emerald-400 font-medium">
                            {formatCurrency(job.bids?.[0]?.amount || 0)}
                          </span>
                          <span className="text-xs text-white/30">•</span>
                          <span className="text-xs text-white/40">{job.bids?.[0]?.estimated_days} days</span>
                        </div>
                      </div>
                    </div>
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
              )}

              {/* Expanded Bids */}
              {expandedJob === job.id && job.bids && job.bids.length > 0 && (
                <div className="mt-4 space-y-3 animate-fade-in">
                  <p className="text-xs text-white/40 font-medium uppercase tracking-wider">All Bids</p>
                  {job.bids.map((bid) => (
                    <div
                      key={bid.id}
                      className={`p-4 rounded-xl border transition-all ${
                        bid.status === 'accepted'
                          ? 'bg-emerald-500/10 border-emerald-500/20'
                          : bid.status === 'rejected'
                            ? 'bg-white/3 border-white/5 opacity-50'
                            : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-600/10 flex items-center justify-center text-blue-400 font-bold text-sm shrink-0">
                          {bid.worker?.profile?.full_name
                            ? getInitials(bid.worker.profile.full_name)
                            : 'W'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-medium text-white">
                                {bid.worker?.profile?.full_name || 'Worker'}
                              </h4>
                              {bid.worker && (
                                <div className="flex items-center gap-0.5 text-yellow-400">
                                  <Star className="w-3 h-3 fill-yellow-400" />
                                  <span className="text-xs">{bid.worker.rating.toFixed(1)}</span>
                                </div>
                              )}
                            </div>
                            <span className={`badge text-[10px] ${getStatusColor(bid.status)}`}>
                              {bid.status}
                            </span>
                          </div>
                          <p className="text-sm text-blue-400 font-medium">
                            {formatCurrency(bid.amount)} • {bid.estimated_days} days
                          </p>
                          {bid.message && (
                            <p className="text-sm text-white/50 mt-2 line-clamp-3">{bid.message}</p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-white/30 mt-2">
                            <Clock className="w-3 h-3" />
                            <span>{timeAgo(bid.created_at)}</span>
                          </div>
                          {bid.status === 'pending' && (
                            <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">
                              <button
                                onClick={() => handleAcceptBid(bid.id, job.id)}
                                disabled={accepting === bid.id}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20 transition-all text-xs font-medium disabled:opacity-50"
                              >
                                {accepting === bid.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Check className="w-3 h-3" />
                                )}
                                Accept
                              </button>
                              <button
                                onClick={() => handleRejectBid(bid.id)}
                                disabled={rejecting === bid.id}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all text-xs font-medium disabled:opacity-50"
                              >
                                {rejecting === bid.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <X className="w-3 h-3" />
                                )}
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Completed Jobs Show Review Link */}
              {activeTab === 'completed' && (
                <div className="mt-3 pt-3 border-t border-white/5 flex justify-end">
                  <span className="text-xs text-white/30">Job completed successfully</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
