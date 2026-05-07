'use client';

import { useState } from 'react';
import { useLanguageStore } from '@/store/language-store';
import { formatCurrency } from '@/lib/utils';
import { StatCard } from '@/components/shared/StatCard';
import {
  TrendingUp,
  BarChart3,
  Users,
  Download,
  Calendar,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';

type TimeView = 'monthly' | 'weekly' | 'yearly';

const monthlyEarnings = [
  { month: 'Jan', earnings: 45000 },
  { month: 'Feb', earnings: 52000 },
  { month: 'Mar', earnings: 38000 },
  { month: 'Apr', earnings: 61000 },
  { month: 'May', earnings: 55000 },
  { month: 'Jun', earnings: 73000 },
  { month: 'Jul', earnings: 68000 },
  { month: 'Aug', earnings: 82000 },
  { month: 'Sep', earnings: 71000 },
  { month: 'Oct', earnings: 95000 },
  { month: 'Nov', earnings: 88000 },
  { month: 'Dec', earnings: 105000 },
];

const weeklyEarnings = [
  { month: 'W1', earnings: 18000 },
  { month: 'W2', earnings: 22000 },
  { month: 'W3', earnings: 25000 },
  { month: 'W4', earnings: 19500 },
];

const yearlyEarnings = [
  { month: '2020', earnings: 320000 },
  { month: '2021', earnings: 485000 },
  { month: '2022', earnings: 620000 },
  { month: '2023', earnings: 785000 },
  { month: '2024', earnings: 933000 },
];

const jobsByCategory = [
  { category: 'Electrician', jobs: 24 },
  { category: 'Plumber', jobs: 18 },
  { category: 'Carpenter', jobs: 15 },
  { category: 'Painter', jobs: 12 },
  { category: 'AC Repair', jobs: 10 },
  { category: 'Welder', jobs: 8 },
  { category: 'Mason', jobs: 6 },
];

const ratingTrend = [
  { month: 'Jan', rating: 4.2 },
  { month: 'Feb', rating: 4.3 },
  { month: 'Mar', rating: 4.1 },
  { month: 'Apr', rating: 4.5 },
  { month: 'May', rating: 4.4 },
  { month: 'Jun', rating: 4.6 },
  { month: 'Jul', rating: 4.7 },
  { month: 'Aug', rating: 4.5 },
  { month: 'Sep', rating: 4.8 },
  { month: 'Oct', rating: 4.7 },
  { month: 'Nov', rating: 4.9 },
  { month: 'Dec', rating: 4.8 },
];

const earningsByView: Record<TimeView, typeof monthlyEarnings> = {
  monthly: monthlyEarnings,
  weekly: weeklyEarnings,
  yearly: yearlyEarnings,
};

const tooltipStyle = {
  backgroundColor: 'rgba(15, 15, 25, 0.95)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  color: '#fff',
  fontSize: '13px',
};

export default function AnalyticsPage() {
  const { t } = useLanguageStore();
  const [timeView, setTimeView] = useState<TimeView>('monthly');
  const [loading] = useState(false);

  const currentEarnings = earningsByView[timeView];
  const xKey = timeView === 'yearly' ? 'year' : timeView === 'weekly' ? 'week' : 'month';

  const totalThisMonth = monthlyEarnings[monthlyEarnings.length - 1].earnings;
  const avgMonthly = Math.round(monthlyEarnings.reduce((a, b) => a + b.earnings, 0) / monthlyEarnings.length);
  const completionRate = 94;
  const repeatClients = 12;

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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">{t('analytics.title')}</h1>
          <p className="text-white/50 mt-1 text-sm lg:text-base">{t('analytics.subtitle')}</p>
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
            {t('analytics.exportReport')}
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('analytics.thisMonthEarnings')}
          value={formatCurrency(totalThisMonth)}
          icon={<TrendingUp className="w-5 h-5 lg:w-6 lg:h-6" />}
          color="green"
          change="+15% vs last month"
          changeType="up"
        />
        <StatCard
          title={t('analytics.averageMonthly')}
          value={formatCurrency(avgMonthly)}
          icon={<Calendar className="w-5 h-5 lg:w-6 lg:h-6" />}
          color="blue"
          change="Last 12 months"
          changeType="up"
        />
        <StatCard
          title={t('analytics.completionRate')}
          value={`${completionRate}%`}
          icon={<BarChart3 className="w-5 h-5 lg:w-6 lg:h-6" />}
          color="purple"
          change={`${completionRate >= 90 ? 'Excellent' : 'Good'}`}
          changeType="up"
        />
        <StatCard
          title={t('analytics.repeatClients')}
          value={repeatClients}
          icon={<Users className="w-5 h-5 lg:w-6 lg:h-6" />}
          color="orange"
          change="This month"
          changeType="up"
        />
      </div>

      {/* Earnings Trend */}
      <div className="glass-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">{t('analytics.earningsTrend')}</h2>
          </div>
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
            {(['monthly', 'weekly', 'yearly'] as TimeView[]).map((view) => (
              <button
                key={view}
                onClick={() => setTimeView(view)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all min-h-[36px] ${
                  timeView === view
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                }`}
              >
                {t(`analytics.${view}`)}
              </button>
            ))}
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={currentEarnings} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="earningsGradBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
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
      </div>

      {/* Bottom Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Jobs by Category */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">{t('analytics.jobsByCategory')}</h2>
            <div className="flex items-center gap-2 text-sm">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Jobs
              </span>
            </div>
          </div>
          <div className="h-64">
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
                <Tooltip
                  contentStyle={tooltipStyle}
                />
                <Bar dataKey="jobs" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rating Trend */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">{t('analytics.ratingTrend')}</h2>
            <div className="flex items-center gap-2 text-sm">
              <span className="flex items-center gap-1 text-blue-400">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                Rating
              </span>
            </div>
          </div>
          <div className="h-64">
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
                  domain={[3.5, 5]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#ffffff60', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                />
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
        </div>
      </div>
    </div>
  );
}
