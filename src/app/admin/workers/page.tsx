'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { cn, formatDate, getStatusColor, getInitials } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import {
  Search, Filter, CheckCircle, XCircle, Eye, Users,
  ChevronLeft, ChevronRight, Star, MapPin, Phone, Mail, X,
} from 'lucide-react';
import type { Worker, WorkerStatus, WorkerSkill } from '@/types';

const STATUS_FILTERS: { label: string; value: WorkerStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Active', value: 'active' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Suspended', value: 'suspended' },
];

const ITEMS_PER_PAGE = 10;

type WorkerWithProfile = Worker & {
  profile: { id: string; email: string; full_name: string; phone: string; avatar_url: string | null };
  skills: (WorkerSkill & { category: { id: string; name: string } })[];
};

export default function WorkersPage() {
  const { user } = useAuthStore();
  const [workers, setWorkers] = useState<WorkerWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<WorkerStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedWorker, setSelectedWorker] = useState<WorkerWithProfile | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [cnicViewer, setCnicViewer] = useState<{ url: string; label: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Reset page when filters change
  const prevSearch = useRef(search);
  const prevStatusFilter = useRef(statusFilter);
  useEffect(() => {
    if (prevSearch.current !== search || prevStatusFilter.current !== statusFilter) {
      prevSearch.current = search;
      prevStatusFilter.current = statusFilter;
      setPage(1);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    let cancelled = false;
    async function fetchWorkers() {
      setLoading(true);
      try {
        let query = supabase
          .from('workers')
          .select('*, profile:profiles!workers_profile_id_fkey(id, email, full_name, phone, avatar_url), skills:worker_skills(*, category:categories(id, name))', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }

        if (search.trim()) {
          query = query.or(`city.ilike.%${search}%,address.ilike.%${search}%`);
        }

        const { data, count } = await query;
        if (!cancelled) {
          setWorkers((data as WorkerWithProfile[]) || []);
          setTotalCount(count || 0);
        }
      } catch (err) {
        console.error('Failed to fetch workers:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchWorkers();
    return () => { cancelled = true; };
  }, [search, statusFilter, page, refreshKey]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handleApprove = async (worker: WorkerWithProfile) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('workers')
        .update({ status: 'active' })
        .eq('id', worker.id);

      if (error) throw error;

      await supabase.from('verification_logs').insert({
        worker_id: worker.id,
        admin_id: user?.id,
        action: 'approve',
        reason: 'Approved by admin',
      });

      showToast(`${worker.profile?.full_name || 'Worker'} approved successfully`, 'success');
      setShowDetail(false);
      setRefreshKey(k => k + 1);
    } catch (err) {
      console.error('Failed to approve worker:', err);
      showToast('Failed to approve worker', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedWorker || !rejectReason.trim()) return;
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('workers')
        .update({ status: 'rejected' })
        .eq('id', selectedWorker.id);

      if (error) throw error;

      await supabase.from('verification_logs').insert({
        worker_id: selectedWorker.id,
        admin_id: user?.id,
        action: 'reject',
        reason: rejectReason.trim(),
      });

      showToast(`${selectedWorker.profile?.full_name || 'Worker'} rejected`, 'success');
      setShowReject(false);
      setRejectReason('');
      setSelectedWorker(null);
      setShowDetail(false);
      setRefreshKey(k => k + 1);
    } catch (err) {
      console.error('Failed to reject worker:', err);
      showToast('Failed to reject worker', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (worker: WorkerWithProfile) => {
    setSelectedWorker(worker);
    setRejectReason('');
    setShowReject(true);
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
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Worker Management</h1>
        <p className="text-white/50 mt-1">{totalCount} workers registered on the platform</p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search by city or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input w-full pl-10 pr-4 py-2.5 text-sm text-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-white/30" />
          <div className="flex gap-1">
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

      {/* Loading */}
      {loading ? (
        <div className="glass-card overflow-hidden">
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
                    <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-4 py-3">Worker</th>
                    <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Contact</th>
                    <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">City</th>
                    <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-4 py-3 hidden xl:table-cell">Skills</th>
                    <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-4 py-3">Status</th>
                    <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Rating</th>
                    <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Joined</th>
                    <th className="text-right text-xs font-medium text-white/40 uppercase tracking-wider px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {workers.map((worker) => (
                    <tr key={worker.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center shrink-0 text-sm font-bold text-orange-400">
                            {getInitials(worker.profile?.full_name || 'W')}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate max-w-[160px]">
                              {worker.profile?.full_name || 'Unknown'}
                            </p>
                            <p className="text-xs text-white/30 truncate max-w-[160px]">
                              {worker.profile?.email || ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-sm text-white/50">{worker.profile?.phone || 'N/A'}</p>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex items-center gap-1.5 text-sm text-white/50">
                          <MapPin className="w-3.5 h-3.5 text-white/30" />
                          {worker.city || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
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
                      <td className="px-4 py-3">
                        <span className={`badge text-xs ${getStatusColor(worker.status)}`}>
                          {worker.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <div className="flex items-center gap-1 text-sm text-white/50">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          {worker.rating?.toFixed(1) || '0.0'}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-sm text-white/40">{formatDate(worker.created_at)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => { setSelectedWorker(worker); setShowDetail(true); }}
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

      {/* Worker Detail Modal */}
      {showDetail && selectedWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDetail(false)} />
          <div className="relative glass-card p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => setShowDetail(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-orange-500/20 flex items-center justify-center text-lg font-bold text-orange-400">
                {getInitials(selectedWorker.profile?.full_name || 'W')}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">{selectedWorker.profile?.full_name || 'Unknown'}</h2>
                <span className={`badge text-xs ${getStatusColor(selectedWorker.status)}`}>{selectedWorker.status}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-white/30 uppercase tracking-wider">Email</p>
                  <div className="flex items-center gap-1.5 text-sm text-white/60">
                    <Mail className="w-3.5 h-3.5" />
                    {selectedWorker.profile?.email || 'N/A'}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-white/30 uppercase tracking-wider">Phone</p>
                  <div className="flex items-center gap-1.5 text-sm text-white/60">
                    <Phone className="w-3.5 h-3.5" />
                    {selectedWorker.profile?.phone || 'N/A'}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-white/30 uppercase tracking-wider">City</p>
                  <div className="flex items-center gap-1.5 text-sm text-white/60">
                    <MapPin className="w-3.5 h-3.5" />
                    {selectedWorker.city || 'N/A'}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-white/30 uppercase tracking-wider">Rating</p>
                  <div className="flex items-center gap-1.5 text-sm text-white/60">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    {selectedWorker.rating?.toFixed(1) || '0.0'} ({selectedWorker.total_reviews || 0})
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-white/30 uppercase tracking-wider">CNIC</p>
                <p className="text-sm text-white/60">{selectedWorker.cnic_number || 'N/A'}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-white/30 uppercase tracking-wider">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedWorker.skills?.length ? (
                    selectedWorker.skills.map((skill) => (
                      <span key={skill.id} className="px-2.5 py-1 text-xs bg-orange-500/10 text-orange-400 rounded-lg border border-orange-500/20">
                        {skill.category?.name || 'Skill'}
                        {skill.experience_years ? ` (${skill.experience_years}y)` : ''}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-white/30">No skills listed</span>
                  )}
                </div>
              </div>

              {/* CNIC Documents Viewer */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-white/30 uppercase tracking-wider">CNIC Documents</p>
                  {selectedWorker.cnic_front_url && selectedWorker.cnic_back_url ? (
                    <span className="badge text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Documents Uploaded</span>
                  ) : (
                    <span className="badge text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Incomplete</span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {/* CNIC Front */}
                  <div>
                    <p className="text-xs text-white/40 mb-1.5">Front Side</p>
                    {selectedWorker.cnic_front_url ? (
                      <div
                        className="relative rounded-lg overflow-hidden border border-white/10 cursor-pointer group hover:border-white/20 transition-all"
                        onClick={() => setCnicViewer({ url: selectedWorker.cnic_front_url!, label: 'CNIC Front' })}
                      >
                        <img src={selectedWorker.cnic_front_url} alt="CNIC Front" className="w-full h-32 object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Eye className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="h-32 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-center">
                        <p className="text-xs text-white/20">Not uploaded</p>
                      </div>
                    )}
                  </div>
                  {/* CNIC Back */}
                  <div>
                    <p className="text-xs text-white/40 mb-1.5">Back Side</p>
                    {selectedWorker.cnic_back_url ? (
                      <div
                        className="relative rounded-lg overflow-hidden border border-white/10 cursor-pointer group hover:border-white/20 transition-all"
                        onClick={() => setCnicViewer({ url: selectedWorker.cnic_back_url!, label: 'CNIC Back' })}
                      >
                        <img src={selectedWorker.cnic_back_url} alt="CNIC Back" className="w-full h-32 object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Eye className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="h-32 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-center">
                        <p className="text-xs text-white/20">Not uploaded</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-white/30 uppercase tracking-wider">Bio</p>
                <p className="text-sm text-white/60">{selectedWorker.bio || 'No bio provided'}</p>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="glass-card p-3 text-center">
                  <p className="text-lg font-bold text-white">{selectedWorker.completed_jobs || 0}</p>
                  <p className="text-xs text-white/30">Jobs Done</p>
                </div>
                <div className="glass-card p-3 text-center">
                  <p className="text-lg font-bold text-white">{formatDate(selectedWorker.created_at)}</p>
                  <p className="text-xs text-white/30">Joined</p>
                </div>
                <div className="glass-card p-3 text-center">
                  <p className="text-lg font-bold text-white">PKR {selectedWorker.hourly_rate || 0}</p>
                  <p className="text-xs text-white/30">Hourly Rate</p>
                </div>
              </div>

              {selectedWorker.status === 'pending' && (
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => handleApprove(selectedWorker)}
                    disabled={actionLoading}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20 font-medium text-sm transition-all disabled:opacity-50"
                  >
                    {actionLoading ? 'Processing...' : 'Approve Worker'}
                  </button>
                  <button
                    onClick={() => { setShowDetail(false); openRejectModal(selectedWorker); }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20 font-medium text-sm transition-all"
                  >
                    Reject Worker
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CNIC Image Lightbox */}
      {cnicViewer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={() => setCnicViewer(null)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
          <div className="relative max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setCnicViewer(null)}
              className="absolute -top-12 right-0 p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="glass-card p-4">
              <p className="text-sm font-medium text-white/70 mb-3">{cnicViewer.label} — {selectedWorker?.profile?.full_name}</p>
              <img src={cnicViewer.url} alt={cnicViewer.label} className="w-full rounded-lg" />
              <p className="text-xs text-white/30 mt-2">CNIC: {selectedWorker?.cnic_number || 'N/A'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowReject(false)} />
          <div className="relative glass-card p-6 w-full max-w-md">
            <button
              onClick={() => setShowReject(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-red-500/20">
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">Reject Worker</h2>
            </div>
            <p className="text-sm text-white/50 mb-4">
              Rejecting <span className="text-white font-medium">{selectedWorker?.profile?.full_name || 'this worker'}</span>. Please provide a reason.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection..."
              className="glass-input w-full px-4 py-3 text-sm text-white resize-none h-28 mb-4"
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
                {actionLoading ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
