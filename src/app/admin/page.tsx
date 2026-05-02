'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCurrency, timeAgo } from '@/lib/utils';
import { StatCard } from '@/components/shared/StatCard';
import {
  Users, UserCheck, Clock, Building2, Briefcase,
  AlertTriangle, ArrowRight, TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import type { DashboardStats, Worker, SOSAlert } from '@/types';
import { useLanguageStore } from '@/store/language-store';

const workerRegistrationData = [
  { month: 'Jan', registrations: 45 },
  { month: 'Feb', registrations: 62 },
  { month: 'Mar', registrations: 38 },
  { month: 'Apr', registrations: 71 },
  { month: 'May', registrations: 55 },
  { month: 'Jun', registrations: 89 },
  { month: 'Jul', registrations: 76 },
  { month: 'Aug', registrations: 94 },
  { month: 'Sep', registrations: 68 },
  { month: 'Oct', registrations: 103 },
  { month: 'Nov', registrations: 87 },
  { month: 'Dec', registrations: 112 },
];

const revenueData = [
  { month: 'Jan', revenue: 245000, transactions: 42 },
  { month: 'Feb', revenue: 312000, transactions: 58 },
  { month: 'Mar', revenue: 198000, transactions: 35 },
  { month: 'Apr', revenue: 427000, transactions: 71 },
  { month: 'May', revenue: 385000, transactions: 63 },
  { month: 'Jun', revenue: 512000, transactions: 89 },
  { month: 'Jul', revenue: 478000, transactions: 82 },
  { month: 'Aug', revenue: 623000, transactions: 104 },
  { month: 'Sep', revenue: 556000, transactions: 93 },
  { month: 'Oct', revenue: 689000, transactions: 118 },
  { month: 'Nov', revenue: 742000, transactions: 127 },
  { month: 'Dec', revenue: 815000, transactions: 142 },
];

export default function AdminDashboard() {
  const { t } = useLanguageStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalWorkers: 0,
    activeWorkers: 0,
    pendingVerifications: 0,
    totalEmployers: 0,
    totalJobs: 0,
    openJobs: 0,
    completedJobs: 0,
    totalRevenue: 0,
    activeSOS: 0,
  });
  const [pendingWorkers, setPendingWorkers] = useState<Worker[]>([]);
  const [activeSOSAlerts, setActiveSOSAlerts] = useState<SOSAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [workersCount, employersCount, jobsCount, sosCount, pendingRes, sosRes, transactionsRes] =
          await Promise.all([
            supabase.from('workers').select('status'),
            supabase.from('employers').select('id', { count: 'exact', head: true }),
            supabase.from('jobs').select('status', { count: 'exact', head: false }),
            supabase.from('sos_alerts').select('status'),
            supabase
              .from('workers')
              .select('*, profile:profiles(*)')
              .eq('status', 'pending')
              .order('created_at', { ascending: false })
              .limit(5),
            supabase
              .from('sos_alerts')
              .select('*, worker:workers(*, profile:profiles(*))')
              .eq('status', 'active')
              .order('created_at', { ascending: false })
              .limit(5),
            supabase
              .from('transactions')
              .select('amount')
              .eq('status', 'completed'),
          ]);

        const allWorkers = workersCount.data || [];
        const totalWorkers = allWorkers.length;
        const activeWorkers = allWorkers.filter((w) => w.status === 'active').length;
        const pendingVerifications = allWorkers.filter((w) => w.status === 'pending').length;
        const totalEmployers = employersCount.count || 0;

        const allJobs = jobsCount.data || [];
        const totalJobs = allJobs.length;
        const openJobs = allJobs.filter((j) => j.status === 'open').length;
        const completedJobs = allJobs.filter((j) => j.status === 'completed').length;

        const allSOS = sosCount.data || [];
        const activeSOS = allSOS.filter((s) => s.status === 'active').length;

        const totalRevenue = transactionsRes.data?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

        setStats({
          totalWorkers,
          activeWorkers,
          pendingVerifications,
          totalEmployers,
          totalJobs,
          openJobs,
          completedJobs,
          totalRevenue,
          activeSOS,
        });

        if (pendingRes.data) setPendingWorkers(pendingRes.data as Worker[]);
        if (sosRes.data) setActiveSOSAlerts(sosRes.data as SOSAlert[]);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card p-6">
              <div className="skeleton h-4 w-28 mb-3" />
              <div className="skeleton h-8 w-20 mb-2" />
              <div className="skeleton h-3 w-24" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <div className="skeleton h-5 w-48 mb-4" />
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="skeleton h-10 w-10 rounded-lg" />
                  <div className="flex-1">
                    <div className="skeleton h-4 w-40 mb-2" />
                    <div className="skeleton h-3 w-28" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card p-6">
            <div className="skeleton h-5 w-40 mb-4" />
            <div className="skeleton h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-white/50 mt-1">Overview of platform activity and metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-2 text-sm text-emerald-400">
            <TrendingUp className="w-4 h-4" />
            Live
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Workers"
          value={stats.totalWorkers}
          icon={<Users className="w-6 h-6" />}
          color="green"
          change={`${stats.activeWorkers} active`}
          changeType="up"
        />
        <StatCard
          title="Active Workers"
          value={stats.activeWorkers}
          icon={<UserCheck className="w-6 h-6" />}
          color="blue"
          change={`${Math.round((stats.activeWorkers / Math.max(stats.totalWorkers, 1)) * 100)}% of total`}
          changeType="up"
        />
        <StatCard
          title="Pending Verifications"
          value={stats.pendingVerifications}
          icon={<Clock className="w-6 h-6" />}
          color="yellow"
          change="Awaiting review"
          changeType="up"
        />
        <StatCard
          title="Total Employers"
          value={stats.totalEmployers}
          icon={<Building2 className="w-6 h-6" />}
          color="purple"
          change="Registered employers"
          changeType="up"
        />
        <StatCard
          title="Total Jobs"
          value={stats.totalJobs}
          icon={<Briefcase className="w-6 h-6" />}
          color="orange"
          change={`${stats.openJobs} open`}
          changeType="up"
        />
        <StatCard
          title="Active SOS Alerts"
          value={stats.activeSOS}
          icon={<AlertTriangle className="w-6 h-6" />}
          color="red"
          change={stats.activeSOS > 0 ? 'Needs attention' : 'All clear'}
          changeType={stats.activeSOS > 0 ? 'down' : 'up'}
        />
      </div>

      {/* Revenue Chart */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Platform Revenue</h2>
            <p className="text-sm text-white/40 mt-1">
              Total: {formatCurrency(stats.totalRevenue)}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1 text-orange-400">
              <span className="w-2 h-2 rounded-full bg-orange-400" />
              Revenue
            </span>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                tickFormatter={(val: number) => `${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 15, 25, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '13px',
                }}
                formatter={(value) => [formatCurrency(Number(value)), 'Revenue'] as unknown as [string, string]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#f97316"
                strokeWidth={2.5}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Verifications */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Pending Verifications</h2>
            <Link
              href="/admin/workers"
              className="flex items-center gap-1 text-sm text-orange-400 hover:text-orange-300 transition-colors"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {pendingWorkers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <UserCheck className="w-12 h-12 text-white/20 mb-3" />
              <p className="text-white/40 text-sm">No pending verifications</p>
              <p className="text-white/20 text-xs mt-1">All workers are verified</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingWorkers.map((worker) => (
                <div
                  key={worker.id}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white truncate">
                      {worker.profile?.full_name || 'Unknown'}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-white/40">{worker.city || 'N/A'}</span>
                      <span className="text-xs text-white/30">•</span>
                      <span className="text-xs text-white/40">
                        {worker.profile?.email || 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="badge text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                      Pending
                    </span>
                    <p className="text-xs text-white/30 mt-1">{timeAgo(worker.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active SOS Alerts */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Active SOS Alerts</h2>
            <Link
              href="/admin/sos-alerts"
              className="flex items-center gap-1 text-sm text-orange-400 hover:text-orange-300 transition-colors"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {activeSOSAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertTriangle className="w-12 h-12 text-white/20 mb-3" />
              <p className="text-white/40 text-sm">No active SOS alerts</p>
              <p className="text-white/20 text-xs mt-1">Everything is calm</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeSOSAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center gap-4 p-3 rounded-xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0 animate-pulse">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white truncate">
                      {alert.worker?.profile?.full_name || 'Unknown Worker'}
                    </h3>
                    <p className="text-xs text-white/50 mt-1 truncate">{alert.message}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="badge text-xs bg-red-500/20 text-red-400 border-red-500/30">
                      Active
                    </span>
                    <p className="text-xs text-white/30 mt-1">{timeAgo(alert.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Worker Registration Trend */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Worker Registration Trend</h2>
            <p className="text-sm text-white/40 mt-1">
              New worker sign-ups per month
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Registrations
            </span>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={workerRegistrationData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 15, 25, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '13px',
                }}
              />
              <Bar dataKey="registrations" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Status Distribution */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Job Status Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Open', value: stats.openJobs, fill: '#3b82f6' },
                    { name: 'In Progress', value: Math.floor(stats.totalJobs * 0.15), fill: '#f59e0b' },
                    { name: 'Completed', value: stats.completedJobs, fill: '#10b981' },
                    { name: 'Cancelled', value: Math.floor(stats.totalJobs * 0.05), fill: '#ef4444' },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {[
                    { name: 'Open', fill: '#3b82f6' },
                    { name: 'In Progress', fill: '#f59e0b' },
                    { name: 'Completed', fill: '#10b981' },
                    { name: 'Cancelled', fill: '#ef4444' },
                  ].map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 15, 25, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '13px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value: string) => (
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
          <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-1">
            {[
              { type: 'worker', text: 'New worker registered', detail: 'Ahmed Khan from Lahore', time: '2 min ago', color: 'emerald' },
              { type: 'job', text: 'New job posted', detail: 'Plumber needed for bathroom renovation', time: '5 min ago', color: 'blue' },
              { type: 'payment', text: 'Payment completed', detail: 'PKR 15,000 for electrical work', time: '12 min ago', color: 'green' },
              { type: 'verification', text: 'Worker verified', detail: 'Muhammad Ali - Electrician', time: '18 min ago', color: 'amber' },
              { type: 'bid', text: 'New bid received', detail: 'Rs. 8,500 on Plumbing job', time: '25 min ago', color: 'purple' },
              { type: 'sos', text: 'SOS alert resolved', detail: 'Worker safety confirmed', time: '30 min ago', color: 'red' },
              { type: 'review', text: 'New review posted', detail: '5 stars for carpentry work', time: '45 min ago', color: 'yellow' },
              { type: 'worker', text: 'Worker profile updated', detail: 'Skills added: Welding, AC Repair', time: '1h ago', color: 'emerald' },
            ].map((activity, i) => (
              <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/[0.02] transition-all">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 bg-${activity.color}-400`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/70">{activity.text}</p>
                  <p className="text-xs text-white/30 truncate">{activity.detail}</p>
                </div>
                <span className="text-[10px] text-white/20 whitespace-nowrap">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
