'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { cn, formatDate, timeAgo, getInitials } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import {
  Search, ShieldCheck, Eye, X, CheckCircle, XCircle,
  Phone, Mail, Clock, FileWarning, User, MapPin, Calendar,
  Building2, Briefcase, Info, Navigation,
} from 'lucide-react';
import type { Worker, WorkerSkill } from '@/types';
import { useLanguageStore } from '@/store/language-store';

type WorkerWithProfile = Worker & {
  profile: { id: string; email: string; full_name: string; phone: string; avatar_url: string | null };
  skills: (WorkerSkill & { category: { id: string; name: string } })[];
};

type CnicViewer = { url: string; label: string; workerName: string; cnicNumber: string } | null;

export default function VerificationPage() {
  const { user } = useAuthStore();
  const { t } = useLanguageStore();
  const [workers, setWorkers] = useState<WorkerWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'with_cnic' | 'without_cnic'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showReject, setShowReject] = useState(false);
  const [rejectWorker, setRejectWorker] = useState<WorkerWithProfile | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [cnicViewer, setCnicViewer] = useState<CnicViewer>(null);
  const [detailWorker, setDetailWorker] = useState<WorkerWithProfile | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function fetchPendingWorkers() {
      setLoading(true);
      try {
        const { data } = await supabase
          .from('workers')
          .select('*, profile:profiles!workers_profile_id_fkey(id, email, full_name, phone, avatar_url), skills:worker_skills(*, category:categories(id, name))')
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (!cancelled) {
          setWorkers((data as WorkerWithProfile[]) || []);
        }
      } catch (err) {
        console.error('Failed to fetch pending workers:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchPendingWorkers();
    return () => { cancelled = true; };
  }, [refreshKey]);

  const filteredWorkers = workers.filter((worker) => {
    const matchesSearch = search.trim()
      ? worker.profile?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        worker.profile?.email?.toLowerCase().includes(search.toLowerCase()) ||
        worker.profile?.phone?.includes(search) ||
        worker.cnic_number?.includes(search) ||
        worker.city?.toLowerCase().includes(search.toLowerCase())
      : true;

    if (filter === 'with_cnic') {
      return matchesSearch && worker.cnic_front_url && worker.cnic_back_url;
    }
    if (filter === 'without_cnic') {
      return matchesSearch && (!worker.cnic_front_url || !worker.cnic_back_url);
    }
    return matchesSearch;
  });

  const pendingWithCnic = workers.filter((w) => w.cnic_front_url && w.cnic_back_url).length;

  const handleApprove = async (worker: WorkerWithProfile) => {
    setActionLoading(worker.id);
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
        reason: 'CNIC verified and approved',
      });

      showToast(`${worker.profile?.full_name || 'Worker'} approved successfully`, 'success');
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error('Failed to approve worker:', err);
      showToast('Failed to approve worker', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectWorker || !rejectReason.trim()) return;
    setActionLoading(rejectWorker.id);
    try {
      const { error } = await supabase
        .from('workers')
        .update({ status: 'rejected' })
        .eq('id', rejectWorker.id);

      if (error) throw error;

      await supabase.from('verification_logs').insert({
        worker_id: rejectWorker.id,
        admin_id: user?.id,
        action: 'reject',
        reason: rejectReason.trim(),
      });

      showToast(`${rejectWorker.profile?.full_name || 'Worker'} rejected`, 'success');
      setShowReject(false);
      setRejectWorker(null);
      setRejectReason('');
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error('Failed to reject worker:', err);
      showToast('Failed to reject worker', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectModal = (worker: WorkerWithProfile) => {
    setRejectWorker(worker);
    setRejectReason('');
    setShowReject(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast */}
      {toast && (
        <div
          className={cn(
            'fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg animate-fade-in',
            toast.type === 'success' ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'
          )}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-500/20">
            <ShieldCheck className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Verification Queue</h1>
            <p className="text-white/50 mt-0.5">
              Review and verify worker CNIC documents
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="glass-card p-4">
          <p className="text-2xl font-bold text-white">{workers.length}</p>
          <p className="text-xs text-white/40 mt-1">Pending Verification</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-2xl font-bold text-emerald-400">{pendingWithCnic}</p>
          <p className="text-xs text-white/40 mt-1">With CNIC Documents</p>
        </div>
        <div className="glass-card p-4 col-span-2 md:col-span-1">
          <p className="text-2xl font-bold text-yellow-400">{workers.length - pendingWithCnic}</p>
          <p className="text-xs text-white/40 mt-1">Missing CNIC Documents</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search by name, email, phone, CNIC, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input w-full pl-10 pr-4 py-2.5 text-sm text-white"
          />
        </div>
        <div className="flex gap-1.5">
          {[
            { label: 'All', value: 'all' as const },
            { label: 'With CNIC', value: 'with_cnic' as const },
            { label: 'No CNIC', value: 'without_cnic' as const },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-lg transition-all',
                filter === f.value
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  : 'text-white/40 hover:text-white/60 hover:bg-white/5'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="skeleton w-12 h-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-32" />
                  <div className="skeleton h-3 w-48" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="skeleton h-28 rounded-lg" />
                <div className="skeleton h-28 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredWorkers.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <ShieldCheck className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/40">
            {workers.length === 0 ? 'No pending verifications' : 'No workers match your search'}
          </p>
          <p className="text-white/20 text-sm mt-1">
            {workers.length === 0
              ? 'All workers have been reviewed'
              : 'Try adjusting your search or filter criteria'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredWorkers.map((worker) => (
            <div key={worker.id} className="glass-card p-5 space-y-4">
              {/* Worker Header */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0 text-sm font-bold text-orange-400">
                  {getInitials(worker.profile?.full_name || 'W')}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate">
                    {worker.profile?.full_name || 'Unknown'}
                  </p>
                  <p className="text-xs text-white/40 truncate">
                    Registered {timeAgo(worker.created_at)}
                  </p>
                </div>
                {worker.cnic_front_url && worker.cnic_back_url ? (
                  <span className="badge text-[10px] bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shrink-0">
                    CNIC Ready
                  </span>
                ) : (
                  <span className="badge text-[10px] bg-yellow-500/20 text-yellow-400 border-yellow-500/30 shrink-0">
                    Incomplete
                  </span>
                )}
              </div>

              {/* Contact Info */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <Mail className="w-3.5 h-3.5 text-white/30 shrink-0" />
                  <span className="truncate">{worker.profile?.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <Phone className="w-3.5 h-3.5 text-white/30 shrink-0" />
                  <span>{worker.profile?.phone || 'N/A'}</span>
                </div>
              </div>

              {/* CNIC Number */}
              {worker.cnic_number && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5">
                  <ShieldCheck className="w-3.5 h-3.5 text-white/30" />
                  <span className="text-xs text-white/50 font-mono">{worker.cnic_number}</span>
                </div>
              )}

              {/* CNIC Documents */}
              <div className="space-y-1.5">
                <p className="text-[10px] text-white/30 uppercase tracking-wider">CNIC Documents</p>
                <div className="grid grid-cols-2 gap-2">
                  {/* Front */}
                  <div>
                    <p className="text-[10px] text-white/30 mb-1">Front Side</p>
                    {worker.cnic_front_url ? (
                      <div
                        className="relative rounded-lg overflow-hidden border border-white/10 cursor-pointer group hover:border-white/20 transition-all"
                        onClick={() =>
                          setCnicViewer({
                            url: worker.cnic_front_url!,
                            label: 'CNIC Front',
                            workerName: worker.profile?.full_name || 'Unknown',
                            cnicNumber: worker.cnic_number || 'N/A',
                          })
                        }
                      >
                        <img
                          src={worker.cnic_front_url}
                          alt="CNIC Front"
                          className="w-full h-24 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Eye className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="h-24 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-center">
                        <FileWarning className="w-4 h-4 text-white/15" />
                      </div>
                    )}
                  </div>
                  {/* Back */}
                  <div>
                    <p className="text-[10px] text-white/30 mb-1">Back Side</p>
                    {worker.cnic_back_url ? (
                      <div
                        className="relative rounded-lg overflow-hidden border border-white/10 cursor-pointer group hover:border-white/20 transition-all"
                        onClick={() =>
                          setCnicViewer({
                            url: worker.cnic_back_url!,
                            label: 'CNIC Back',
                            workerName: worker.profile?.full_name || 'Unknown',
                            cnicNumber: worker.cnic_number || 'N/A',
                          })
                        }
                      >
                        <img
                          src={worker.cnic_back_url}
                          alt="CNIC Back"
                          className="w-full h-24 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Eye className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="h-24 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-center">
                        <FileWarning className="w-4 h-4 text-white/15" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Skills */}
              {worker.skills && worker.skills.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] text-white/30 uppercase tracking-wider">Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {worker.skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill.id}
                        className="px-2 py-0.5 text-[10px] bg-orange-500/10 text-orange-400 rounded-md border border-orange-500/20"
                      >
                        {skill.category?.name || 'Skill'}
                        {skill.experience_years ? ` (${skill.experience_years}y)` : ''}
                      </span>
                    ))}
                    {worker.skills.length > 3 && (
                      <span className="text-[10px] text-white/30 px-1">
                        +{worker.skills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Registration Date */}
              <div className="flex items-center gap-2 text-xs text-white/30">
                <Clock className="w-3.5 h-3.5" />
                <span>Applied on {formatDate(worker.created_at)}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setDetailWorker(worker)}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/15 font-medium text-xs transition-all"
                >
                  <Info className="w-3.5 h-3.5" />
                  Details
                </button>
                <button
                  onClick={() => handleApprove(worker)}
                  disabled={actionLoading === worker.id}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-sm transition-all',
                    worker.cnic_front_url && worker.cnic_back_url
                      ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20'
                      : 'bg-white/5 text-white/30 border border-white/5 cursor-not-allowed'
                  )}
                  title={
                    !worker.cnic_front_url || !worker.cnic_back_url
                      ? 'CNIC documents are incomplete'
                      : 'Approve worker'
                  }
                >
                  {actionLoading === worker.id ? (
                    <div className="w-4 h-4 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Approve
                </button>
                <button
                  onClick={() => openRejectModal(worker)}
                  disabled={actionLoading === worker.id}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20 font-medium text-sm transition-all disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CNIC Image Lightbox */}
      {cnicViewer && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          onClick={() => setCnicViewer(null)}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
          <div className="relative max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setCnicViewer(null)}
              className="absolute -top-12 right-0 p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="glass-card p-4">
              <p className="text-sm font-medium text-white/70 mb-3">
                {cnicViewer.label} — {cnicViewer.workerName}
              </p>
              <img
                src={cnicViewer.url}
                alt={cnicViewer.label}
                className="w-full rounded-lg"
              />
              <p className="text-xs text-white/30 mt-2">
                CNIC: {cnicViewer.cnicNumber}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Worker Detail Modal */}
      {detailWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setDetailWorker(null)}
          />
          <div className="relative glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-white/5 bg-gray-900/90 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-sm font-bold text-orange-400">
                  {getInitials(detailWorker.profile?.full_name || 'W')}
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">{detailWorker.profile?.full_name || 'Unknown'}</h2>
                  <p className="text-xs text-white/40">Worker Profile Details</p>
                </div>
              </div>
              <button
                onClick={() => setDetailWorker(null)}
                className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Personal Information */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-white/80">Personal Information</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Full Name', value: detailWorker.profile?.full_name },
                    { label: 'Email', value: detailWorker.profile?.email },
                    { label: 'Phone', value: detailWorker.profile?.phone },
                    { label: 'Gender', value: detailWorker.gender ? detailWorker.gender.charAt(0).toUpperCase() + detailWorker.gender.slice(1) : null },
                    { label: 'Date of Birth', value: detailWorker.date_of_birth ? formatDate(detailWorker.date_of_birth) : null },
                    { label: 'City', value: detailWorker.city },
                    { label: 'Province', value: detailWorker.province },
                    { label: 'Address', value: detailWorker.address },
                  ].map((item) => (
                    <div key={item.label} className={item.label === 'Address' ? 'col-span-2' : ''}>
                      <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">{item.label}</p>
                      <p className="text-xs text-white/70">{item.value || '—'}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Bio */}
              {detailWorker.bio && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Info className="w-4 h-4 text-blue-400" />
                    <h3 className="text-sm font-semibold text-white/80">Bio</h3>
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed bg-white/3 p-3 rounded-lg border border-white/5">{detailWorker.bio}</p>
                </section>
              )}

              {/* CNIC */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-4 h-4 text-violet-400" />
                  <h3 className="text-sm font-semibold text-white/80">CNIC Verification</h3>
                </div>
                <div className="mb-3">
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">CNIC Number</p>
                  <p className="text-xs text-white/70 font-mono">{detailWorker.cnic_number || '—'}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Front Side</p>
                    {detailWorker.cnic_front_url ? (
                      <div
                        className="relative rounded-lg overflow-hidden border border-white/10 cursor-pointer group hover:border-white/20 transition-all"
                        onClick={() => {
                          setDetailWorker(null);
                          setCnicViewer({
                            url: detailWorker.cnic_front_url!,
                            label: 'CNIC Front',
                            workerName: detailWorker.profile?.full_name || 'Unknown',
                            cnicNumber: detailWorker.cnic_number || 'N/A',
                          });
                        }}
                      >
                        <img src={detailWorker.cnic_front_url} alt="CNIC Front" className="w-full h-32 object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Eye className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="h-32 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-center">
                        <FileWarning className="w-5 h-5 text-white/15" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Back Side</p>
                    {detailWorker.cnic_back_url ? (
                      <div
                        className="relative rounded-lg overflow-hidden border border-white/10 cursor-pointer group hover:border-white/20 transition-all"
                        onClick={() => {
                          setDetailWorker(null);
                          setCnicViewer({
                            url: detailWorker.cnic_back_url!,
                            label: 'CNIC Back',
                            workerName: detailWorker.profile?.full_name || 'Unknown',
                            cnicNumber: detailWorker.cnic_number || 'N/A',
                          });
                        }}
                      >
                        <img src={detailWorker.cnic_back_url} alt="CNIC Back" className="w-full h-32 object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Eye className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="h-32 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-center">
                        <FileWarning className="w-5 h-5 text-white/15" />
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Skills */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-semibold text-white/80">Skills</h3>
                </div>
                {detailWorker.skills && detailWorker.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {detailWorker.skills.map((skill) => (
                      <span
                        key={skill.id}
                        className="px-2.5 py-1 text-xs bg-orange-500/10 text-orange-400 rounded-lg border border-orange-500/20"
                      >
                        {skill.category?.name || 'Skill'}
                        {skill.experience_years ? ` — ${skill.experience_years}y exp` : ''}
                        {skill.is_primary && <span className="ml-1 text-[10px] text-orange-300">(Primary)</span>}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-white/30">No skills listed</p>
                )}
              </section>

              {/* Professional */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-semibold text-white/80">Professional Details</h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">Experience</p>
                    <p className="text-xs text-white/70">
                      {detailWorker.skills?.find((s) => s.is_primary)?.experience_years
                        ? `${detailWorker.skills.find((s) => s.is_primary)!.experience_years} years`
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">Hourly Rate</p>
                    <p className="text-xs text-white/70">{detailWorker.hourly_rate ? `PKR ${detailWorker.hourly_rate}/hr` : '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">Availability</p>
                    <p className="text-xs text-white/70">
                      <span className={detailWorker.availability ? 'text-emerald-400' : 'text-red-400'}>
                        {detailWorker.availability ? 'Available' : 'Unavailable'}
                      </span>
                    </p>
                  </div>
                </div>
              </section>

              {/* Bank Details */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-semibold text-white/80">Bank Details</h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">Bank Name</p>
                    <p className="text-xs text-white/70">{detailWorker.bank_name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">Account Number</p>
                    <p className="text-xs text-white/70 font-mono">
                      {detailWorker.account_number
                        ? `${detailWorker.account_number.slice(0, 4)}${'•'.repeat(Math.max(0, detailWorker.account_number.length - 8))}${detailWorker.account_number.length > 4 ? detailWorker.account_number.slice(-4) : ''}`
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">Account Title</p>
                    <p className="text-xs text-white/70">{detailWorker.account_title || '—'}</p>
                  </div>
                </div>
              </section>

              {/* Location */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-rose-400" />
                  <h3 className="text-sm font-semibold text-white/80">Location</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">Coordinates</p>
                    <p className="text-xs text-white/70 font-mono">
                      {detailWorker.latitude && detailWorker.longitude
                        ? `${detailWorker.latitude.toFixed(4)}, ${detailWorker.longitude.toFixed(4)}`
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">Map</p>
                    {detailWorker.latitude && detailWorker.longitude ? (
                      <a
                        href={`https://www.google.com/maps?q=${detailWorker.latitude},${detailWorker.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        <Navigation className="w-3 h-3" />
                        Open in Maps
                      </a>
                    ) : (
                      <p className="text-xs text-white/30">—</p>
                    )}
                  </div>
                </div>
              </section>

              {/* Registration */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-white/80">Registration</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">Registered</p>
                    <p className="text-xs text-white/70">{formatDate(detailWorker.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">Status</p>
                    <p className="text-xs text-white/70 capitalize">{detailWorker.status}</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showReject && rejectWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowReject(false)}
          />
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
              Rejecting{' '}
              <span className="text-white font-medium">
                {rejectWorker.profile?.full_name || 'this worker'}
              </span>
              . Please provide a reason.
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
                disabled={!rejectReason.trim() || actionLoading === rejectWorker.id}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20 font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === rejectWorker.id ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
