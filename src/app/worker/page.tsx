'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { supabase } from '@/lib/supabase';
import { formatCurrency, timeAgo, getStatusColor } from '@/lib/utils';
import { StatCard } from '@/components/shared/StatCard';
import MapWrapper from '@/components/shared/MapWrapper';
import {
  Briefcase,
  DollarSign,
  Star,
  Eye,
  Clock,
  ArrowRight,
  ShieldAlert,
  UserCheck,
  TrendingUp,
  MessageSquare,
  MapPin,
} from 'lucide-react';
import Link from 'next/link';
import type { Job, Bid } from '@/types';

export default function WorkerDashboard() {
  const { workerProfile, profile } = useAuthStore();
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [recentBids, setRecentBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalEarnings: 0,
    rating: 0,
    profileViews: 0,
    totalBids: 0,
    successRate: 0,
  });

  useEffect(() => {
    if (!workerProfile?.id) return;
    const wpId = workerProfile.id;
    const wpUserId = workerProfile.user_id;
    const wpRating = workerProfile.rating;
    const wpCompletedJobs = workerProfile.completed_jobs;

    async function fetchData() {
      try {
        const [jobsRes, bidsRes, transactionsRes, allBidsRes] = await Promise.all([
          supabase
            .from('jobs')
            .select('*, category:categories(*)')
            .eq('status', 'open')
            .order('created_at', { ascending: false })
            .limit(5),
          supabase
            .from('bids')
            .select('*, job:jobs(*, category:categories(*))')
            .eq('worker_id', wpId)
            .order('created_at', { ascending: false })
            .limit(5),
          supabase
            .from('transactions')
            .select('amount, status')
            .eq('to_user_id', wpUserId)
            .eq('type', 'credit')
            .eq('status', 'completed'),
          supabase
            .from('bids')
            .select('status')
            .eq('worker_id', wpId),
        ]);

        if (jobsRes.data) setRecentJobs(jobsRes.data as Job[]);
        if (bidsRes.data) setRecentBids(bidsRes.data as Bid[]);

        const totalEarnings = transactionsRes.data?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
        const acceptedBids = bidsRes.data?.filter((b) => b.status === 'accepted') || [];
        const activeJobs = acceptedBids.length;
        const allBids = allBidsRes.data || [];
        const totalBidsCount = allBids.length;
        const acceptedCount = allBids.filter((b) => b.status === 'accepted').length;
        const successRate = totalBidsCount > 0 ? Math.round((acceptedCount / totalBidsCount) * 100) : 0;

        setStats({
          activeJobs,
          totalEarnings,
          rating: wpRating || 0,
          profileViews: wpCompletedJobs || 0,
          totalBids: totalBidsCount,
          successRate,
        });
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [workerProfile?.id, workerProfile?.user_id, workerProfile?.rating, workerProfile?.completed_jobs]);

  const isProfileIncomplete = workerProfile && (!workerProfile.cnic_number || !workerProfile.bio);
  const hasLocation = workerProfile?.latitude && workerProfile?.longitude;

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card p-5">
              <div className="skeleton h-4 w-20 mb-3" />
              <div className="skeleton h-7 w-14 mb-2" />
              <div className="skeleton h-3 w-16" />
            </div>
          ))}
        </div>
        <div className="glass-card p-6">
          <div className="skeleton h-5 w-40 mb-4" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="skeleton h-10 w-10 rounded-lg" />
                <div className="flex-1">
                  <div className="skeleton h-4 w-48 mb-2" />
                  <div className="skeleton h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statusBadgeClass =
    workerProfile?.status === 'active'
      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      : workerProfile?.status === 'pending'
        ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
        : 'bg-red-500/20 text-red-400 border-red-500/30';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Pending Verification Banner */}
      {workerProfile?.status === 'pending' && (
        <div className="glass-card p-4 border-yellow-500/20 bg-gradient-to-r from-yellow-500/10 to-orange-500/5">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/20 shrink-0">
              <ShieldAlert className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-yellow-400">Verification Pending</h3>
              <p className="text-sm text-white/50 mt-1">
                Your account is under review. You can browse jobs but cannot place bids until verified.
                Please ensure your CNIC documents are uploaded in the profile section.
              </p>
              <Link
                href="/worker/profile"
                className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-yellow-400 hover:text-yellow-300 transition-colors"
              >
                Go to Profile <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Complete Your Profile Banner */}
      {isProfileIncomplete && workerProfile?.status !== 'active' && (
        <div className="glass-card p-4 border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 to-teal-500/5">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 shrink-0">
              <UserCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-emerald-400">Complete Your Profile to Get More Jobs</h3>
              <p className="text-sm text-white/50 mt-1">
                {!workerProfile.cnic_number && !workerProfile.bio
                  ? 'Complete your profile setup with CNIC and bio to attract employers and get verified faster.'
                  : !workerProfile.cnic_number
                    ? 'Upload your CNIC documents through the setup wizard to get verified faster.'
                    : 'Add a bio and complete your profile to stand out to employers.'}
              </p>
              <Link
                href="/worker/setup"
                className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Complete Setup <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'Worker'}! 👋
          </h1>
          <p className="text-white/50 mt-1">
            Here&apos;s what&apos;s happening with your work today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/40">Status:</span>
          <span className={`badge ${statusBadgeClass}`}>
            {(workerProfile?.status ?? '').charAt(0).toUpperCase() + (workerProfile?.status ?? '').slice(1)}
          </span>
        </div>
      </div>

      {/* Stats Grid - 6 columns */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Active Jobs"
          value={stats.activeJobs}
          icon={<Briefcase className="w-5 h-5" />}
          color="green"
          change={`${workerProfile?.completed_jobs || 0} completed`}
          changeType="up"
        />
        <StatCard
          title="Earnings"
          value={formatCurrency(stats.totalEarnings)}
          icon={<DollarSign className="w-5 h-5" />}
          color="blue"
          change="Lifetime"
          changeType="up"
        />
        <StatCard
          title="Rating"
          value={`${stats.rating.toFixed(1)}`}
          icon={<Star className="w-5 h-5" />}
          color="yellow"
          change={`${workerProfile?.total_reviews || 0} reviews`}
          changeType="up"
        />
        <StatCard
          title="Bids Placed"
          value={stats.totalBids}
          icon={<MessageSquare className="w-5 h-5" />}
          color="purple"
          change={`${stats.successRate}% success`}
          changeType="up"
        />
        <StatCard
          title="Completed"
          value={stats.profileViews}
          icon={<Eye className="w-5 h-5" />}
          color="green"
          change="All time"
          changeType="up"
        />
        <StatCard
          title="Success Rate"
          value={`${stats.successRate}%`}
          icon={<TrendingUp className="w-5 h-5" />}
          color="blue"
          change="Bid acceptance"
          changeType="up"
        />
      </div>

      {/* Map + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Worker Location Map */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-400" />
              My Location
            </h2>
          </div>
          {hasLocation ? (
            <MapWrapper
              latitude={workerProfile!.latitude!}
              longitude={workerProfile!.longitude!}
              height="220px"
              zoom={14}
            />
          ) : (
            <div className="h-[220px] rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-8 h-8 text-white/15 mx-auto mb-2" />
                <p className="text-sm text-white/30">No location set</p>
                <p className="text-xs text-white/20 mt-1">
                  Add your location in the profile to appear on the map
                </p>
              </div>
            </div>
          )}
          {workerProfile?.city && (
            <p className="text-xs text-white/40 mt-3 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              {workerProfile.city}{workerProfile.province ? `, ${workerProfile.province}` : ''}
            </p>
          )}
        </div>

        {/* Recent Jobs */}
        <div className="glass-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Jobs</h2>
            <Link
              href="/worker/jobs"
              className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {recentJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Briefcase className="w-12 h-12 text-white/20 mb-3" />
              <p className="text-white/40 text-sm">No open jobs available right now</p>
              <p className="text-white/20 text-xs mt-1">Check back later for new opportunities</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-1">
              {recentJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/worker/jobs/${job.id}`}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all group"
                >
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors shrink-0">
                    <Briefcase className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white truncate group-hover:text-emerald-400 transition-colors">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-white/40">{job.city}</span>
                      <span className="text-xs text-white/30">•</span>
                      <span className="text-xs text-white/40">{job.category?.name || 'General'}</span>
                      {job.urgency === 'urgent' && (
                        <>
                          <span className="text-xs text-white/30">•</span>
                          <span className="text-xs text-red-400 font-medium">Urgent</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-emerald-400">
                      {formatCurrency(job.budget_min)}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-white/30 mt-1">
                      <Clock className="w-3 h-3" />
                      <span>{timeAgo(job.created_at)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Bids */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">My Recent Bids</h2>
          <Link
            href="/worker/my-jobs"
            className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {recentBids.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Clock className="w-12 h-12 text-white/20 mb-3" />
            <p className="text-white/40 text-sm">No bids placed yet</p>
            <p className="text-white/20 text-xs mt-1">
              Browse available jobs and start bidding!
            </p>
            <Link
              href="/worker/jobs"
              className="mt-4 px-4 py-2 text-sm font-medium rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20 transition-all"
            >
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentBids.map((bid) => (
              <div
                key={bid.id}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all"
              >
                <div className="p-2.5 rounded-lg bg-blue-500/10 shrink-0">
                  <DollarSign className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-white truncate">
                    {bid.job?.title || 'Job'}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-white/40">
                      Bid: {formatCurrency(bid.amount)}
                    </span>
                    <span className="text-xs text-white/30">•</span>
                    <span className="text-xs text-white/40">{bid.estimated_days} days</span>
                  </div>
                </div>
                <span className={`badge text-xs ${getStatusColor(bid.status)}`}>
                  {bid.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
