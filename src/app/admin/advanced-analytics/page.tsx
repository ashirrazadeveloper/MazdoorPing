'use client';

import { useState, useEffect } from 'react';
import {
  Users, UserCheck, DollarSign, TrendingUp, BarChart3, Star,
  Download, Calendar, Loader2, Database, MapPin,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useLanguageStore } from '@/store/language-store';
import { supabase } from '@/lib/supabase';

type DateRange = 'week' | 'month' | 'quarter' | 'year' | 'all';

const tooltipStyle = {
  backgroundColor: 'rgba(15, 15, 25, 0.95)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  color: '#fff',
  fontSize: '13px',
};

export default function AdvancedAnalyticsPage() {
  const { t } = useLanguageStore();
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [loading, setLoading] = useState(true);

  // Real data from Supabase
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalWorkers, setTotalWorkers] = useState(0);
  const [totalEmployers, setTotalEmployers] = useState(0);
  const [activeWorkers, setActiveWorkers] = useState(0);
  const [totalJobs, setTotalJobs] = useState(0);
  const [completedJobs, setCompletedJobs] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [platformRating, setPlatformRating] = useState(0);

  // Chart data
  const [userGrowthData, setUserGrowthData] = useState<{ month: string; workers: number; employers: number }[]>([]);
  const [revenueData, setRevenueData] = useState<{ month: string; commission: number; deposits: number }[]>([]);
  const [categoryData, setCategoryData] = useState<{ name: string; value: number; fill: string }[]>([]);
  const [geoData, setGeoData] = useState<{ city: string; jobs: number; percentage: number; growth: string }[]>([]);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Fetch total users by role
      const { count: workerCount } = await supabase
        .from('workers')
        .select('*', { count: 'exact', head: true });
      const { count: employerCount } = await supabase
        .from('employers')
        .select('*', { count: 'exact', head: true });

      const workers = workerCount || 0;
      const employers = employerCount || 0;
      const total = workers + employers;

      setTotalWorkers(workers);
      setTotalEmployers(employers);
      setTotalUsers(total);

      // Active workers
      const { count: activeCount } = await supabase
        .from('workers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
      setActiveWorkers(activeCount || 0);

      // Jobs stats
      const { count: jobCount } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true });
      const { count: completedCount } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');
      setTotalJobs(jobCount || 0);
      setCompletedJobs(completedCount || 0);

      // Revenue (from transactions - commission type)
      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, type')
        .eq('status', 'completed');
      const commissionTotal = (transactions || [])
        .filter(tr => tr.type === 'debit')
        .reduce((sum, tr) => sum + (Number(tr.amount) || 0), 0);
      setTotalRevenue(commissionTotal);

      // Average rating
      const { data: ratingData } = await supabase
        .from('workers')
        .select('rating')
        .not('rating', 'is', null);
      const ratings = (ratingData || []).map(w => Number(w.rating) || 0);
      const avgRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length) : 0;
      setPlatformRating(avgRating);

      // Check if we have any data
      if (total > 0 || (jobCount || 0) > 0) {
        setHasData(true);
      }

      // User growth by month (from profiles created_at)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('created_at, role');
      
      if (profiles && profiles.length > 0) {
        const monthMap = new Map<string, { workers: number; employers: number }>();
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        profiles.forEach(p => {
          const d = new Date(p.created_at);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          const label = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
          if (!monthMap.has(key)) monthMap.set(key, { workers: 0, employers: 0 });
          const entry = monthMap.get(key)!;
          if (p.role === 'worker') entry.workers++;
          else if (p.role === 'employer') entry.employers++;
        });

        const sorted = Array.from(monthMap.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .slice(-12);
        
        setUserGrowthData(sorted.map(([key, val]) => {
          const [y, m] = key.split('-');
          const monthName = monthNames[parseInt(m) - 1];
          return { month: `${monthName} ${y.slice(-2)}`, ...val };
        }));
      }

      // Category distribution (from worker_skills)
      const { data: skills } = await supabase
        .from('worker_skills')
        .select('category_id');
      
      if (skills && skills.length > 0) {
        const catCountMap = new Map<string, number>();
        skills.forEach(s => {
          const catId = s.category_id || 'unknown';
          catCountMap.set(catId, (catCountMap.get(catId) || 0) + 1);
        });

        const colors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#f97316'];
        
        // Fetch category names
        const { data: categories } = await supabase
          .from('categories')
          .select('id, name');
        const catNameMap = new Map<string, string>();
        (categories || []).forEach(c => catNameMap.set(c.id, c.name));

        const catEntries = Array.from(catCountMap.entries())
          .sort(([,a], [,b]) => b - a)
          .slice(0, 8);

        setCategoryData(catEntries.map(([catId, count], i) => ({
          name: catNameMap.get(catId) || 'Other',
          value: count,
          fill: colors[i % colors.length],
        })));
      }

      // Geographic distribution (from workers)
      const { data: workerCities } = await supabase
        .from('workers')
        .select('city');
      
      if (workerCities && workerCities.length > 0) {
        const cityMap = new Map<string, number>();
        (workerCities || []).forEach(w => {
          if (w.city) cityMap.set(w.city, (cityMap.get(w.city) || 0) + 1);
        });

        const totalCityWorkers = Array.from(cityMap.values()).reduce((a, b) => a + b, 0);
        const sortedCities = Array.from(cityMap.entries())
          .sort(([,a], [,b]) => b - a)
          .slice(0, 8);

        setGeoData(sortedCities.map(([city, count]) => ({
          city,
          jobs: count,
          percentage: totalCityWorkers > 0 ? Math.round((count / totalCityWorkers) * 1000) / 10 : 0,
          growth: '+0%',
        })));
      }

      // Revenue data by month
      const { data: txData } = await supabase
        .from('transactions')
        .select('amount, type, created_at')
        .eq('status', 'completed');

      if (txData && txData.length > 0) {
        const revMap = new Map<string, { commission: number; deposits: number }>();
        const monthNames2 = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        txData.forEach(tx => {
          const d = new Date(tx.created_at);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          if (!revMap.has(key)) revMap.set(key, { commission: 0, deposits: 0 });
          const entry = revMap.get(key)!;
          if (tx.type === 'debit') entry.commission += Number(tx.amount) || 0;
          else entry.deposits += Number(tx.amount) || 0;
        });

        const sortedRev = Array.from(revMap.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .slice(-12);

        setRevenueData(sortedRev.map(([key, val]) => {
          const [y, m] = key.split('-');
          return { month: `${monthNames2[parseInt(m) - 1]} ${y.slice(-2)}`, ...val };
        }));
      }

    } catch (err) {
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const dateRanges: { key: DateRange; labelKey: string }[] = [
    { key: 'week', labelKey: 'adminAnalytics.thisWeek' },
    { key: 'month', labelKey: 'adminAnalytics.thisMonth' },
    { key: 'quarter', labelKey: 'adminAnalytics.thisQuarter' },
    { key: 'year', labelKey: 'adminAnalytics.thisYear' },
    { key: 'all', labelKey: 'adminAnalytics.allTime' },
  ];

  const formatPKR = (val: number) => {
    if (val >= 1000000) return `PKR ${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `PKR ${(val / 1000).toFixed(1)}K`;
    return `PKR ${val.toLocaleString()}`;
  };

  const statCards = [
    { title: t('adminAnalytics.totalUsers'), value: totalUsers.toLocaleString(), icon: <Users className="w-5 h-5" />, color: 'emerald' },
    { title: t('adminAnalytics.activeWorkers'), value: activeWorkers.toLocaleString(), icon: <UserCheck className="w-5 h-5" />, color: 'blue' },
    { title: t('adminAnalytics.revenueMonth'), value: formatPKR(totalRevenue), icon: <DollarSign className="w-5 h-5" />, color: 'orange' },
    { title: t('adminAnalytics.totalJobs') || 'Total Jobs', value: totalJobs.toLocaleString(), icon: <BarChart3 className="w-5 h-5" />, color: 'purple' },
    { title: t('adminAnalytics.completedJobs') || 'Completed Jobs', value: completedJobs.toLocaleString(), icon: <TrendingUp className="w-5 h-5" />, color: 'cyan' },
    { title: t('adminAnalytics.platformRating'), value: platformRating > 0 ? `${platformRating.toFixed(1)}★` : 'N/A', icon: <Star className="w-5 h-5" />, color: 'yellow' },
  ];

  const colorClasses: Record<string, { iconBg: string; glow: string }> = {
    emerald: { iconBg: 'bg-emerald-500/20', glow: 'glow-green' },
    blue: { iconBg: 'bg-blue-500/20', glow: 'glow-blue' },
    orange: { iconBg: 'bg-orange-500/20', glow: 'glow-orange' },
    purple: { iconBg: 'bg-violet-500/20', glow: 'glow-purple' },
    cyan: { iconBg: 'bg-cyan-500/20', glow: '' },
    yellow: { iconBg: 'bg-yellow-500/20', glow: '' },
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-6">
          <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
        </div>
        <p className="text-white/50 text-sm">Loading analytics data...</p>
      </div>
    );
  }

  // Empty state: no data at all
  if (!hasData) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">{t('adminAnalytics.title')}</h1>
            <p className="text-white/50 mt-1">{t('adminAnalytics.subtitle')}</p>
          </div>
        </div>
        <div className="glass-card p-12 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-500/10 border border-orange-500/20">
            <Database className="w-10 h-10 text-orange-400/60" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">{t('adminAnalytics.noData') || 'No Analytics Data Yet'}</h2>
          <p className="text-white/40 text-sm max-w-md mx-auto mb-6">
            {t('adminAnalytics.noDataDesc') || 'Analytics data will appear here once users start registering, posting jobs, and completing transactions on the platform.'}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <Users className="w-5 h-5 text-emerald-400/40 mx-auto mb-1" />
              <p className="text-xs text-white/30">{totalUsers} Users</p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <BarChart3 className="w-5 h-5 text-blue-400/40 mx-auto mb-1" />
              <p className="text-xs text-white/30">{totalJobs} Jobs</p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <DollarSign className="w-5 h-5 text-orange-400/40 mx-auto mb-1" />
              <p className="text-xs text-white/30">{formatPKR(totalRevenue)}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <Star className="w-5 h-5 text-yellow-400/40 mx-auto mb-1" />
              <p className="text-xs text-white/30">{platformRating > 0 ? `${platformRating.toFixed(1)}★` : 'N/A'}</p>
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
          <h1 className="text-2xl lg:text-3xl font-bold text-white">{t('adminAnalytics.title')}</h1>
          <p className="text-white/50 mt-1">{t('adminAnalytics.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
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
          <button
            onClick={fetchAnalyticsData}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500/15 border border-orange-500/20 text-orange-400 text-sm font-medium hover:bg-orange-500/25 transition-all"
          >
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
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        {userGrowthData.length > 0 ? (
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
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="workers" stroke="#10b981" strokeWidth={2} fill="url(#workerGrad)" name={t('adminAnalytics.workers')} />
                  <Area type="monotone" dataKey="employers" stroke="#3b82f6" strokeWidth={2} fill="url(#employerGrad)" name={t('adminAnalytics.employers')} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="glass-card p-6 flex items-center justify-center min-h-[350px]">
            <div className="text-center">
              <Users className="w-10 h-10 text-white/10 mx-auto mb-3" />
              <p className="text-white/30 text-sm">User growth data will appear as more users register</p>
            </div>
          </div>
        )}

        {/* Revenue Breakdown */}
        {revenueData.length > 0 ? (
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
                <BarChart data={revenueData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} tickFormatter={(val: number) => `${(val / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`PKR ${Number(value).toLocaleString()}`, '']} />
                  <Legend verticalAlign="bottom" height={36} formatter={(value: string) => <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>{value}</span>} />
                  <Bar dataKey="commission" fill="#f97316" radius={[4, 4, 0, 0]} name={t('adminAnalytics.commission')} />
                  <Bar dataKey="deposits" fill="#10b981" radius={[4, 4, 0, 0]} name={t('adminAnalytics.deposits')} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="glass-card p-6 flex items-center justify-center min-h-[350px]">
            <div className="text-center">
              <DollarSign className="w-10 h-10 text-white/10 mx-auto mb-3" />
              <p className="text-white/30 text-sm">Revenue data will appear as transactions occur on the platform</p>
            </div>
          </div>
        )}
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        {categoryData.length > 0 ? (
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
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} dataKey="value">
                    {categoryData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value} skills`, '']} />
                  <Legend verticalAlign="bottom" height={36} formatter={(value: string) => <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="glass-card p-6 flex items-center justify-center min-h-[350px]">
            <div className="text-center">
              <BarChart3 className="w-10 h-10 text-white/10 mx-auto mb-3" />
              <p className="text-white/30 text-sm">Category data will appear as workers add skills to their profiles</p>
            </div>
          </div>
        )}

        {/* Geographic Distribution */}
        {geoData.length > 0 ? (
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
                      <span className="text-xs text-orange-400 font-medium">{city.percentage}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-700"
                          style={{ width: `${Math.min(city.percentage, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-white/40 shrink-0 w-20 text-right">
                        {city.jobs} workers
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="glass-card p-6 flex items-center justify-center min-h-[350px]">
            <div className="text-center">
              <MapPin className="w-10 h-10 text-white/10 mx-auto mb-3" />
              <p className="text-white/30 text-sm">Geographic data will appear as workers set their city in profiles</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
