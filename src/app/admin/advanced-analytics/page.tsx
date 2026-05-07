'use client';

import { useState } from 'react';
import {
  Users, UserCheck, DollarSign, TrendingUp, BarChart3, Star,
  Download, Calendar,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useLanguageStore } from '@/store/language-store';

type DateRange = 'week' | 'month' | 'quarter' | 'year' | 'all';

const userGrowthData = [
  { month: 'Jan', workers: 245, employers: 132 },
  { month: 'Feb', workers: 312, employers: 158 },
  { month: 'Mar', workers: 289, employers: 145 },
  { month: 'Apr', workers: 378, employers: 198 },
  { month: 'May', workers: 342, employers: 178 },
  { month: 'Jun', workers: 456, employers: 245 },
  { month: 'Jul', workers: 412, employers: 223 },
  { month: 'Aug', workers: 498, employers: 267 },
  { month: 'Sep', workers: 467, employers: 245 },
  { month: 'Oct', workers: 534, employers: 289 },
  { month: 'Nov', workers: 512, employers: 278 },
  { month: 'Dec', workers: 589, employers: 312 },
];

const revenueBreakdownData = [
  { month: 'Jan', commission: 85000, withdrawals: 120000, deposits: 245000 },
  { month: 'Feb', commission: 92000, withdrawals: 145000, deposits: 312000 },
  { month: 'Mar', commission: 68000, withdrawals: 98000, deposits: 198000 },
  { month: 'Apr', commission: 128000, withdrawals: 175000, deposits: 427000 },
  { month: 'May', commission: 115000, withdrawals: 160000, deposits: 385000 },
  { month: 'Jun', commission: 156000, withdrawals: 210000, deposits: 512000 },
  { month: 'Jul', commission: 142000, withdrawals: 195000, deposits: 478000 },
  { month: 'Aug', commission: 178000, withdrawals: 245000, deposits: 623000 },
  { month: 'Sep', commission: 165000, withdrawals: 228000, deposits: 556000 },
  { month: 'Oct', commission: 198000, withdrawals: 265000, deposits: 689000 },
  { month: 'Nov', commission: 215000, withdrawals: 290000, deposits: 742000 },
  { month: 'Dec', commission: 238000, withdrawals: 320000, deposits: 815000 },
];

const categoryDistributionData = [
  { name: 'Electrician', value: 285, fill: '#10b981' },
  { name: 'Plumber', value: 230, fill: '#3b82f6' },
  { name: 'Carpenter', value: 195, fill: '#f59e0b' },
  { name: 'Painter', value: 168, fill: '#8b5cf6' },
  { name: 'AC Technician', value: 145, fill: '#ef4444' },
  { name: 'Mason', value: 122, fill: '#06b6d4' },
  { name: 'Welder', value: 98, fill: '#ec4899' },
  { name: 'Laborer', value: 87, fill: '#f97316' },
];

const geoData = [
  { city: 'Karachi', jobs: 1245, percentage: 28.3, growth: '+12%' },
  { city: 'Lahore', jobs: 1098, percentage: 25.0, growth: '+18%' },
  { city: 'Islamabad', jobs: 782, percentage: 17.8, growth: '+15%' },
  { city: 'Rawalpindi', jobs: 456, percentage: 10.4, growth: '+9%' },
  { city: 'Faisalabad', jobs: 312, percentage: 7.1, growth: '+22%' },
  { city: 'Multan', jobs: 198, percentage: 4.5, growth: '+8%' },
  { city: 'Peshawar', jobs: 167, percentage: 3.8, growth: '+11%' },
  { city: 'Quetta', jobs: 140, percentage: 3.2, growth: '+5%' },
];

const tooltipStyle = {
  backgroundColor: 'rgba(15, 15, 25, 0.95)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  color: '#fff',
  fontSize: '13px',
};

export default function AdvancedAnalyticsPage() {
  const { t } = useLanguageStore();
  const [dateRange, setDateRange] = useState<DateRange>('year');

  const dateRanges: { key: DateRange; labelKey: string }[] = [
    { key: 'week', labelKey: 'adminAnalytics.thisWeek' },
    { key: 'month', labelKey: 'adminAnalytics.thisMonth' },
    { key: 'quarter', labelKey: 'adminAnalytics.thisQuarter' },
    { key: 'year', labelKey: 'adminAnalytics.thisYear' },
    { key: 'all', labelKey: 'adminAnalytics.allTime' },
  ];

  const statCards = [
    { title: t('adminAnalytics.totalUsers'), value: '3,456', icon: <Users className="w-5 h-5" />, color: 'emerald' },
    { title: t('adminAnalytics.activeWorkers'), value: '1,892', icon: <UserCheck className="w-5 h-5" />, color: 'blue', change: '+12.5%' },
    { title: t('adminAnalytics.revenueMonth'), value: 'PKR 2.4M', icon: <DollarSign className="w-5 h-5" />, color: 'orange', change: '+18.2%' },
    { title: t('adminAnalytics.growthRate'), value: '24.8%', icon: <TrendingUp className="w-5 h-5" />, color: 'purple', change: '+3.1%' },
    { title: t('adminAnalytics.avgJobValue'), value: 'PKR 18.5K', icon: <BarChart3 className="w-5 h-5" />, color: 'cyan', change: '+5.4%' },
    { title: t('adminAnalytics.platformRating'), value: '4.6★', icon: <Star className="w-5 h-5" />, color: 'yellow' },
  ];

  const colorClasses: Record<string, { iconBg: string; glow: string }> = {
    emerald: { iconBg: 'bg-emerald-500/20', glow: 'glow-green' },
    blue: { iconBg: 'bg-blue-500/20', glow: 'glow-blue' },
    orange: { iconBg: 'bg-orange-500/20', glow: 'glow-orange' },
    purple: { iconBg: 'bg-violet-500/20', glow: 'glow-purple' },
    cyan: { iconBg: 'bg-cyan-500/20', glow: '' },
    yellow: { iconBg: 'bg-yellow-500/20', glow: '' },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">{t('adminAnalytics.title')}</h1>
          <p className="text-white/50 mt-1">{t('adminAnalytics.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Date Range Selector */}
          <div className="flex items-center gap-1.5 bg-white/5 rounded-xl p-1 border border-white/10">
            {dateRanges.map(dr => (
              <button
                key={dr.key}
                onClick={() => setDateRange(dr.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  dateRange === dr.key
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : 'text-white/50 hover:text-white/70'
                }`}
              >
                {t(dr.labelKey)}
              </button>
            ))}
          </div>

          {/* Export Button */}
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500/15 border border-orange-500/20 text-orange-400 text-sm font-medium hover:bg-orange-500/25 transition-all">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">{t('adminAnalytics.exportReport')}</span>
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((card, i) => (
          <div key={i} className={`glass-card p-4 relative overflow-hidden ${colorClasses[card.color]?.glow || ''}`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] sm:text-xs font-medium text-white/40 uppercase tracking-wider">{card.title}</p>
              <div className={`p-1.5 rounded-lg ${colorClasses[card.color]?.iconBg || 'bg-white/10'}`}>
                <span className="text-orange-400">{card.icon}</span>
              </div>
            </div>
            <p className="text-lg sm:text-xl font-bold text-white">{card.value}</p>
            {card.change && (
              <p className="text-[10px] text-emerald-400 mt-1">{card.change}</p>
            )}
          </div>
        ))}
      </div>

      {/* Charts Row 1: User Growth + Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Area Chart */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">{t('adminAnalytics.userGrowth')}</h2>
              <p className="text-sm text-white/40 mt-0.5">{t('adminAnalytics.userGrowthDesc')}</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                {t('adminAnalytics.workers')}
              </span>
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                {t('adminAnalytics.employers')}
              </span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowthData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="workerGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="employerGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="workers" stroke="#10b981" strokeWidth={2} fill="url(#workerGrad)" name={t('adminAnalytics.workers')} />
                <Area type="monotone" dataKey="employers" stroke="#3b82f6" strokeWidth={2} fill="url(#employerGrad)" name={t('adminAnalytics.employers')} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Breakdown Stacked Bar */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">{t('adminAnalytics.revenueBreakdown')}</h2>
              <p className="text-sm text-white/40 mt-0.5">{t('adminAnalytics.revenueBreakdownDesc')}</p>
            </div>
            <Calendar className="w-5 h-5 text-white/20" />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueBreakdownData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} tickFormatter={(val: number) => `${(val / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`PKR ${Number(value).toLocaleString()}`, '']} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value: string) => (
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>{value}</span>
                  )}
                />
                <Bar dataKey="commission" stackId="a" fill="#f97316" radius={[0, 0, 0, 0]} name={t('adminAnalytics.commission')} />
                <Bar dataKey="withdrawals" stackId="a" fill="#3b82f6" name={t('adminAnalytics.withdrawals')} />
                <Bar dataKey="deposits" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} name={t('adminAnalytics.deposits')} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2: Category Pie + Geographic Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Categories Pie Chart */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">{t('adminAnalytics.categoryDistribution')}</h2>
              <p className="text-sm text-white/40 mt-0.5">{t('adminAnalytics.categoryDistributionDesc')}</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryDistributionData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => [`${value} jobs`, '']}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value: string) => (
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Geographic Heatmap Table */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">{t('adminAnalytics.geoDistribution')}</h2>
              <p className="text-sm text-white/40 mt-0.5">{t('adminAnalytics.geoDistributionDesc')}</p>
            </div>
          </div>
          <div className="space-y-2.5">
            {geoData.map((city, i) => (
              <div key={city.city} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-all">
                <span className="text-lg font-bold text-white/15 w-6 text-center shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-sm font-medium text-white">{city.city}</h3>
                    <span className="text-xs text-emerald-400 font-medium">{city.growth}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-700"
                        style={{ width: `${city.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-white/40 shrink-0 w-20 text-right">
                      {city.jobs.toLocaleString()} {t('adminAnalytics.jobs')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
