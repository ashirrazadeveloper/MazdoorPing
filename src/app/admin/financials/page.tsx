'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { cn, formatCurrency, formatDateTime, getStatusColor } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import {
  DollarSign, Wallet, Clock, Percent, CheckCircle, XCircle,
  ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownLeft,
  Filter, X,
} from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import type { Transaction, Withdrawal } from '@/types';

const monthlyRevenueData = [
  { month: 'Jan', platform_fee: 24500, withdrawals: 180000 },
  { month: 'Feb', platform_fee: 31200, withdrawals: 220000 },
  { month: 'Mar', platform_fee: 19800, withdrawals: 145000 },
  { month: 'Apr', platform_fee: 42700, withdrawals: 310000 },
  { month: 'May', platform_fee: 38500, withdrawals: 280000 },
  { month: 'Jun', platform_fee: 51200, withdrawals: 395000 },
  { month: 'Jul', platform_fee: 47800, withdrawals: 365000 },
  { month: 'Aug', platform_fee: 62300, withdrawals: 480000 },
  { month: 'Sep', platform_fee: 55600, withdrawals: 420000 },
  { month: 'Oct', platform_fee: 68900, withdrawals: 530000 },
  { month: 'Nov', platform_fee: 74200, withdrawals: 580000 },
  { month: 'Dec', platform_fee: 81500, withdrawals: 640000 },
];

const WITHDRAWAL_STATUS_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Completed', value: 'completed' },
];

const TRANSACTION_STATUS_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Completed', value: 'completed' },
  { label: 'Failed', value: 'failed' },
];

const ITEMS_PER_PAGE = 8;

interface WithdrawalWithWorker extends Withdrawal {
  worker: { id: string; profile: { id: string; full_name: string; email: string } };
}

interface TransactionWithProfiles extends Transaction {
  from_profile: { id: string; full_name: string } | null;
  to_profile: { id: string; full_name: string } | null;
}

export default function FinancialsPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    pendingWithdrawals: 0,
    platformFee: 0,
  });
  const [withdrawals, setWithdrawals] = useState<WithdrawalWithWorker[]>([]);
  const [transactions, setTransactions] = useState<TransactionWithProfiles[]>([]);
  const [withdrawalFilter, setWithdrawalFilter] = useState('all');
  const [txFilter, setTxFilter] = useState('all');
  const [wdPage, setWdPage] = useState(1);
  const [txPage, setTxPage] = useState(1);
  const [wdTotal, setWdTotal] = useState(0);
  const [txTotal, setTxTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [showApproveWd, setShowApproveWd] = useState<WithdrawalWithWorker | null>(null);
  const [showRejectWd, setShowRejectWd] = useState<WithdrawalWithWorker | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    let cancelled = false;
    async function fetchFinancialData() {
      setLoading(true);
      try {
        const [txRes, wdRes, statsRes] = await Promise.all([
          supabase
            .from('transactions')
            .select('*, from_profile:profiles!transactions_from_user_id_fkey(id, full_name), to_profile:profiles!transactions_to_user_id_fkey(id, full_name)', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range((txPage - 1) * ITEMS_PER_PAGE, txPage * ITEMS_PER_PAGE - 1),
          supabase
            .from('withdrawals')
            .select('*, worker:workers(id, profile:profiles(id, full_name, email))', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range((wdPage - 1) * ITEMS_PER_PAGE, wdPage * ITEMS_PER_PAGE - 1),
          supabase.from('transactions').select('amount, type, status'),
        ]);

        const allTxs = statsRes.data || [];
        const totalRevenue = allTxs
          .filter((t) => t.status === 'completed' && t.type === 'credit')
          .reduce((sum, t) => sum + (t.amount || 0), 0);
        const platformFee = Math.round(totalRevenue * 0.1);
        const pendingWds = (wdRes.data as Withdrawal[] || []).filter((w) => w.status === 'pending');
        const pendingWdAmount = pendingWds.reduce((sum, w) => sum + (w.amount || 0), 0);

        if (!cancelled) {
          setStats({
            totalRevenue,
            totalTransactions: allTxs.filter((t) => t.status === 'completed').length,
            pendingWithdrawals: pendingWdAmount,
            platformFee,
          });
          setTransactions((txRes.data as TransactionWithProfiles[]) || []);
          setTxTotal(txRes.count || 0);
          setWithdrawals((wdRes.data as WithdrawalWithWorker[]) || []);
          setWdTotal(wdRes.count || 0);
        }
      } catch (err) {
        console.error('Failed to fetch financial data:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchFinancialData();
    return () => { cancelled = true; };
  }, [txPage, wdPage, refreshKey]);

  const filteredWithdrawals = withdrawals.filter(
    (w) => withdrawalFilter === 'all' || w.status === withdrawalFilter
  );
  const filteredTransactions = transactions.filter(
    (t) => txFilter === 'all' || t.status === txFilter
  );

  const handleProcessWithdrawal = async (wd: WithdrawalWithWorker, action: 'approved' | 'rejected') => {
    if (action === 'rejected' && !adminNotes.trim()) {
      showToast('Please provide a reason for rejection', 'error');
      return;
    }
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('withdrawals')
        .update({
          status: action,
          admin_notes: adminNotes.trim() || null,
          processed_at: new Date().toISOString(),
        })
        .eq('id', wd.id);

      if (error) throw error;

      if (action === 'approved') {
        await supabase
          .from('transactions')
          .insert({
            from_user_id: user?.id || '',
            to_user_id: wd.worker?.profile?.id || '',
            amount: wd.amount,
            type: 'debit',
            status: 'completed',
            description: `Withdrawal approved for ${wd.worker?.profile?.full_name || 'worker'}`,
          });
      }

      showToast(
        `Withdrawal ${action} for ${wd.worker?.profile?.full_name || 'worker'}`,
        'success'
      );
      setShowApproveWd(null);
      setShowRejectWd(null);
      setAdminNotes('');
      setRefreshKey(k => k + 1);
    } catch (err) {
      console.error('Failed to process withdrawal:', err);
      showToast('Failed to process withdrawal', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const wdTotalPages = Math.ceil(wdTotal / ITEMS_PER_PAGE);
  const txTotalPages = Math.ceil(txTotal / ITEMS_PER_PAGE);

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
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Financials</h1>
        <p className="text-white/50 mt-1">Revenue, transactions, and withdrawal management</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={<DollarSign className="w-6 h-6" />}
          color="orange"
          change="All time"
          changeType="up"
        />
        <StatCard
          title="Total Transactions"
          value={stats.totalTransactions}
          icon={<Wallet className="w-6 h-6" />}
          color="blue"
          change="Completed"
          changeType="up"
        />
        <StatCard
          title="Pending Withdrawals"
          value={formatCurrency(stats.pendingWithdrawals)}
          icon={<Clock className="w-6 h-6" />}
          color="yellow"
          change="Awaiting processing"
          changeType="up"
        />
        <StatCard
          title="Platform Fee (10%)"
          value={formatCurrency(stats.platformFee)}
          icon={<Percent className="w-6 h-6" />}
          color="purple"
          change="Estimated earnings"
          changeType="up"
        />
      </div>

      {/* Revenue Chart */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white mb-6">Monthly Financial Overview</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyRevenueData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                tickFormatter={(val: number) => `${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 15, 25, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '13px',
                }}
                formatter={(value: number) => [formatCurrency(value)]}
              />
              <Legend
                wrapperStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}
              />
              <Bar
                dataKey="platform_fee"
                name="Platform Fee"
                fill="#f97316"
                radius={[4, 4, 0, 0]}
                opacity={0.9}
              />
              <Bar
                dataKey="withdrawals"
                name="Withdrawals"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                opacity={0.7}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Withdrawals */}
      <div className="glass-card overflow-hidden !hover:transform-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-white/5 gap-3">
          <h2 className="text-lg font-semibold text-white">Withdrawal Requests</h2>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-white/30 hidden sm:block" />
            <div className="flex gap-1 flex-wrap">
              {WITHDRAWAL_STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setWithdrawalFilter(f.value)}
                  className={cn(
                    'px-2.5 py-1 text-xs font-medium rounded-lg transition-all',
                    withdrawalFilter === f.value
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

        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="skeleton h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-40" />
                  <div className="skeleton h-3 w-32" />
                </div>
                <div className="skeleton h-6 w-24 rounded-full" />
              </div>
            ))}
          </div>
        ) : filteredWithdrawals.length === 0 ? (
          <div className="p-12 text-center">
            <Wallet className="w-10 h-10 text-white/20 mx-auto mb-2" />
            <p className="text-white/40 text-sm">No withdrawal requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-4 py-3">Worker</th>
                  <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Bank</th>
                  <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-4 py-3">Amount</th>
                  <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Status</th>
                  <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Date</th>
                  <th className="text-right text-xs font-medium text-white/40 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredWithdrawals.map((wd) => (
                  <tr key={wd.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-white">
                        {wd.worker?.profile?.full_name || 'Unknown'}
                      </p>
                      <p className="text-xs text-white/30">{wd.account_title}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-sm text-white/50">{wd.bank_name}</p>
                      <p className="text-xs text-white/30">****{wd.account_number?.slice(-4) || '****'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-emerald-400">{formatCurrency(wd.amount)}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`badge text-xs ${getStatusColor(wd.status)}`}>{wd.status}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-sm text-white/40">{formatDateTime(wd.created_at)}</span>
                    </td>
                    <td className="px-4 py-3">
                      {wd.status === 'pending' && (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => { setShowApproveWd(wd); setAdminNotes(''); }}
                            disabled={actionLoading}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-medium transition-all"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => { setShowRejectWd(wd); setAdminNotes(''); }}
                            disabled={actionLoading}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-medium transition-all"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      )}
                      {wd.admin_notes && (
                        <p className="text-xs text-white/30 max-w-[120px] truncate" title={wd.admin_notes}>
                          {wd.admin_notes}
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {wdTotalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
            <p className="text-xs text-white/40">{wdTotal} total</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setWdPage(Math.max(1, wdPage - 1))}
                disabled={wdPage === 1}
                className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70 disabled:opacity-30 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-white/60">{wdPage}/{wdTotalPages}</span>
              <button
                onClick={() => setWdPage(Math.min(wdTotalPages, wdPage + 1))}
                disabled={wdPage === wdTotalPages}
                className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70 disabled:opacity-30 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transactions */}
      <div className="glass-card overflow-hidden !hover:transform-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-white/5 gap-3">
          <h2 className="text-lg font-semibold text-white">Transaction History</h2>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-white/30 hidden sm:block" />
            <div className="flex gap-1 flex-wrap">
              {TRANSACTION_STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setTxFilter(f.value)}
                  className={cn(
                    'px-2.5 py-1 text-xs font-medium rounded-lg transition-all',
                    txFilter === f.value
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

        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="skeleton h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-48" />
                  <div className="skeleton h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <Wallet className="w-10 h-10 text-white/20 mx-auto mb-2" />
            <p className="text-white/40 text-sm">No transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-4 py-3">From</th>
                  <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-4 py-3">To</th>
                  <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-4 py-3">Amount</th>
                  <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Type</th>
                  <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Status</th>
                  <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Description</th>
                  <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-4 py-3 hidden xl:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <ArrowUpRight className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span className="text-sm text-white/60 truncate max-w-[120px]">
                          {tx.from_profile?.full_name || 'Platform'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="text-sm text-white/60 truncate max-w-[120px]">
                          {tx.to_profile?.full_name || 'Platform'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'text-sm font-medium',
                        tx.type === 'credit' ? 'text-emerald-400' : 'text-red-400'
                      )}>
                        {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`badge text-xs ${getStatusColor(tx.type)}`}>{tx.type}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`badge text-xs ${getStatusColor(tx.status)}`}>{tx.status}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <p className="text-xs text-white/40 truncate max-w-[180px]">{tx.description || '—'}</p>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      <span className="text-xs text-white/40">{formatDateTime(tx.created_at)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {txTotalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
            <p className="text-xs text-white/40">{txTotal} total</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTxPage(Math.max(1, txPage - 1))}
                disabled={txPage === 1}
                className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70 disabled:opacity-30 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-white/60">{txPage}/{txTotalPages}</span>
              <button
                onClick={() => setTxPage(Math.min(txTotalPages, txPage + 1))}
                disabled={txPage === txTotalPages}
                className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70 disabled:opacity-30 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Approve Withdrawal Modal */}
      {showApproveWd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowApproveWd(null)} />
          <div className="relative glass-card p-6 w-full max-w-md">
            <button
              onClick={() => setShowApproveWd(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">Approve Withdrawal</h2>
            </div>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Worker</span>
                <span className="text-white font-medium">{showApproveWd.worker?.profile?.full_name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Amount</span>
                <span className="text-emerald-400 font-medium">{formatCurrency(showApproveWd.amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Bank</span>
                <span className="text-white">{showApproveWd.bank_name} (****{showApproveWd.account_number?.slice(-4)})</span>
              </div>
            </div>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Optional notes..."
              className="glass-input w-full px-4 py-3 text-sm text-white resize-none h-20 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowApproveWd(null)}
                className="flex-1 py-2.5 px-4 rounded-xl text-white/50 hover:text-white hover:bg-white/5 font-medium text-sm transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleProcessWithdrawal(showApproveWd, 'approved')}
                disabled={actionLoading}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20 font-medium text-sm transition-all disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Withdrawal Modal */}
      {showRejectWd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowRejectWd(null)} />
          <div className="relative glass-card p-6 w-full max-w-md">
            <button
              onClick={() => setShowRejectWd(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-red-500/20">
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">Reject Withdrawal</h2>
            </div>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Worker</span>
                <span className="text-white font-medium">{showRejectWd.worker?.profile?.full_name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Amount</span>
                <span className="text-red-400 font-medium">{formatCurrency(showRejectWd.amount)}</span>
              </div>
            </div>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Reason for rejection (required)..."
              className="glass-input w-full px-4 py-3 text-sm text-white resize-none h-20 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectWd(null)}
                className="flex-1 py-2.5 px-4 rounded-xl text-white/50 hover:text-white hover:bg-white/5 font-medium text-sm transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleProcessWithdrawal(showRejectWd, 'rejected')}
                disabled={!adminNotes.trim() || actionLoading}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20 font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? 'Processing...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
