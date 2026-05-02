'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { cn, formatDate, formatCurrency, getStatusColor, getInitials, timeAgo } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import {
  Search, Filter, CheckCircle, XCircle, Eye, Users,
  ChevronLeft, ChevronRight, Star, MapPin, Phone, Mail, X,
  Shield, ShieldCheck, ShieldAlert, Ban, MoreHorizontal,
  UserCog, Clock, CheckSquare, Square, ArrowUpDown,
  Loader2, Save, MessageSquare, Briefcase, Image,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import type { Worker, WorkerStatus, WorkerSkill, Review, Job } from '@/types';
import { useLanguageStore } from '@/store/language-store';

const MapView = dynamic(() => import('./MapLeaflet'), { ssr: false });

const STATUS_FILTERS: { label: string; value: WorkerStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Active', value: 'active' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Suspended', value: 'suspended' },
];

const SORT_OPTIONS = [
  { label: 'Newest', value: 'created_at-desc' },
  { label: 'Oldest', value: 'created_at-asc' },
  { label: 'Highest Rating', value: 'rating-desc' },
  { label: 'Lowest Rating', value: 'rating-asc' },
  { label: 'Most Jobs', value: 'completed_jobs-desc' },
  { label: 'Least Jobs', value: 'completed_jobs-asc' },
];

const ITEMS_PER_PAGE = 10;

type WorkerWithProfile = Worker & {
  profile: { id: string; email: string; full_name: string; phone: string; avatar_url: string | null };
  skills: (WorkerSkill & { category: { id: string; name: string; icon?: string } })[];
};

// ─── Rating Stars Component ────────────────────────────────────────
function RatingStars({ rating, count }: { rating: number; count?: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            'w-3.5 h-3.5',
            i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-white/15'
          )}
        />
      ))}
      <span className="text-xs text-white/40 ml-1">
        {rating?.toFixed(1) || '0.0'}{count !== undefined ? ` (${count})` : ''}
      </span>
    </div>
  );
}

// ─── Status Badge ──────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const icons: Record<string, React.ReactNode> = {
    pending: <Clock className="w-3 h-3" />,
    active: <CheckCircle className="w-3 h-3" />,
    rejected: <XCircle className="w-3 h-3" />,
    suspended: <ShieldAlert className="w-3 h-3" />,
  };
  return (
    <span className={cn('badge text-xs', getStatusColor(status))}>
      {icons[status]}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ─── Main Component ────────────────────────────────────────────────
export default function ManageWorkersPage() {
  const { user } = useAuthStore();
  const { t } = useLanguageStore();
  const [workers, setWorkers] = useState<WorkerWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<WorkerStatus | 'all'>('all');
  const [cityFilter, setCityFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at-desc');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedWorker, setSelectedWorker] = useState<WorkerWithProfile | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Stats
  const [stats, setStats] = useState({ total: 0, pending: 0, active: 0, suspended: 0 });

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState('');

  // Detail modal data
  const [workerReviews, setWorkerReviews] = useState<Review[]>([]);
  const [workerJobs, setWorkerJobs] = useState<Job[]>([]);
  const [adminNotes, setAdminNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [cnicViewer, setCnicViewer] = useState<'front' | 'back' | null>(null);

  // Available cities & skills for filters
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);

  // Show sort dropdown
  const [showSort, setShowSort] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Reset page on filter changes
  const prevFilters = useRef({ search, statusFilter, cityFilter, skillFilter, sortBy });
  useEffect(() => {
    const prev = prevFilters.current;
    if (
      prev.search !== search ||
      prev.statusFilter !== statusFilter ||
      prev.cityFilter !== cityFilter ||
      prev.skillFilter !== skillFilter ||
      prev.sortBy !== sortBy
    ) {
      prevFilters.current = { search, statusFilter, cityFilter, skillFilter, sortBy };
      setPage(1);
      setSelectedIds(new Set());
    }
  }, [search, statusFilter, cityFilter, skillFilter, sortBy]);

  // Close sort dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setShowSort(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Fetch workers
  useEffect(() => {
    let cancelled = false;
    async function fetchWorkers() {
      setLoading(true);
      try {
        let query = supabase
          .from('workers')
          .select(
            '*, profile:profiles!workers_profile_id_fkey(id, email, full_name, phone, avatar_url), skills:worker_skills(*, category:categories(id, name, icon))',
            { count: 'exact' }
          )
          .order('created_at', { ascending: false })
          .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

        if (statusFilter !== 'all') query = query.eq('status', statusFilter);
        if (cityFilter) query = query.eq('city', cityFilter);
        if (search.trim()) {
          query = query.or(
            `city.ilike.%${search}%,address.ilike.%${search}%,cnic_number.ilike.%${search}%`
          );
        }
        // Apply sort
        const [sortField, sortDir] = sortBy.split('-') as [string, 'asc' | 'desc'];
        if (sortField === 'created_at' || sortField === 'rating' || sortField === 'completed_jobs') {
          query = query.order(sortField, { ascending: sortDir === 'asc' });
        }

        const { data, count } = await query;
        if (!cancelled) {
          let results = (data as WorkerWithProfile[]) || [];
          // Client-side skill filter (since skills are in a joined table)
          if (skillFilter) {
            results = results.filter((w) =>
              w.skills?.some((s) =>
                s.category?.name.toLowerCase().includes(skillFilter.toLowerCase())
              )
            );
          }
          setWorkers(results);
          setTotalCount(count || 0);
        }
      } catch (err) {
        console.error('Failed to fetch workers:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchWorkers();
    return () => {
      cancelled = true;
    };
  }, [search, statusFilter, cityFilter, skillFilter, sortBy, page, refreshKey]);

  // Fetch stats & filter options
  useEffect(() => {
    async function fetchStats() {
      try {
        const { data: allWorkers } = await supabase.from('workers').select('status, city');
        if (allWorkers) {
          setStats({
            total: allWorkers.length,
            pending: allWorkers.filter((w) => w.status === 'pending').length,
            active: allWorkers.filter((w) => w.status === 'active').length,
            suspended: allWorkers.filter((w) => w.status === 'suspended').length,
          });
          const cities = [...new Set(allWorkers.map((w) => w.city).filter(Boolean))] as string[];
          setAvailableCities(cities.sort());
        }
        const { data: skills } = await supabase
          .from('categories')
          .select('name')
          .order('name');
        if (skills) {
          setAvailableSkills(skills.map((s) => s.name));
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    }
    fetchStats();
  }, [refreshKey]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // ─── Actions ──────────────────────────────────────────────────────
  const handleStatusChange = async (
    workerId: string,
    newStatus: WorkerStatus,
    reason?: string
  ) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('workers')
        .update({ status: newStatus })
        .eq('id', workerId);
      if (error) throw error;

      await supabase.from('verification_logs').insert({
        worker_id: workerId,
        admin_id: user?.id,
        action: newStatus === 'active' ? 'approve' : newStatus === 'suspended' ? 'suspend' : 'reject',
        reason: reason || `Status changed to ${newStatus}`,
      });

      showToast(`Worker ${newStatus} successfully`, 'success');
      setShowDetail(false);
      setSelectedWorker(null);
      setRefreshKey((k) => k + 1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      console.error(`Failed to ${newStatus} worker:`, msg);
      showToast(`Failed to ${newStatus}: ${msg.slice(0, 60)}`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async (worker: WorkerWithProfile) => {
    await handleStatusChange(worker.id, 'active', 'Approved by admin');
  };

  const handleReject = async () => {
    if (!selectedWorker || !rejectReason.trim()) return;
    await handleStatusChange(selectedWorker.id, 'rejected', rejectReason.trim());
    setShowReject(false);
    setRejectReason('');
  };

  const handleSuspend = async (worker: WorkerWithProfile) => {
    await handleStatusChange(worker.id, 'suspended', 'Suspended by admin');
  };

  const openRejectModal = (worker: WorkerWithProfile) => {
    setSelectedWorker(worker);
    setRejectReason('');
    setShowReject(true);
  };

  // ─── Bulk Actions ────────────────────────────────────────────────
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === workers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(workers.map((w) => w.id)));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedIds.size === 0) return;
    setActionLoading(true);
    try {
      const newStatus = bulkAction as WorkerStatus;
      const { error } = await supabase
        .from('workers')
        .update({ status: newStatus })
        .in('id', Array.from(selectedIds));
      if (error) throw error;

      for (const wid of selectedIds) {
        await supabase.from('verification_logs').insert({
          worker_id: wid,
          admin_id: user?.id,
          action: newStatus === 'active' ? 'approve' : newStatus === 'suspended' ? 'suspend' : 'reject',
          reason: `Bulk ${newStatus} by admin`,
        }).then(() => {}); // fire & forget
      }

      showToast(`${selectedIds.size} workers ${bulkAction === 'active' ? 'approved' : bulkAction === 'suspended' ? 'suspended' : 'rejected'}`, 'success');
      setSelectedIds(new Set());
      setBulkAction('');
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error('Bulk action failed:', err);
      showToast('Bulk action failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Detail Modal ────────────────────────────────────────────────
  const openDetail = useCallback(async (worker: WorkerWithProfile) => {
    setSelectedWorker(worker);
    setShowDetail(true);
    setLoadingDetail(true);
    try {
      const [reviewsRes, jobsRes] = await Promise.all([
        supabase
          .from('reviews')
          .select('*, from_profile:profiles!reviews_from_user_id_fkey(id, full_name, avatar_url)')
          .eq('to_user_id', worker.user_id)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('jobs')
          .select('*, category:categories(id, name)')
          .eq('employer_id', (worker as unknown as Record<string, unknown>).employer_id as string || worker.user_id)
          .order('created_at', { ascending: false })
          .limit(10),
      ]);
      if (reviewsRes.data) setWorkerReviews(reviewsRes.data as unknown as Review[]);
      if (jobsRes.data) setWorkerJobs(jobsRes.data as unknown as Job[]);
    } catch (err) {
      console.error('Failed to fetch detail data:', err);
    } finally {
      setLoadingDetail(false);
    }
    // Fetch admin notes
    try {
      const { data: notesData } = await supabase
        .from('admin_notes')
        .select('content')
        .eq('target_id', worker.id)
        .eq('target_type', 'worker')
        .single();
      setAdminNotes(notesData?.content || '');
    } catch {
      setAdminNotes('');
    }
  }, []);

  const saveNotes = async () => {
    if (!selectedWorker) return;
    setSavingNotes(true);
    try {
      await supabase
        .from('admin_notes')
        .upsert({
          target_id: selectedWorker.id,
          target_type: 'worker',
          content: adminNotes,
          admin_id: user?.id,
        }, { onConflict: 'target_id,target_type' });
      showToast('Notes saved', 'success');
    } catch (err) {
      console.error('Failed to save notes:', err);
      showToast('Failed to save notes', 'error');
    } finally {
      setSavingNotes(false);
    }
  };

  const getCnicUrl = (path: string | null | undefined) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const { data } = supabase.storage.from('worker-documents').getPublicUrl(path);
    return data?.publicUrl || '';
  };

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast */}
      {toast && (
        <div
          className={cn(
            'fixed top-4 right-4 z-[100] px-4 py-3 rounded-xl text-sm font-medium shadow-lg animate-fade-in',
            toast.type === 'success' ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'
          )}
        >
          {toast.message}
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Manage Workers</h1>
          <p className="text-white/50 mt-1">Full worker management with verification &amp; monitoring</p>
        </div>
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 animate-fade-in">
            <span className="text-sm text-orange-400 font-medium">{selectedIds.size} selected</span>
            <button
              onClick={toggleSelectAll}
              className="text-xs text-white/40 hover:text-white/60 transition-colors"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/15">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/15">
              <Users className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-white/40">Total Workers</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/15">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-yellow-500/15">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.pending}</p>
              <p className="text-xs text-white/40">Pending Verification</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/15">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/15">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.active}</p>
              <p className="text-xs text-white/40">Active Workers</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4 bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/15">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/15">
              <ShieldAlert className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.suspended}</p>
              <p className="text-xs text-white/40">Suspended</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="glass-card p-4 !hover:transform-none">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search by name, email, phone, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass-input w-full pl-10 pr-4 py-2.5 text-sm text-white"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
            <Filter className="w-4 h-4 text-white/30 shrink-0" />
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap',
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

        {/* Second row: City, Skill, Sort */}
        <div className="flex flex-col sm:flex-row gap-3 mt-3">
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="glass-input px-3 py-2 text-sm text-white min-w-[140px]"
          >
            <option value="" className="bg-[#0c0c1d]">All Cities</option>
            {availableCities.map((c) => (
              <option key={c} value={c} className="bg-[#0c0c1d]">{c}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Filter by skill..."
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="glass-input px-3 py-2 text-sm text-white flex-1 min-w-[140px]"
            list="skills-list"
          />
          <datalist id="skills-list">
            {availableSkills.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>

          {/* Sort Dropdown */}
          <div ref={sortRef} className="relative">
            <button
              onClick={() => setShowSort(!showSort)}
              className="glass-input px-3 py-2 text-sm text-white/60 flex items-center gap-2 min-w-[150px] hover:text-white/80 transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              {SORT_OPTIONS.find((o) => o.value === sortBy)?.label || 'Sort by'}
            </button>
            {showSort && (
              <div className="absolute right-0 top-full mt-1 w-48 py-1 rounded-xl glass-card z-50 !transform-none custom-scrollbar max-h-64 overflow-y-auto">
                {SORT_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => { setSortBy(o.value); setShowSort(false); }}
                    className={cn(
                      'w-full text-left px-3 py-2 text-sm transition-colors',
                      sortBy === o.value ? 'text-orange-400 bg-orange-500/10' : 'text-white/60 hover:text-white hover:bg-white/5'
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="glass-card p-3 flex items-center justify-between animate-fade-in !hover:transform-none border-orange-500/20">
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/60">
              <span className="text-orange-400 font-semibold">{selectedIds.size}</span> workers selected
            </span>
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="glass-input px-3 py-1.5 text-sm text-white"
            >
              <option value="" className="bg-[#0c0c1d]">Choose Action...</option>
              <option value="active" className="bg-[#0c0c1d]">Bulk Approve</option>
              <option value="rejected" className="bg-[#0c0c1d]">Bulk Reject</option>
              <option value="suspended" className="bg-[#0c0c1d]">Bulk Suspend</option>
            </select>
          </div>
          <button
            onClick={handleBulkAction}
            disabled={!bulkAction || actionLoading}
            className="glass-button px-4 py-1.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
          >
            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
          </button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="glass-card overflow-hidden !hover:transform-none">
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="skeleton h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-40" />
                  <div className="skeleton h-3 w-56" />
                </div>
                <div className="skeleton h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      ) : workers.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Users className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/40">No workers found</p>
          <p className="text-white/20 text-sm mt-1">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <>
          {/* Workers Table */}
          <div className="glass-card overflow-hidden !hover:transform-none">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-3 py-3 w-10">
                      <button onClick={toggleSelectAll} className="text-white/30 hover:text-white/60 transition-colors">
                        {selectedIds.size === workers.length && workers.length > 0 ? (
                          <CheckSquare className="w-4 h-4 text-orange-400" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-3 py-3">Worker</th>
                    <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-3 py-3 hidden md:table-cell">Contact</th>
                    <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-3 py-3 hidden lg:table-cell">City</th>
                    <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-3 py-3 hidden xl:table-cell">Skills</th>
                    <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-3 py-3">Status</th>
                    <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-3 py-3 hidden sm:table-cell">Rating</th>
                    <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-3 py-3 hidden lg:table-cell">Jobs</th>
                    <th className="text-right text-xs font-medium text-white/40 uppercase tracking-wider px-3 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {workers.map((worker) => (
                    <tr
                      key={worker.id}
                      className={cn(
                        'hover:bg-white/[0.02] transition-colors',
                        selectedIds.has(worker.id) && 'bg-orange-500/5'
                      )}
                    >
                      <td className="px-3 py-3">
                        <button
                          onClick={() => toggleSelect(worker.id)}
                          className="text-white/20 hover:text-white/50 transition-colors"
                        >
                          {selectedIds.has(worker.id) ? (
                            <CheckSquare className="w-4 h-4 text-orange-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center shrink-0 text-sm font-bold text-orange-400 overflow-hidden">
                            {worker.profile?.avatar_url ? (
                              <img
                                src={worker.profile.avatar_url}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              getInitials(worker.profile?.full_name || 'W')
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-white truncate max-w-[150px]">
                                {worker.profile?.full_name || 'Unknown'}
                              </p>
                              {worker.cnic_number && (
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-white/30 truncate max-w-[150px]">
                              {worker.profile?.email || ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 hidden md:table-cell">
                        <p className="text-sm text-white/50">{worker.profile?.phone || 'N/A'}</p>
                      </td>
                      <td className="px-3 py-3 hidden lg:table-cell">
                        <div className="flex items-center gap-1.5 text-sm text-white/50">
                          <MapPin className="w-3.5 h-3.5 text-white/30" />
                          {worker.city || 'N/A'}
                        </div>
                      </td>
                      <td className="px-3 py-3 hidden xl:table-cell">
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {worker.skills?.slice(0, 2).map((skill) => (
                            <span
                              key={skill.id}
                              className="px-2 py-0.5 text-xs bg-white/5 text-white/40 rounded-md"
                            >
                              {skill.category?.name || 'Skill'}
                            </span>
                          ))}
                          {worker.skills && worker.skills.length > 2 && (
                            <span className="text-xs text-white/30">+{worker.skills.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge status={worker.status} />
                      </td>
                      <td className="px-3 py-3 hidden sm:table-cell">
                        <RatingStars rating={worker.rating || 0} />
                      </td>
                      <td className="px-3 py-3 hidden lg:table-cell">
                        <span className="text-sm text-white/50">{worker.completed_jobs || 0}</span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openDetail(worker)}
                            className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70 transition-all"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {worker.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(worker)}
                                disabled={actionLoading}
                                className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-400/60 hover:text-emerald-400 transition-all"
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openRejectModal(worker)}
                                disabled={actionLoading}
                                className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400/60 hover:text-red-400 transition-all"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {worker.status === 'active' && (
                            <button
                              onClick={() => handleSuspend(worker)}
                              disabled={actionLoading}
                              className="p-1.5 rounded-lg hover:bg-yellow-500/10 text-yellow-400/60 hover:text-yellow-400 transition-all"
                              title="Suspend"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}
                          {worker.status === 'suspended' && (
                            <button
                              onClick={() => handleApprove(worker)}
                              disabled={actionLoading}
                              className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-400/60 hover:text-emerald-400 transition-all"
                              title="Reactivate"
                            >
                              <ShieldCheck className="w-4 h-4" />
                            </button>
                          )}
                          <div className="relative group">
                            <button className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-all">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>
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
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-sm text-white/40">
                Showing {(page - 1) * ITEMS_PER_PAGE + 1}&ndash;
                {Math.min(page * ITEMS_PER_PAGE, totalCount)} of {totalCount}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="px-2.5 py-1.5 rounded-lg text-xs text-white/40 hover:text-white/70 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  First
                </button>
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={cn(
                        'w-8 h-8 rounded-lg text-xs font-medium transition-all',
                        page === pageNum
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                          : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  className="px-2.5 py-1.5 rounded-lg text-xs text-white/40 hover:text-white/70 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Last
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ─── Worker Detail Modal ────────────────────────────────────── */}
      {showDetail && selectedWorker && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setShowDetail(false); setSelectedWorker(null); }} />
          <div className="relative glass-card p-0 w-full max-w-2xl my-8 overflow-hidden animate-fade-in">
            {/* Modal Header */}
            <div className="p-6 pb-0">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-orange-500/20 flex items-center justify-center text-xl font-bold text-orange-400 overflow-hidden shrink-0">
                    {selectedWorker.profile?.avatar_url ? (
                      <img src={selectedWorker.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      getInitials(selectedWorker.profile?.full_name || 'W')
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {selectedWorker.profile?.full_name || 'Unknown'}
                    </h2>
                    <div className="flex items-center gap-3 mt-1">
                      <StatusBadge status={selectedWorker.status} />
                      <RatingStars rating={selectedWorker.rating || 0} count={selectedWorker.total_reviews || 0} />
                    </div>
                    <p className="text-xs text-white/30 mt-1">Joined {formatDate(selectedWorker.created_at)}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowDetail(false); setSelectedWorker(null); }}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {loadingDetail ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="skeleton h-16 w-full rounded-xl" />
                  ))}
                </div>
              ) : (
                <>
                  {/* Contact Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                      <p className="text-xs text-white/30 uppercase tracking-wider">Email</p>
                      <div className="flex items-center gap-2 text-sm text-white/70">
                        <Mail className="w-3.5 h-3.5 text-white/30" />
                        {selectedWorker.profile?.email || 'N/A'}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                      <p className="text-xs text-white/30 uppercase tracking-wider">Phone</p>
                      <div className="flex items-center gap-2 text-sm text-white/70">
                        <Phone className="w-3.5 h-3.5 text-white/30" />
                        {selectedWorker.profile?.phone || 'N/A'}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                      <p className="text-xs text-white/30 uppercase tracking-wider">City / Province</p>
                      <div className="flex items-center gap-2 text-sm text-white/70">
                        <MapPin className="w-3.5 h-3.5 text-white/30" />
                        {selectedWorker.city || 'N/A'}
                        {selectedWorker.province ? `, ${selectedWorker.province}` : ''}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                      <p className="text-xs text-white/30 uppercase tracking-wider">CNIC</p>
                      <div className="flex items-center gap-2 text-sm text-white/70">
                        <Shield className="w-3.5 h-3.5 text-emerald-400" />
                        {selectedWorker.cnic_number || 'N/A'}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                      <p className="text-xs text-white/30 uppercase tracking-wider">Gender / DOB</p>
                      <p className="text-sm text-white/70">
                        {selectedWorker.gender ? selectedWorker.gender.charAt(0).toUpperCase() + selectedWorker.gender.slice(1) : 'N/A'}
                        {selectedWorker.date_of_birth ? ` · ${formatDate(selectedWorker.date_of_birth)}` : ''}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                      <p className="text-xs text-white/30 uppercase tracking-wider">Hourly Rate</p>
                      <p className="text-sm text-white/70 font-medium">{formatCurrency(selectedWorker.hourly_rate || 0)}</p>
                    </div>
                  </div>

                  {/* Address */}
                  {selectedWorker.address && (
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                      <p className="text-xs text-white/30 uppercase tracking-wider">Full Address</p>
                      <p className="text-sm text-white/70">{selectedWorker.address}</p>
                    </div>
                  )}

                  {/* CNIC Images */}
                  {(selectedWorker.cnic_front_url || selectedWorker.cnic_back_url) && (
                    <div className="space-y-2">
                      <p className="text-xs text-white/30 uppercase tracking-wider flex items-center gap-2">
                        <Image className="w-3.5 h-3.5" /> CNIC Documents
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedWorker.cnic_front_url && (
                          <button
                            onClick={() => setCnicViewer('front')}
                            className="relative group rounded-xl overflow-hidden border border-white/10 hover:border-orange-500/30 transition-all aspect-[1.6/1]"
                          >
                            <img
                              src={getCnicUrl(selectedWorker.cnic_front_url)}
                              alt="CNIC Front"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-xs text-white font-medium">View Front</span>
                            </div>
                            <span className="absolute bottom-1 left-1 text-[10px] px-1.5 py-0.5 rounded bg-black/60 text-white/70">Front</span>
                          </button>
                        )}
                        {selectedWorker.cnic_back_url && (
                          <button
                            onClick={() => setCnicViewer('back')}
                            className="relative group rounded-xl overflow-hidden border border-white/10 hover:border-orange-500/30 transition-all aspect-[1.6/1]"
                          >
                            <img
                              src={getCnicUrl(selectedWorker.cnic_back_url)}
                              alt="CNIC Back"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-xs text-white font-medium">View Back</span>
                            </div>
                            <span className="absolute bottom-1 left-1 text-[10px] px-1.5 py-0.5 rounded bg-black/60 text-white/70">Back</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  <div className="space-y-2">
                    <p className="text-xs text-white/30 uppercase tracking-wider">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedWorker.skills?.length ? (
                        selectedWorker.skills.map((skill) => (
                          <span
                            key={skill.id}
                            className="px-3 py-1.5 text-xs bg-orange-500/10 text-orange-400 rounded-lg border border-orange-500/20"
                          >
                            {skill.category?.name || 'Skill'}
                            {skill.experience_years ? ` · ${skill.experience_years}yr exp` : ''}
                            {skill.is_primary && (
                              <span className="ml-1.5 px-1 py-0.5 bg-orange-500/20 rounded text-[10px]">Primary</span>
                            )}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-white/30">No skills listed</span>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  {selectedWorker.bio && (
                    <div className="space-y-2">
                      <p className="text-xs text-white/30 uppercase tracking-wider">Bio</p>
                      <p className="text-sm text-white/60 leading-relaxed">{selectedWorker.bio}</p>
                    </div>
                  )}

                  {/* Map */}
                  {selectedWorker.latitude && selectedWorker.longitude && (
                    <div className="space-y-2">
                      <p className="text-xs text-white/30 uppercase tracking-wider">Location</p>
                      <div className="rounded-xl overflow-hidden border border-white/10 h-48">
                        <MapView latitude={selectedWorker.latitude} longitude={selectedWorker.longitude} name={selectedWorker.profile?.full_name || ''} />
                      </div>
                    </div>
                  )}

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="glass-card p-3 text-center !hover:transform-none">
                      <p className="text-lg font-bold text-white">{selectedWorker.completed_jobs || 0}</p>
                      <p className="text-xs text-white/30">Jobs Done</p>
                    </div>
                    <div className="glass-card p-3 text-center !hover:transform-none">
                      <p className="text-lg font-bold text-white">{selectedWorker.total_reviews || 0}</p>
                      <p className="text-xs text-white/30">Reviews</p>
                    </div>
                    <div className="glass-card p-3 text-center !hover:transform-none">
                      <p className="text-lg font-bold text-emerald-400">{selectedWorker.availability ? 'Available' : 'Unavailable'}</p>
                      <p className="text-xs text-white/30">Status</p>
                    </div>
                  </div>

                  {/* Reviews */}
                  {workerReviews.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-white/30 uppercase tracking-wider flex items-center gap-2">
                        <Star className="w-3.5 h-3.5" /> Recent Reviews ({workerReviews.length})
                      </p>
                      <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                        {workerReviews.slice(0, 5).map((review) => {
                          const rp = review as unknown as Record<string, { full_name?: string }>;
                          const fp = rp.from_profile;
                          const fpName = fp?.full_name || 'User';
                          return (
                          <div key={review.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/50">
                                  {getInitials(fpName)}
                                </div>
                                <span className="text-xs font-medium text-white/70">
                                  {fpName}
                                </span>
                              </div>
                              <RatingStars rating={review.rating} />
                            </div>
                            <p className="text-xs text-white/50">{review.comment}</p>
                            <p className="text-[10px] text-white/20 mt-1">{timeAgo(review.created_at)}</p>
                          </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Admin Notes */}
                  <div className="space-y-2">
                    <p className="text-xs text-white/30 uppercase tracking-wider flex items-center gap-2">
                      <MessageSquare className="w-3.5 h-3.5" /> Admin Notes
                    </p>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add internal notes about this worker..."
                      className="glass-input w-full px-4 py-3 text-sm text-white resize-none h-24"
                    />
                    <button
                      onClick={saveNotes}
                      disabled={savingNotes}
                      className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border border-orange-500/20 transition-all disabled:opacity-50"
                    >
                      {savingNotes ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      Save Notes
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer — Actions */}
            <div className="p-6 pt-0">
              <div className="flex flex-wrap gap-2">
                {selectedWorker.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(selectedWorker)}
                      disabled={actionLoading}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20 font-medium text-sm transition-all disabled:opacity-50 flex-1 justify-center"
                    >
                      {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                      Approve
                    </button>
                    <button
                      onClick={() => { setShowDetail(false); openRejectModal(selectedWorker); }}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20 font-medium text-sm transition-all flex-1 justify-center"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </>
                )}
                {selectedWorker.status === 'active' && (
                  <button
                    onClick={() => handleSuspend(selectedWorker)}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/20 font-medium text-sm transition-all disabled:opacity-50 flex-1 justify-center"
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
                    Suspend
                  </button>
                )}
                {selectedWorker.status === 'suspended' && (
                  <button
                    onClick={() => handleApprove(selectedWorker)}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20 font-medium text-sm transition-all disabled:opacity-50 flex-1 justify-center"
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    Reactivate
                  </button>
                )}
                {selectedWorker.status === 'rejected' && (
                  <button
                    onClick={() => handleApprove(selectedWorker)}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20 font-medium text-sm transition-all disabled:opacity-50 flex-1 justify-center"
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    Re-approve
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Reject Modal ─────────────────────────────────────────── */}
      {showReject && selectedWorker && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowReject(false)} />
          <div className="relative glass-card p-6 w-full max-w-md animate-fade-in">
            <button
              onClick={() => setShowReject(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-red-500/20">
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Reject Worker</h2>
                <p className="text-sm text-white/40">
                  Rejecting <span className="text-white font-medium">{selectedWorker.profile?.full_name || 'this worker'}</span>
                </p>
              </div>
            </div>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Provide a reason for rejection..."
              className="glass-input w-full px-4 py-3 text-sm text-white resize-none h-28 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowReject(false)}
                className="flex-1 py-2.5 px-4 rounded-xl text-white/50 hover:text-white hover:bg-white/5 font-medium text-sm transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || actionLoading}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20 font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── CNIC Image Viewer ────────────────────────────────────── */}
      {cnicViewer && selectedWorker && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setCnicViewer(null)}>
          <div className="relative max-w-2xl w-full animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setCnicViewer(null)}
              className="absolute -top-10 right-0 p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={getCnicUrl(cnicViewer === 'front' ? selectedWorker.cnic_front_url : selectedWorker.cnic_back_url)}
              alt={`CNIC ${cnicViewer}`}
              className="w-full rounded-xl border border-white/10"
            />
            <p className="text-center text-sm text-white/40 mt-3">
              CNIC {cnicViewer === 'front' ? 'Front' : 'Back'} — {selectedWorker.profile?.full_name}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
