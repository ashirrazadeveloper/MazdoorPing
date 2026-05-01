'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { supabase } from '@/lib/supabase';
import { formatCurrency, timeAgo, getStatusColor } from '@/lib/utils';
import { StatCard } from '@/components/shared/StatCard';
import { Briefcase, DollarSign, Star, Zap, ArrowRight, Clock, MessageCircle, PlusCircle, Search } from 'lucide-react';
import Link from 'next/link';
import type { Job, Bid, Worker } from '@/types';

export default function EmployerDashboard() {
  const { employerProfile, profile } = useAuthStore();
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [recentBids, setRecentBids] = useState<(Bid & { worker?: Worker })[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalSpent: 0,
    rating: 0,
  });

  useEffect(() => {
    if (!employerProfile?.id) return;

    async function fetchData() {
      try {
        const [jobsRes, bidsRes] = await Promise.all([
          supabase
            .from('jobs')
            .select('*, category:categories(*)')
            .eq('employer_id', employerProfile.id)
            .order('created_at', { ascending: false })
            .limit(5),
          supabase
            .from('bids')
            .select('*, worker:workers(*, profile:profiles(*))')
            .eq('job.employer_id', employerProfile.id)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(5),
        ]);

        if (jobsRes.data) {
          const jobs = jobsRes.data as Job[];
          setRecentJobs(jobs);
          const activeJobs = jobs.filter((j) => j.status === 'open' || j.status === 'in_progress').length;
          setStats((prev) => ({
            ...prev,
            totalJobs: employerProfile.total_posted_jobs || jobs.length,
            activeJobs,
            totalSpent: employerProfile.total_spent || 0,
            rating: employerProfile.rating || 0,
          }));
        }

        if (bidsRes.data) setRecentBids(bidsRes.data as (Bid & { worker?: Worker })[]);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [employerProfile?.id, employerProfile?.total_posted_jobs, employerProfile?.total_spent, employerProfile?.rating]);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-6">
              <div className="skeleton h-4 w-24 mb-3" />
              <div className="skeleton h-8 w-16 mb-2" />
              <div className="skeleton h-3 w-20" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="glass-card p-6">
              <div className="skeleton h-5 w-40 mb-4" />
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="flex gap-4 items-center">
                    <div className="skeleton h-10 w-10 rounded-lg" />
                    <div className="flex-1">
                      <div className="skeleton h-4 w-48 mb-2" />
                      <div className="skeleton h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'Employer'}! 👋
          </h1>
          <p className="text-white/50 mt-1">
            Here&apos;s an overview of your hiring activity.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          href="/employer/post-job"
          className="glass-card p-4 flex items-center gap-4 group hover:!border-blue-500/30"
        >
          <div className="p-3 rounded-xl bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors shrink-0">
            <PlusCircle className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Post New Job</h3>
            <p className="text-xs text-white/40">Create a new job listing</p>
          </div>
          <ArrowRight className="w-5 h-5 text-white/20 ml-auto group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
        </Link>
        <Link
          href="/employer/find-workers"
          className="glass-card p-4 flex items-center gap-4 group hover:!border-blue-500/30"
        >
          <div className="p-3 rounded-xl bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors shrink-0">
            <Search className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Find Workers</h3>
            <p className="text-xs text-white/40">Browse available workers</p>
          </div>
          <ArrowRight className="w-5 h-5 text-white/20 ml-auto group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Posted Jobs"
          value={stats.totalJobs}
          icon={<Briefcase className="w-6 h-6" />}
          color="blue"
          change={`${stats.activeJobs} currently active`}
          changeType="up"
        />
        <StatCard
          title="Active Jobs"
          value={stats.activeJobs}
          icon={<Zap className="w-6 h-6" />}
          color="green"
          change="Open & in progress"
          changeType="up"
        />
        <StatCard
          title="Total Spent"
          value={formatCurrency(stats.totalSpent)}
          icon={<DollarSign className="w-6 h-6" />}
          color="orange"
          change="Lifetime spending"
          changeType="up"
        />
        <StatCard
          title="Worker Rating"
          value={`${stats.rating.toFixed(1)} ★`}
          icon={<Star className="w-6 h-6" />}
          color="yellow"
          change={`${employerProfile?.total_reviews || 0} reviews`}
          changeType="up"
        />
      </div>

      {/* Recent Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Job Postings */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Job Postings</h2>
            <Link
              href="/employer/my-bookings"
              className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {recentJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Briefcase className="w-12 h-12 text-white/20 mb-3" />
              <p className="text-white/40 text-sm">No jobs posted yet</p>
              <p className="text-white/20 text-xs mt-1">Start by posting your first job</p>
              <Link
                href="/employer/post-job"
                className="mt-4 px-4 py-2 text-sm font-medium rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/20 transition-all"
              >
                Post a Job
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all group"
                >
                  <div className="p-2.5 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors shrink-0">
                    <Briefcase className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white truncate group-hover:text-blue-400 transition-colors">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-white/40">{job.city}</span>
                      <span className="text-xs text-white/30">•</span>
                      <span className="text-xs text-white/40">{job.bids_count || 0} bids</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-blue-400">
                      {formatCurrency(job.budget_min)}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`badge text-[10px] ${getStatusColor(job.status)}`}>
                        {job.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Bids Received */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Bids Received</h2>
            <Link
              href="/employer/my-bookings"
              className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {recentBids.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageCircle className="w-12 h-12 text-white/20 mb-3" />
              <p className="text-white/40 text-sm">No bids received yet</p>
              <p className="text-white/20 text-xs mt-1">
                Workers will bid on your posted jobs
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentBids.map((bid) => (
                <div
                  key={bid.id}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-600/10 flex items-center justify-center text-blue-400 font-bold text-sm shrink-0">
                    {bid.worker?.profile?.full_name?.charAt(0) || 'W'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white truncate">
                      {bid.worker?.profile?.full_name || 'Worker'}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-white/40">
                        Bid: {formatCurrency(bid.amount)}
                      </span>
                      <span className="text-xs text-white/30">•</span>
                      <span className="text-xs text-white/40">{bid.estimated_days} days</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-white/30 shrink-0">
                    <Clock className="w-3 h-3" />
                    <span>{timeAgo(bid.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
