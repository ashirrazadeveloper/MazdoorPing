'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { supabase } from '@/lib/supabase';
import { WorkerCard } from '@/components/shared/WorkerCard';
import { VoiceSearch } from '@/components/shared/VoiceSearch';
import { Search, Filter, Users, ChevronDown, Loader2 } from 'lucide-react';
import type { Worker, Category } from '@/types';
import { useLanguageStore } from '@/store/language-store';

export default function FindWorkersPage() {
  const { employerProfile } = useAuthStore();
  const { t, language } = useLanguageStore();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [minRating, setMinRating] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const savingWorkerRef = useRef<string | null>(null);
  const pageSize = 12;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [catRes, cityRes] = await Promise.all([
        supabase.from('categories').select('*').eq('is_active', true).order('name'),
        supabase.from('workers').select('city').eq('status', 'active').order('city'),
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

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      const pg = 0;

      let query = supabase
        .from('workers')
        .select('*, skills:worker_skills(*, category:categories(*)), profile:profiles(*)')
        .eq('status', 'active')
        .order('rating', { ascending: false })
        .range(pg * pageSize, (pg + 1) * pageSize - 1);

      if (selectedCategory) {
        query = query.eq('skills.category_id', selectedCategory);
      }
      if (selectedCity) query = query.eq('city', selectedCity);
      if (minRating) query = query.gte('rating', parseFloat(minRating));
      if (searchQuery.trim()) {
        query = query.or(`profile.full_name.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (!cancelled) {
        if (error) {
          console.error('Error fetching workers:', error);
        } else {
          const fetchedWorkers = (data as Worker[]) || [];
          setWorkers(fetchedWorkers);
          setHasMore(fetchedWorkers.length === pageSize);
          setPage(0);
        }
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [selectedCategory, selectedCity, minRating, searchQuery]);

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    setLoadingMore(true);

    let query = supabase
      .from('workers')
      .select('*, skills:worker_skills(*, category:categories(*)), profile:profiles(*)')
      .eq('status', 'active')
      .order('rating', { ascending: false })
      .range(nextPage * pageSize, (nextPage + 1) * pageSize - 1);

    if (selectedCategory) query = query.eq('skills.category_id', selectedCategory);
    if (selectedCity) query = query.eq('city', selectedCity);
    if (minRating) query = query.gte('rating', parseFloat(minRating));
    if (searchQuery.trim()) {
      query = query.or(`profile.full_name.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error loading more workers:', error);
    } else {
      const fetchedWorkers = (data as Worker[]) || [];
      setWorkers((prev) => [...prev, ...fetchedWorkers]);
      setHasMore(fetchedWorkers.length === pageSize);
      setPage(nextPage);
    }
    setLoadingMore(false);
  };

  const handleSaveWorker = async (workerId: string) => {
    if (!employerProfile?.id) return;
    savingWorkerRef.current = workerId;

    try {
      const { error } = await supabase.from('saved_workers').insert({
        employer_id: employerProfile.id,
        worker_id: workerId,
      });

      if (error) {
        if (error.code === '23505') {
          console.log('Worker already saved');
        } else {
          console.error('Error saving worker:', error);
        }
      }
    } catch (err) {
      console.error('Failed to save worker:', err);
    } finally {
      savingWorkerRef.current = null;
    }
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
    setMinRating('');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedCategory || selectedCity || minRating || searchQuery.trim();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">{t("employer.findWorkers")}</h1>
        <p className="text-white/50 mt-1">{t('voiceSearch.browseWorkersSub') || 'Browse skilled workers ready to help with your projects'}</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('voiceSearch.searchWorkersPlaceholder') || 'Search by name or city...'}
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
              ? 'bg-blue-500/20 border-blue-500/30 text-blue-400'
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
              <button onClick={clearFilters} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                {t('common.clearAll') || 'Clear All'}
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
            <div>
              <label className="block text-xs text-white/40 mb-1.5 font-medium">{t('voiceSearch.minRating') || 'Min Rating'}</label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                className="glass-input w-full px-4 py-2.5 text-sm text-white appearance-none cursor-pointer"
              >
                <option value="" className="bg-gray-900">{t('voiceSearch.anyRating') || 'Any Rating'}</option>
                <option value="3" className="bg-gray-900">3+ Stars</option>
                <option value="3.5" className="bg-gray-900">3.5+ Stars</option>
                <option value="4" className="bg-gray-900">4+ Stars</option>
                <option value="4.5" className="bg-gray-900">4.5+ Stars</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {!loading && workers.length > 0 && (
        <p className="text-sm text-white/40">
          {t('voiceSearch.showingWorkers') || `Showing ${workers.length} worker${workers.length !== 1 ? 's' : ''}`}
          {hasActiveFilters && ` (${t('common.filtered') || 'filtered'})`}
        </p>
      )}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card p-5">
              <div className="flex items-start gap-4">
                <div className="skeleton w-14 h-14 rounded-xl shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="skeleton h-5 w-32" />
                  <div className="skeleton h-3 w-24" />
                  <div className="skeleton h-3 w-full" />
                  <div className="flex gap-2 mt-2">
                    <div className="skeleton h-6 w-16 rounded-full" />
                    <div className="skeleton h-6 w-20 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && workers.length === 0 && (
        <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
          <div className="p-4 rounded-2xl bg-white/5 mb-4">
            <Users className="w-12 h-12 text-white/20" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">{t('voiceSearch.noWorkers') || 'No workers found'}</h3>
          <p className="text-white/40 text-sm max-w-md">
            {hasActiveFilters
              ? (t('voiceSearch.tryAdjusting') || 'Try adjusting your filters or search query to find workers.')
              : (t('voiceSearch.noActiveWorkers') || 'There are no active workers at the moment. Check back later.')}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 text-sm font-medium rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/20 transition-all"
            >
              {t('common.clearAll') || 'Clear Filters'}
            </button>
          )}
        </div>
      )}

      {!loading && workers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workers.map((worker) => (
            <WorkerCard
              key={worker.id}
              worker={worker}
              showActions
              onSave={handleSaveWorker}
            />
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
            {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
            {loadingMore ? 'Loading...' : (t('common.loadMore') || 'Load More Workers')}
          </button>
        </div>
      )}
    </div>
  );
}
