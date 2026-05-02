'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { cn, formatDate, formatCurrency, getInitials } from '@/lib/utils';
import {
  Search, Eye, Building2, ChevronLeft, ChevronRight,
  Star, MapPin, Phone, Mail, Briefcase, Ban, CheckCircle2,
} from 'lucide-react';
import type { Employer, Profile } from '@/types';
import { useLanguageStore } from '@/store/language-store';

const ITEMS_PER_PAGE = 10;

type EmployerWithProfile = Employer & { profile: Profile };

export default function EmployersPage() {
  const [employers, setEmployers] = useState<EmployerWithProfile[]>([]);
  const { t } = useLanguageStore();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Reset page when search changes
  const prevSearch = useRef(search);
  useEffect(() => {
    if (prevSearch.current !== search) {
      prevSearch.current = search;
      setPage(1);
    }
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    async function fetchEmployers() {
      setLoading(true);
      try {
        let query = supabase
          .from('employers')
          .select('*, profile:profiles!employers_profile_id_fkey(id, email, full_name, phone, avatar_url)', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

        if (search.trim()) {
          query = query.or(`company_name.ilike.%${search}%,city.ilike.%${search}%,business_address.ilike.%${search}%`);
        }

        const { data, count } = await query;
        if (!cancelled) {
          setEmployers((data as EmployerWithProfile[]) || []);
          setTotalCount(count || 0);
        }
      } catch (err) {
        console.error('Failed to fetch employers:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchEmployers();
    return () => { cancelled = true; };
  }, [search, page, refreshKey]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handleToggleSuspend = async (employer: EmployerWithProfile) => {
    setActionLoading(true);
    try {
      const newStatus = employer.status === 'suspended' ? 'active' : 'suspended';
      const { error } = await supabase
        .from('employers')
        .update({ status: newStatus })
        .eq('id', employer.id);

      if (error) throw error;

      showToast(
        `${employer.profile?.full_name || employer.company_name} ${newStatus === 'suspended' ? 'suspended' : 'activated'}`,
        'success'
      );
      setRefreshKey(k => k + 1);
    } catch (err) {
      console.error('Failed to update employer status:', err);
      showToast('Failed to update employer status', 'error');
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
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Employer Management</h1>
        <p className="text-white/50 mt-1">{totalCount} employers registered on the platform</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          type="text"
          placeholder="Search by company, city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="glass-input w-full pl-10 pr-4 py-2.5 text-sm text-white"
        />
      </div>

      {/* Loading */}
      {loading ? (
        <div className="glass-card overflow-hidden">
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="skeleton h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-44" />
                  <div className="skeleton h-3 w-32" />
                </div>
                <div className="skeleton h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      ) : employers.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Building2 className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/40">No employers found</p>
          <p className="text-white/20 text-sm mt-1">Try adjusting your search criteria</p>
        </div>
      ) : (
        <>
          {/* Employers Table */}
          <div className="glass-card overflow-hidden !hover:transform-none">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-4 py-3">Employer</th>
                    <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Company</th>
                    <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">City</th>
                    <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Jobs</th>
                    <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-4 py-3 hidden xl:table-cell">Total Spent</th>
                    <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Joined</th>
                    <th className="text-right text-xs font-medium text-white/40 uppercase tracking-wider px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {employers.map((employer) => (
                    <>
                      <tr
                        key={employer.id}
                        className={cn(
                          'hover:bg-white/[0.02] transition-colors',
                          expandedId === employer.id && 'bg-white/[0.02]'
                        )}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center shrink-0 text-sm font-bold text-violet-400">
                              {getInitials(employer.profile?.full_name || 'E')}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-white truncate max-w-[160px]">
                                {employer.profile?.full_name || 'Unknown'}
                              </p>
                              <p className="text-xs text-white/30 truncate max-w-[160px]">
                                {employer.profile?.email || ''}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <p className="text-sm text-white/50">{employer.company_name || 'N/A'}</p>
                          <p className="text-xs text-white/30">{employer.company_type || ''}</p>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <div className="flex items-center gap-1.5 text-sm text-white/50">
                            <MapPin className="w-3.5 h-3.5 text-white/30" />
                            {employer.city || 'N/A'}
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <div className="flex items-center gap-1.5 text-sm text-white/50">
                            <Briefcase className="w-3.5 h-3.5 text-white/30" />
                            {employer.total_posted_jobs || 0}
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden xl:table-cell">
                          <p className="text-sm text-emerald-400 font-medium">
                            {formatCurrency(employer.total_spent || 0)}
                          </p>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-sm text-white/40">{formatDate(employer.created_at)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setExpandedId(expandedId === employer.id ? null : employer.id)}
                              className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70 transition-all"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleSuspend(employer)}
                              disabled={actionLoading}
                              className={cn(
                                'p-1.5 rounded-lg transition-all',
                                employer.status === 'suspended'
                                  ? 'hover:bg-emerald-500/10 text-emerald-400/60 hover:text-emerald-400'
                                  : 'hover:bg-red-500/10 text-red-400/60 hover:text-red-400'
                              )}
                              title={employer.status === 'suspended' ? 'Activate' : 'Suspend'}
                            >
                              {employer.status === 'suspended' ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : (
                                <Ban className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                      {/* Expanded Row */}
                      {expandedId === employer.id && (
                        <tr key={`${employer.id}-expanded`}>
                          <td colSpan={7} className="px-4 py-0">
                            <div className="pb-4 pt-2 pl-14">
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                <div className="space-y-1">
                                  <p className="text-xs text-white/30 uppercase tracking-wider">Email</p>
                                  <div className="flex items-center gap-1.5 text-sm text-white/60">
                                    <Mail className="w-3.5 h-3.5" />
                                    {employer.profile?.email || 'N/A'}
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs text-white/30 uppercase tracking-wider">Phone</p>
                                  <div className="flex items-center gap-1.5 text-sm text-white/60">
                                    <Phone className="w-3.5 h-3.5" />
                                    {employer.phone_office || employer.profile?.phone || 'N/A'}
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs text-white/30 uppercase tracking-wider">Rating</p>
                                  <div className="flex items-center gap-1.5 text-sm text-white/60">
                                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                    {employer.rating?.toFixed(1) || '0.0'} ({employer.total_reviews || 0})
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs text-white/30 uppercase tracking-wider">Address</p>
                                  <p className="text-sm text-white/60">{employer.business_address || 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs text-white/30 uppercase tracking-wider">Province</p>
                                  <p className="text-sm text-white/60">{employer.province || 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs text-white/30 uppercase tracking-wider">Status</p>
                                  <span className={cn(
                                    'badge text-xs',
                                    employer.status === 'suspended'
                                      ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                  )}>
                                    {employer.status === 'suspended' ? 'Suspended' : 'Active'}
                                  </span>
                                </div>
                                {employer.bio && (
                                  <div className="space-y-1 sm:col-span-2 lg:col-span-3">
                                    <p className="text-xs text-white/30 uppercase tracking-wider">Bio</p>
                                    <p className="text-sm text-white/60">{employer.bio}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
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
    </div>
  );
}
