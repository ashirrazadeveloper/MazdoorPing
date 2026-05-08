'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { timeAgo } from '@/lib/utils';
import { useLanguageStore } from '@/store/language-store';
import {
  Users, UserCheck, UserX, ShieldCheck, Clock, Search,
  CheckCircle2, XCircle, Eye, Ban, MoreVertical, ChevronDown,
} from 'lucide-react';

interface PendingUser {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: 'worker' | 'employer';
  avatar_url: string | null;
  is_approved: boolean;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  // Joined worker/employer data
  worker_data?: { status: string; city: string; skills?: string } | null;
  employer_data?: { company_name: string; city: string } | null;
}

type FilterTab = 'all' | 'pending' | 'approved' | 'rejected';

export default function UserApprovalsPage() {
  const { language, t } = useLanguageStore();
  const isUrdu = language === 'ur';
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('role', 'admin')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch worker and employer data for each profile
      const enrichedUsers = await Promise.all(
        (profiles || []).map(async (p) => {
          let workerData = null;
          let employerData = null;

          if (p.role === 'worker') {
            const { data: wd } = await supabase
              .from('workers')
              .select('status, city')
              .eq('user_id', p.id)
              .single();
            if (wd) workerData = wd;
          } else if (p.role === 'employer') {
            const { data: ed } = await supabase
              .from('employers')
              .select('company_name, city')
              .eq('user_id', p.id)
              .single();
            if (ed) employerData = ed;
          }

          return {
            ...p,
            is_approved: p.is_approved ?? false,
            worker_data: workerData,
            employer_data: employerData,
          } as PendingUser;
        })
      );

      setUsers(enrichedUsers);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Filter users
  useEffect(() => {
    let filtered = [...users];

    if (activeTab === 'pending') {
      filtered = filtered.filter(u => !u.is_approved && !u.rejection_reason);
    } else if (activeTab === 'approved') {
      filtered = filtered.filter(u => u.is_approved);
    } else if (activeTab === 'rejected') {
      filtered = filtered.filter(u => u.rejection_reason);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(u =>
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.includes(q) ||
        (u.worker_data?.city?.toLowerCase().includes(q)) ||
        (u.employer_data?.company_name?.toLowerCase().includes(q))
      );
    }

    setFilteredUsers(filtered);
  }, [users, activeTab, searchQuery]);

  const handleApprove = async (userId: string) => {
    setActionLoading(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_approved: true,
          rejection_reason: null,
        })
        .eq('id', userId);

      if (error) throw error;

      // Also activate worker/employer record
      const user = users.find(u => u.id === userId);
      if (user?.role === 'worker') {
        await supabase
          .from('workers')
          .update({ status: 'active' })
          .eq('user_id', userId);
      }

      // Create notification for user
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'system',
        title: isUrdu ? 'اکاؤنٹ منظور' : 'Account Approved',
        message: isUrdu
          ? 'آپ خوشی سے خبر دینا چاہتے ہیں کہ آپ کا اکاؤنٹ منظور کر دیا گیا ہے۔ اب آپ مکمل ایپ استعمال کر سکتے ہیں۔'
          : 'We are pleased to inform you that your account has been approved. You now have full access to the platform.',
        data: {},
        is_read: false,
      });

      await fetchUsers();
    } catch (err) {
      console.error('Failed to approve user:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!selectedUser || !rejectionReason.trim()) return;

    setActionLoading(selectedUser.id);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_approved: false,
          rejection_reason: rejectionReason.trim(),
        })
        .eq('id', selectedUser.id);

      if (error) throw error;

      // Create notification
      await supabase.from('notifications').insert({
        user_id: selectedUser.id,
        type: 'system',
        title: isUrdu ? 'اکاؤنٹ مسترد' : 'Account Rejected',
        message: isUrdu
          ? `معذرت، آپ کا اکاؤنٹ مسترد کر دیا گیا ہے۔ وجہ: ${rejectionReason}`
          : `Sorry, your account has been rejected. Reason: ${rejectionReason}`,
        data: {},
        is_read: false,
      });

      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedUser(null);
      await fetchUsers();
    } catch (err) {
      console.error('Failed to reject user:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectModal = (user: PendingUser) => {
    setSelectedUser(user);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const openDetailModal = (user: PendingUser) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const pendingCount = users.filter(u => !u.is_approved && !u.rejection_reason).length;
  const approvedCount = users.filter(u => u.is_approved).length;
  const rejectedCount = users.filter(u => u.rejection_reason).length;

  const tabs: { key: FilterTab; label: string; count: number; icon: typeof Users }[] = [
    { key: 'pending', label: isUrdu ? 'منتظر' : 'Pending', count: pendingCount, icon: Clock },
    { key: 'approved', label: isUrdu ? 'منظور' : 'Approved', count: approvedCount, icon: CheckCircle2 },
    { key: 'rejected', label: isUrdu ? 'مسترد' : 'Rejected', count: rejectedCount, icon: XCircle },
    { key: 'all', label: isUrdu ? 'سب' : 'All', count: users.length, icon: Users },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="skeleton h-10 w-64 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-4">
              <div className="skeleton h-4 w-20 mb-2" />
              <div className="skeleton h-8 w-12" />
            </div>
          ))}
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="glass-card p-4 flex items-center gap-4">
            <div className="skeleton h-10 w-10 rounded-lg" />
            <div className="flex-1">
              <div className="skeleton h-4 w-40 mb-2" />
              <div className="skeleton h-3 w-28" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">
            {isUrdu ? 'صارف کی منظوری' : 'User Approvals'}
          </h1>
          <p className="text-white/50 mt-1">
            {isUrdu ? 'نئے صارفین کی منظوری یا مسترد کریں' : 'Approve or reject new user registrations'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`glass-card p-4 text-left transition-all ${isActive ? 'border-orange-500/30 bg-orange-500/5' : 'hover:bg-white/5'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${isActive ? 'text-orange-400' : 'text-white/40'}`} />
                <span className="text-xs text-white/40">{tab.label}</span>
              </div>
              <div className={`text-2xl font-bold ${isActive ? 'text-orange-400' : 'text-white'}`}>
                {tab.count}
              </div>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isUrdu ? 'نام، ای میل، شہر سے تلاش کریں...' : 'Search by name, email, city...'}
          className="w-full pl-11 pr-4 py-3 rounded-xl glass-card bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-orange-500/30 transition-all"
        />
      </div>

      {/* User List */}
      <div className="space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Users className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white/40 mb-1">
              {isUrdu ? 'کوئی صارف نہیں ملا' : 'No users found'}
            </h3>
            <p className="text-sm text-white/20">
              {isUrdu ? 'اس فلٹر میں کوئی صارف موجود نہیں ہے' : 'No users match this filter'}
            </p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              className="glass-card p-4 flex items-center gap-4 hover:bg-white/5 transition-all"
            >
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold text-white ${
                user.role === 'worker'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-blue-500/20 text-blue-400'
              }`}>
                {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-sm font-medium text-white truncate">
                    {user.full_name || 'Unknown'}
                  </h3>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
                    user.role === 'worker'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-blue-500/15 text-blue-400'
                  }`}>
                    {user.role === 'worker'
                      ? (isUrdu ? 'مزدور' : 'Worker')
                      : (isUrdu ? 'پیشہ ور' : 'Employer')}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-white/40">
                  <span>{user.email}</span>
                  <span className="hidden sm:inline">|</span>
                  <span className="hidden sm:inline">{user.phone || 'N/A'}</span>
                  <span className="hidden md:inline">|</span>
                  <span className="hidden md:inline">
                    {user.worker_data?.city || user.employer_data?.city || 'N/A'}
                  </span>
                  {user.employer_data?.company_name && (
                    <>
                      <span className="hidden md:inline">|</span>
                      <span className="hidden md:inline truncate max-w-[150px]">
                        {user.employer_data.company_name}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Status + Time */}
              <div className="text-right shrink-0 hidden sm:block">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  user.is_approved
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : user.rejection_reason
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {user.is_approved
                    ? (isUrdu ? 'منظور' : 'Approved')
                    : user.rejection_reason
                    ? (isUrdu ? 'مسترد' : 'Rejected')
                    : (isUrdu ? 'منتظر' : 'Pending')}
                </span>
                <p className="text-[10px] text-white/20 mt-1">{timeAgo(user.created_at)}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => openDetailModal(user)}
                  className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all"
                  title={isUrdu ? 'تفصیلات دیکھیں' : 'View Details'}
                >
                  <Eye className="w-4 h-4" />
                </button>

                {!user.is_approved && !user.rejection_reason && (
                  <>
                    <button
                      onClick={() => handleApprove(user.id)}
                      disabled={actionLoading === user.id}
                      className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-all disabled:opacity-50"
                      title={isUrdu ? 'منظور کریں' : 'Approve'}
                    >
                      {actionLoading === user.id ? (
                        <div className="w-4 h-4 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => openRejectModal(user)}
                      disabled={actionLoading === user.id}
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all disabled:opacity-50"
                      title={isUrdu ? 'مسترد کریں' : 'Reject'}
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </>
                )}

                {user.is_approved && (
                  <button
                    onClick={() => openRejectModal(user)}
                    disabled={actionLoading === user.id}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-red-400/50 hover:text-red-400 transition-all disabled:opacity-50"
                    title={isUrdu ? 'رسد بند کریں' : 'Revoke Access'}
                  >
                    <Ban className="w-4 h-4" />
                  </button>
                )}

                {user.rejection_reason && (
                  <button
                    onClick={() => handleApprove(user.id)}
                    disabled={actionLoading === user.id}
                    className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-all disabled:opacity-50"
                    title={isUrdu ? 'دوبارہ منظور کریں' : 'Re-approve'}
                  >
                    {actionLoading === user.id ? (
                      <div className="w-4 h-4 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                    ) : (
                      <UserCheck className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowDetailModal(false)}>
          <div className="glass-card w-full max-w-md p-6 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">{isUrdu ? 'صارف کی تفصیلات' : 'User Details'}</h2>
              <button onClick={() => setShowDetailModal(false)} className="p-2 rounded-lg hover:bg-white/10 text-white/40">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { label: isUrdu ? 'نام' : 'Name', value: selectedUser.full_name },
                { label: isUrdu ? 'ای میل' : 'Email', value: selectedUser.email },
                { label: isUrdu ? 'فون' : 'Phone', value: selectedUser.phone || 'N/A' },
                { label: isUrdu ? 'کردار' : 'Role', value: selectedUser.role },
                { label: isUrdu ? 'شہر' : 'City', value: selectedUser.worker_data?.city || selectedUser.employer_data?.city || 'N/A' },
                ...(selectedUser.employer_data?.company_name ? [{ label: isUrdu ? 'کمپنی' : 'Company', value: selectedUser.employer_data.company_name }] : []),
                { label: isUrdu ? 'رجسٹریشن' : 'Registered', value: new Date(selectedUser.created_at).toLocaleDateString() },
                { label: isUrdu ? 'اسٹیٹس' : 'Status', value: selectedUser.is_approved ? (isUrdu ? 'منظور' : 'Approved') : selectedUser.rejection_reason ? (isUrdu ? 'مسترد' : 'Rejected') : (isUrdu ? 'منتظر' : 'Pending') },
                ...(selectedUser.rejection_reason ? [{ label: isUrdu ? 'وجہ' : 'Reason', value: selectedUser.rejection_reason }] : []),
              ].map((item, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-white/5 last:border-0">
                  <span className="text-sm text-white/40">{item.label}</span>
                  <span className="text-sm text-white font-medium text-right max-w-[60%] truncate">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowRejectModal(false)}>
          <div className="glass-card w-full max-w-md p-6 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-red-400">
                {isUrdu ? 'صارف کو مسترد کریں' : 'Reject User'}
              </h2>
              <button onClick={() => setShowRejectModal(false)} className="p-2 rounded-lg hover:bg-white/10 text-white/40">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-white/60 mb-4">
              {isUrdu
                ? `${selectedUser.full_name} کو مسترد کرنے کی وجہ لکھیں`
                : `Enter rejection reason for ${selectedUser.full_name}`}
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder={isUrdu ? 'وجہ لکھیں...' : 'Enter rejection reason...'}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-red-500/30 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white/60 text-sm hover:bg-white/10 transition-all"
              >
                {isUrdu ? 'منسوخ' : 'Cancel'}
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim() || actionLoading === selectedUser.id}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-all disabled:opacity-50"
              >
                {actionLoading === selectedUser.id
                  ? (isUrdu ? 'ہو رہا ہے...' : 'Processing...')
                  : (isUrdu ? 'مسترد کریں' : 'Reject User')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
