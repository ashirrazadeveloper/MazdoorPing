'use client';

import { useState, useEffect } from 'react';
import { useLanguageStore } from '@/store/language-store';
import { useAuthStore } from '@/store/auth-store';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import { StatCard } from '@/components/shared/StatCard';
import {
  TrendingUp,
  BarChart3,
  Users,
  Download,
  Calendar,
  BarChart as BarChartIcon,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';

type TimeView = 'monthly' | 'weekly' | 'yearly';

interface EarningData {
  month: string;
  earnings: number;
}

interface CategoryJob {
  category: string;
  jobs: number;
}

interface RatingData {
  month: string;
  rating: number;
}

const tooltipStyle = {
  backgroundColor: 'rgba(15, 15, 25, 0.95)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  color: '#fff',
  fontSize: '13px',
};

export default function AnalyticsPage() {
  const { t } = useLanguageStore();
  const { profile } = useAuthStore();
  const [timeView, setTimeView] = useState<TimeView>('monthly');
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  const [earnings, setEarnings] = useState<EarningData[]>([]);
  const [weeklyEarnings, setWeeklyEarnings] = useState<EarningData[]>([]);
  const [yearlyEarnings, setYearlyEarnings] = useState<EarningData[]>([]);
  const [jobsByCategory, setJobsByCategory] = useState<CategoryJob[]>([]);
  const [ratingTrend, setRatingTrend] = useState<RatingData[]>([]);

  const [totalThisMonth, setTotalThisMonth] = useState(0);
  const [avgMonthly, setAvgMonthly] = useState(0);
  const [completionRate, setCompletionRate] = useState(0);
  const [repeatClients, setRepeatClients] = useState(0);
  const [totalJobs, setTotalJobs] = useState(0);

  useEffect(() => {
    async function fetchAnalytics() {
      if (!profile?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch completed jobs for this worker
        const { data: completedJobs, error: jobsError } = await supabase
          .from('jobs')
          .select('*')
          .eq('worker_id', profile.id)
          .eq('status', 'completed')
          .order('created_at', { ascending: true });

        if (jobsError || !completedJobs || completedJobs.length === 0) {
          setHasData(false);
          setLoading(false);
          return;
        }

        setHasData(true);
        setTotalJobs(completedJobs.length);

        // Calculate monthly earnings
        const monthlyMap = new Map<string, number>();
        const weekMap = new Map<string, number>();
        const yearMap = new Map<string, number>();
        const catMap = new Map<string, number>();
        let totalEarned = 0;
        const employers = new Set<string>();

        completedJobs.forEach((job: Record<string, unknown>) => {
          const budget = (job.budget as number) || (job.amount as number) || 0;
          const cat = (job.category as string) || 'Other';
          const date = job.completed_at || job.created_at;
          if (!date) return;

          const d = new Date(date as string);
          const monthKey = d.toLocaleString('en', { month: 'short' });
          const weekNum = Math.ceil(d.getDate() / 7);
          const weekKey = `W${weekNum}`;
          const yearKey = String(d.getFullYear());

          // Monthly
          monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + budget);
          // Weekly
          weekMap.set(weekKey, (weekMap.get(weekKey) || 0) + budget);
          // Yearly
          yearMap.set(yearKey, (yearMap.get(yearKey) || 0) + budget);
          // Category
          catMap.set(cat, (catMap.get(cat) || 0) + 1);
          // Total
          totalEarned += budget;
          // Repeat employers
          const employerId = job.employer_id as string;
          if (employerId) employers.add(employerId);
        });

        // Last month earnings
        const lastMonth = completedJobs.filter((j: Record<string, unknown>) => {
          const d = new Date((j.completed_at || j.created_at) as string);
          const now = new Date();
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
        const lastMonthTotal = lastMonth.reduce((s: number, j: Record<string, unknown>) => s + ((j.budget as number) || (j.amount as number) || 0), 0);
        setTotalThisMonth(lastMonthTotal);
        setAvgMonthly(totalEarned > 0 ? Math.round(totalEarned / Math.max(monthlyMap.size, 1)) : 0);
        setCompletionRate(completedJobs.length > 0 ? Math.round((completedJobs.length / Math.max(totalJobs, completedJobs.length)) * 100) : 0);
        setRepeatClients(employers.size);

        // Convert maps to arrays
        const mArr: EarningData[] = [];
        monthlyMap.forEach((v, k) => mArr.push({ month: k, earnings: v }));
        setEarnings(mArr.length > 0 ? mArr : []);

        const wArr: EarningData[] = [];
        weekMap.forEach((v, k) => wArr.push({ month: k, earnings: v }));
        setWeeklyEarnings(wArr.length > 0 ? wArr : []);

        const yArr: EarningData[] = [];
        yearMap.forEach((v, k) => yArr.push({ month: k, earnings: v }));
        setYearlyEarnings(yArr.length > 0 ? yArr : []);

        const cArr: CategoryJob[] = [];
        catMap.forEach((v, k) => cArr.push({ category: k, jobs: v }));
        setJobsByCategory(cArr.length > 0 ? cArr : []);

        // Fetch ratings for trend
        const { data: reviews } = await supabase
          .from('reviews')
          .select('rating, created_at')
          .eq('worker_id', profile.id)
          .order('created_at', { ascending: true });

        if (reviews && reviews.length > 0) {
          const rArr: RatingData[] = reviews.map((r: Record<string, unknown>) => ({
            month: new Date(r.created_at as string).toLocaleString('en', { month: 'short' }),
            rating: (r.rating as number) || 0,
          }));
          setRatingTrend(rArr);
        }
      } catch (err) {
        console.error('Analytics fetch error:', err);
        setHasData(false);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [profile?.id]);

  const earningsByView: Record<TimeView, EarningData[]> = {
    monthly: earnings,
    weekly: weeklyEarnings,
    yearly: yearlyEarnings,
  };

  const currentEarnings = earningsByView[timeView];
  const xKey = 'month';

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-6">
              <div className="skeleton h-4 w-28 mb-3" />
              <div className="skeleton h-8 w-24" />
            </div>
          ))}
        </div>
        <div className="glass-card p-6">
          <div className="skeleton h-5 w-48 mb-4" />
          <div className="skeleton h-72 w-full" />
        </div>
      </div>
    );
  }

  // No data state
  if (!hasData) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">{t('incomeAnalytics.title')}</h1>
          <p className="text-white/50 mt-1 text-sm lg:text-base">{t('incomeAnalytics.subtitle')}</p>
        </div>
        <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
            <TrendingUp className="w-8 h-8 text-emerald-400/40" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">
            {t('common.noData') || 'No Analytics Yet'}
          </h2>
          <p className="text-sm text-white/40 max-w-md">
            {t('incomeAnalytics.noDataDesc') || 'Complete some jobs to see your earnings analytics, ratings trend, and category breakdown here.'}
          </p>
          <div className="flex items-center gap-4 mt-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white/50">
              <BarChartIcon className="w-4 h-4 text-emerald-400/60" />
              <span>{t('incomeAnalytics.jobsByCategory') || 'Jobs by Category'}</span>
            </div>
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
          <h1 className="text-2xl lg:text-3xl font-bold text-white">{t('incomeAnalytics.title')}</h1>
          <p className="text-white/50 mt-1 text-sm lg:text-base">{t('incomeAnalytics.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const csvContent = [
                [xKey, 'Earnings'],
                ...currentEarnings.map((d) => [d[xKey as keyof typeof d], d.earnings]),
              ]
                .map((row) => row.join(','))
                .join('\n');
              const blob = new Blob([csvContent], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `earnings-${timeView}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 border border-white/10 transition-all text-sm font-medium min-h-[44px]"
          >
            <Download className="w-4 h-4" />
            {t('incomeAnalytics.exportReport')}
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('incomeAnalytics.thisMonth')}
          value={formatCurrency(totalThisMonth)}
          icon={<TrendingUp className="w-5 h-5 lg:w-6 lg:h-6" />}
          color="green"
          change={`+${totalJobs} ${t('incomeAnalytics.jobsByCategory')?.split(' ')[0] || 'jobs'}`}
          changeType="up"
        />
        <StatCard
          title={t('incomeAnalytics.averageMonthly')}
          value={formatCurrency(avgMonthly)}
          icon={<Calendar className="w-5 h-5 lg:w-6 lg:h-6" />}
          color="blue"
          change={t('incomeAnalytics.monthly')}
          changeType="up"
        />
        <StatCard
          title={t('incomeAnalytics.completionRate')}
          value={`${completionRate}%`}
          icon={<BarChart3 className="w-5 h-5 lg:w-6 lg:h-6" />}
          color="purple"
          change={completionRate >= 90 ? (t('common.excellent') || 'Excellent') : (t('common.good') || 'Good')}
          changeType="up"
        />
        <StatCard
          title={t('incomeAnalytics.repeatClients')}
          value={repeatClients}
          icon={<Users className="w-5 h-5 lg:w-6 lg:h-6" />}
          color="orange"
          change={t('incomeAnalytics.thisMonth')}
          changeType="up"
        />
      </div>

      {/* Earnings Trend */}
      <div className="glass-card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">{t('incomeAnalytics.earningsTrend')}</h2>
          </div>
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
            {(['monthly', 'weekly', 'yearly'] as TimeView[]).map((view) => (
              <button
                key={view}
                onClick={() => setTimeView(view)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold transition-all min-h-[36px] ${
                  timeView === view
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                }`}
              >
                {t(`incomeAnalytics.${view}`)}
              </button>
            ))}
          </div>
        </div>
        {currentEarnings.length > 0 ? (
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentEarnings} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis
                  dataKey={xKey}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#ffffff60', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#ffffff60', fontSize: 12 }}
                  tickFormatter={(val: number) => `${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => [formatCurrency(Number(value)), 'Earnings'] as unknown as [string, string]}
                />
                <Area
                  type="monotone"
                  dataKey="earnings"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#earningsGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 sm:h-72 flex items-center justify-center text-white/30 text-sm">
            No data available for {t(`incomeAnalytics.${timeView}`)} view
          </div>
        )}
      </div>

      {/* Bottom Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Jobs by Category */}
        <div className="glass-card p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">{t('incomeAnalytics.jobsByCategory')}</h2>
            <div className="flex items-center gap-2 text-sm">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Jobs
              </span>
            </div>
          </div>
          {jobsByCategory.length > 0 ? (
            <div className="h-56 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={jobsByCategory} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis
                    dataKey="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#ffffff60', fontSize: 11 }}
                    angle={-30}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#ffffff60', fontSize: 12 }}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="jobs" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 sm:h-64 flex items-center justify-center text-white/30 text-sm">
              No category data yet
            </div>
          )}
        </div>

        {/* Rating Trend */}
        <div className="glass-card p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">{t('incomeAnalytics.ratingTrend')}</h2>
            <div className="flex items-center gap-2 text-sm">
              <span className="flex items-center gap-1 text-blue-400">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                Rating
              </span>
            </div>
          </div>
          {ratingTrend.length > 0 ? (
            <div className="h-56 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ratingTrend} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#ffffff60', fontSize: 12 }}
                  />
                  <YAxis
                    domain={[0, 5]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#ffffff60', fontSize: 12 }}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value: string) => (
                      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{value}</span>
                    )}
                  />
                  <Line
                    type="monotone"
                    dataKey="rating"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    dot={{ fill: '#3b82f6', strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 sm:h-64 flex items-center justify-center text-white/30 text-sm">
              No ratings yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
