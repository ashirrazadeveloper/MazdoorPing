'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { JobCard } from '@/components/shared/JobCard';
import { VoiceSearch } from '@/components/shared/VoiceSearch';
import { Search, Filter, Briefcase, ChevronDown, Loader2 } from 'lucide-react';
import type { Job, Category } from '@/types';
import { useLanguageStore } from '@/store/language-store';

export default function BrowseJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const { t, language } = useLanguageStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const pageSize = 10;

  // Fetch categories and cities on mount
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [catRes, cityRes] = await Promise.all([
        supabase.from('categories').select('*').eq('is_active', true).order('name'),
        supabase.from('jobs').select('city').eq('status', 'open').order('city'),
      ]);

      if (!cancelled) {
        if (catRes.data) setCategories(catRes.data);
        if (cityRes.data) {
          const uniqueCities = [...new Set(cityRes.data.map((d: { city: string }) => d.city).filter(Boolean))];
          setCities(uniqueCities);
        }
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // Fetch jobs whenever filters change
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      const pg = 0;

      let query = supabase
        .from('jobs')
        .select('*, category:categories(*), employer:employers(profile:profiles(*))')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .range(pg * pageSize, (pg + 1) * pageSize - 1);

      if (selectedCategory) query = query.eq('category_id', selectedCategory);
      if (selectedCity) query = query.eq('city', selectedCity);
      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (!cancelled) {
        if (error) {
          console.error('Error fetching jobs:', error);
        } else {
          const fetchedJobs = (data as Job[]) || [];
          setJobs(fetchedJobs);
          setHasMore(fetchedJobs.length === pageSize);
          setPage(0);
        }
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [selectedCategory, selectedCity, searchQuery]);

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    setLoadingMore(true);

    let query = supabase
      .from('jobs')
      .select('*, category:categories(*), employer:employers(profile:profiles(*))')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .range(nextPage * pageSize, (nextPage + 1) * pageSize - 1);

    if (selectedCategory) query = query.eq('category_id', selectedCategory);
    if (selectedCity) query = query.eq('city', selectedCity);
    if (searchQuery.trim()) {
      query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error loading more jobs:', error);
    } else {
      const fetchedJobs = (data as Job[]) || [];
      setJobs((prev) => [...prev, ...fetchedJobs]);
      setHasMore(fetchedJobs.length === pageSize);
      setPage(nextPage);
    }
    setLoadingMore(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleVoiceResult = (text: string) => {
    setSearchQuery(text);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedCity('');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedCategory || selectedCity || searchQuery.trim();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">{t('dashboards.browseJobs')}</h1>
        <p className="text-white/50 mt-1">{t("worker.dashboardSubtitle")}</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('voiceSearch.searchPlaceholder') || 'Search jobs by title or description...'}
            className="glass-input w-full pl-12 pr-16 py-3 text-sm text-white placeholder:text-white/30"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <VoiceSearch
              onResult={handleVoiceResult}
              language={language === 'ur' ? 'ur' : 'en'}
              size="sm"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all text-sm font-medium ${
            showFilters || hasActiveFilters
              ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
              : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">{t("common.filters")}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </form>

      {showFilters && (
        <div className="glass-card p-4 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">{t("common.filters")}</h3>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                {t('common.clearAll')}
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-white/40 mb-1.5 font-medium">{t("cards.category")}</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="glass-input w-full px-4 py-2.5 text-sm text-white appearance-none cursor-pointer"
              >
                <option value="" className="bg-gray-900">{t("common.all")}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-gray-900">{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5 font-medium">{t("worker.city")}</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="glass-input w-full px-4 py-2.5 text-sm text-white appearance-none cursor-pointer"
              >
                <option value="" className="bg-gray-900">{t("common.all")}</option>
                {cities.map((city) => (
                  <option key={city} value={city} className="bg-gray-900">{city}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {!loading && jobs.length > 0 && (
        <p className="text-sm text-white/40">
          {t('voiceSearch.showingResults') || `Showing ${jobs.length} open job${jobs.length !== 1 ? 's' : ''}`}
          {hasActiveFilters && ` (${t('common.filtered')})`}
        </p>
      )}

      {loading && (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass-card p-5">
              <div className="flex items-start gap-4">
                <div className="flex-1 space-y-3">
                  <div className="skeleton h-5 w-3/4" />
                  <div className="skeleton h-4 w-1/3" />
                  <div className="skeleton h-4 w-full" />
                  <div className="skeleton h-4 w-2/3" />
                  <div className="flex gap-4 mt-3">
                    <div className="skeleton h-4 w-20" />
                    <div className="skeleton h-4 w-24" />
                    <div className="skeleton h-4 w-16" />
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
            <Briefcase className="w-12 h-12 text-white/20" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">{t("common.noData")}</h3>
          <p className="text-white/40 text-sm max-w-md">
            {hasActiveFilters
              ? t('voiceSearch.tryAdjusting') || 'Try adjusting your filters or search query to find available jobs.'
              : t('voiceSearch.noOpenJobs') || 'There are no open jobs at the moment. Check back later for new opportunities.'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 text-sm font-medium rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20 transition-all"
            >
              {t('common.clearAll') || 'Clear Filters'}
            </button>
          )}
        </div>
      )}

      {!loading && jobs.length > 0 && (
        <div className="space-y-4">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} showActions />
          ))}
        </div>
      )}

      {hasMore && !loading && (
        <div className="flex justify-center pt-4">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all text-sm font-medium disabled:opacity-50"
          >
            {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loadingMore ? 'Loading...' : t('common.loadMore') || 'Load More Jobs'}
          </button>
        </div>
      )}
    </div>
  );
}
