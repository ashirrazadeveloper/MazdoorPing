'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { cn, formatDate, formatCurrency, getStatusColor } from '@/lib/utils';
import {
  Search, Filter, Eye, Briefcase, ChevronLeft, ChevronRight,
  MapPin, X, Ban, Award, Clock,
} from 'lucide-react';
import type { Job, JobStatus, Category } from '@/types';

const STATUS_FILTERS: { label: string; value: JobStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

const ITEMS_PER_PAGE = 10;

type JobWithDetails = Job & {
  employer: { id: string; company_name: string; profile: { full_name: string } };
  category: Category;
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobWithDetails[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedJob, setSelectedJob] = useState<JobWithDetails | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Reset page when filters change
  const prevSearch = useRef(search);
  const prevStatusFilter = useRef(statusFilter);
  const prevCategoryFilter = useRef(categoryFilter);
  useEffect(() => {
    if (prevSearch.current !== search || prevStatusFilter.current !== statusFilter || prevCategoryFilter.current !== categoryFilter) {
      prevSearch.current = search;
      prevStatusFilter.current = statusFilter;
      prevCategoryFilter.current = categoryFilter;
      setPage(1);
    }
  }, [search, statusFilter, categoryFilter]);

  // Fetch categories (once)
  useEffect(() => {
    let cancelled = false;
    async function loadCategories() {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (!cancelled) setCategories(data || []);
    }
    loadCategories();
    return () => { cancelled = true; };
  }, []);

  // Fetch jobs
  useEffect(() => {
    let cancelled = false;
    async function fetchJobs() {
      setLoading(true);
      try {
        let query = supabase
          .from('jobs')
          .select('*, employer:employers(id, company_name, profile:profiles(full_name)), category:categories(*)', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }

        if (categoryFilter !== 'all') {
          query = query.eq('category_id', categoryFilter);
        }

        if (search.trim()) {
          query = query.or(`title.ilike.%${search}%,city.ilike.%${search}%`);
        }

        const { data, count } = await query;
        if (!cancelled) {
          setJobs((data as JobWithDetails[]) || []);
          setTotalCount(count || 0);
        }
      } catch (err) {
        console.error('Failed to fetch jobs:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchJobs();
    return () => { cancelled = true; };
  }, [search, statusFilter, categoryFilter, page, refreshKey]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handleCancelJob = async (job: JobWithDetails) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: 'cancelled' })
        .eq('id', job.id);

      if (error) throw error;

      showToast(`Job "${job.title}" cancelled`, 'success');
      setShowDetail(false);
      setSelectedJob(null);
      setRefreshKey(k => k + 1);
    } catch (err) {
      console.error('Failed to cancel job:', err);
      showToast('Failed to cancel job', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleFeatured = async (job: JobWithDetails) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ is_featured: !job.is_featured })
        .eq('id', job.id);

      if (error) throw error;

      showToast(
        `Job "${job.title}" ${job.is_featured ? 'removed from featured' : 'marked as featured'}`,
        'success'
      );
      setRefreshKey(k => k + 1);
    } catch (err) {
      console.error('Failed to toggle featured:', err);
      showToast('Failed to update job', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast */}
      {toast && (
        <div className={cn(
          'fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg animate-fade-in',
          toast.type === 'success' ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'
        )}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Job Management</h1>
        <p className="text-white/50 mt-1">{totalCount} jobs posted on the platform</p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search by title, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input w-full pl-10 pr-4 py-2.5 text-sm text-white"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-white/30 hidden sm:block" />
          <div className="flex gap-1 flex-wrap">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-lg transition-all',
                  statusFilter === f.value
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setCategoryFilter('all')}
          className={cn(
            'px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap',
            categoryFilter === 'all'
              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
              : 'text-white/40 hover:text-white/60 hover:bg-white/5'
          )}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id)}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap',
              categoryFilter === cat.id
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'text-white/40 hover:text-white/60 hover:bg-white/5'
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="glass-card overflow-hidden">
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="skeleton h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-48" />
                  <div className="skeleton h-3 w-32" />
                </div>
                <div className="skeleton h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Briefcase className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/40">No jobs found</p>
          <p className="text-white/20 text-sm mt-1">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <>
          {/* Jobs Table */}
          <div className="glass-card overflow-hidden !hover:transform-none">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-4 py-3">Job</th>
                    <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Employer</th>
                    <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Category</th>
                    <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Budget</th>
                    <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-4 py-3 hidden xl:table-cell">City</th>
                    <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-4 py-3">Status</th>
                    <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Bids</th>
                    <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-4 py-3 hidden xl:table-cell">Posted</th>
                    <th className="text-right text-xs font-medium text-white/40 uppercase tracking-wider px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                            <Briefcase className="w-5 h-5 text-orange-400" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-white truncate max-w-[180px]">
                                {job.title}
                              </p>
                              {job.is_featured && (
                                <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-white/30 mt-0.5 truncate max-w-[180px]">
                              {job.budget_type === 'hourly' ? 'Hourly' : 'Fixed'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-sm text-white/50 truncate max-w-[140px]">
                          {job.employer?.company_name || job.employer?.profile?.full_name || 'N/A'}
                        </p>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="px-2 py-0.5 text-xs bg-white/5 text-white/40 rounded-md">
                          {job.category?.name || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <p className="text-sm text-emerald-400 font-medium">
                          {formatCurrency(job.budget_min)}{job.budget_max > job.budget_min ? ` - ${formatCurrency(job.budget_max)}` : ''}
                        </p>
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell">
                        <div className="flex items-center gap-1.5 text-sm text-white/50">
                          <MapPin className="w-3.5 h-3.5 text-white/30" />
                          {job.city || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge text-xs ${getStatusColor(job.status)}`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-sm text-white/50">{job.bids_count || 0}</span>
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell">
                        <div className="flex items-center gap-1.5 text-sm text-white/40">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDate(job.created_at)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => { setSelectedJob(job); setShowDetail(true); }}
                            className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70 transition-all"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {job.status === 'open' && (
                            <button
                              onClick={() => handleCancelJob(job)}
                              disabled={actionLoading}
                              className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400/60 hover:text-red-400 transition-all"
                              title="Cancel Job"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleToggleFeatured(job)}
                            disabled={actionLoading}
                            className={cn(
                              'p-1.5 rounded-lg transition-all',
                              job.is_featured
                                ? 'hover:bg-white/5 text-amber-400/60 hover:text-amber-400'
                                : 'hover:bg-amber-500/10 text-white/30 hover:text-amber-400'
                            )}
                            title={job.is_featured ? 'Remove Featured' : 'Mark Featured'}
                          >
                            <Award className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/40">
                Showing {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, totalCount)} of {totalCount}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-white/60">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Job Detail Modal */}
      {showDetail && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDetail(false)} />
          <div className="relative glass-card p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => setShowDetail(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-orange-500/10 shrink-0">
                <Briefcase className="w-6 h-6 text-orange-400" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-semibold text-white">{selectedJob.title}</h2>
                  {selectedJob.is_featured && (
                    <Award className="w-4 h-4 text-amber-400" />
                  )}
                </div>
                <span className={`badge text-xs mt-1 ${getStatusColor(selectedJob.status)}`}>{selectedJob.status}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-white/30 uppercase tracking-wider">Employer</p>
                  <p className="text-sm text-white/60">
                    {selectedJob.employer?.company_name || selectedJob.employer?.profile?.full_name || 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-white/30 uppercase tracking-wider">Category</p>
                  <p className="text-sm text-white/60">{selectedJob.category?.name || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-white/30 uppercase tracking-wider">Budget</p>
                  <p className="text-sm text-emerald-400 font-medium">
                    {formatCurrency(selectedJob.budget_min)}{selectedJob.budget_max > selectedJob.budget_min ? ` - ${formatCurrency(selectedJob.budget_max)}` : ''}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-white/30 uppercase tracking-wider">Budget Type</p>
                  <p className="text-sm text-white/60 capitalize">{selectedJob.budget_type}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-white/30 uppercase tracking-wider">Location</p>
                  <div className="flex items-center gap-1.5 text-sm text-white/60">
                    <MapPin className="w-3.5 h-3.5" />
                    {selectedJob.city}, {selectedJob.province}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-white/30 uppercase tracking-wider">Urgency</p>
                  <span className={`badge text-xs ${getStatusColor(selectedJob.urgency)}`}>{selectedJob.urgency}</span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-white/30 uppercase tracking-wider">Workers Needed</p>
                  <p className="text-sm text-white/60">{selectedJob.workers_needed || 1}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-white/30 uppercase tracking-wider">Duration</p>
                  <p className="text-sm text-white/60">{selectedJob.duration_days || 'N/A'} days</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-white/30 uppercase tracking-wider">Start Date</p>
                  <p className="text-sm text-white/60">{formatDate(selectedJob.start_date)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-white/30 uppercase tracking-wider">Bids / Views</p>
                  <p className="text-sm text-white/60">{selectedJob.bids_count || 0} bids / {selectedJob.views_count || 0} views</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-white/30 uppercase tracking-wider">Description</p>
                <p className="text-sm text-white/60 leading-relaxed">{selectedJob.description || 'No description provided'}</p>
              </div>

              {selectedJob.requirements?.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-white/30 uppercase tracking-wider">Requirements</p>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedJob.requirements.map((req, idx) => (
                      <li key={idx} className="text-sm text-white/60">{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-1">
                <p className="text-xs text-white/30 uppercase tracking-wider">Full Address</p>
                <p className="text-sm text-white/60">{selectedJob.address || 'N/A'}</p>
              </div>

              {selectedJob.status === 'open' && (
                <button
                  onClick={() => handleCancelJob(selectedJob)}
                  disabled={actionLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20 font-medium text-sm transition-all disabled:opacity-50"
                >
                  {actionLoading ? 'Cancelling...' : 'Cancel This Job'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
