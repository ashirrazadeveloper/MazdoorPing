'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { StatCard } from '@/components/shared/StatCard';
import {
  Wallet as WalletIcon,
  DollarSign,
  Clock,
  ArrowDownToLine,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  Banknote,
  Building,
  CreditCard,
  User,
} from 'lucide-react';
import type { Transaction } from '@/types';

export default function WalletPage() {
  const { workerProfile } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
    bankName: '',
    accountNumber: '',
    accountTitle: '',
  });
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState('');

  const [walletData, setWalletData] = useState({
    balance: 0,
    totalEarned: 0,
    pending: 0,
  });

  useEffect(() => {
    if (!workerProfile) return;

    let cancelled = false;

    (async () => {
      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('*')
        .eq('to_user_id', workerProfile.user_id)
        .order('created_at', { ascending: false });

      if (cancelled) return;

      const txns = (transactionsData || []) as Transaction[];
      setTransactions(txns);

      const credits = txns.filter((t) => t.type === 'credit');
      const completedCredits = credits.filter((t) => t.status === 'completed');
      const pendingCredits = credits.filter((t) => t.status === 'pending');
      const debits = txns.filter((t) => t.type === 'debit' && t.status === 'completed');

      const totalEarned = completedCredits.reduce((sum, t) => sum + t.amount, 0);
      const pending = pendingCredits.reduce((sum, t) => sum + t.amount, 0);
      const totalDebited = debits.reduce((sum, t) => sum + t.amount, 0);
      const balance = totalEarned - totalDebited;

      setWalletData({
        balance: Math.max(0, balance),
        totalEarned,
        pending,
      });
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [workerProfile]);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError('');
    setWithdrawSuccess('');

    const amount = parseFloat(withdrawForm.amount);
    if (!amount || amount <= 0) {
      setWithdrawError('Please enter a valid amount.');
      return;
    }
    if (amount > walletData.balance) {
      setWithdrawError('Insufficient balance.');
      return;
    }
    if (!withdrawForm.bankName.trim()) {
      setWithdrawError('Please enter your bank name.');
      return;
    }
    if (!withdrawForm.accountNumber.trim()) {
      setWithdrawError('Please enter your account number.');
      return;
    }
    if (!withdrawForm.accountTitle.trim()) {
      setWithdrawError('Please enter the account holder name.');
      return;
    }

    setWithdrawing(true);

    try {
      const { error } = await supabase.from('withdrawals').insert({
        worker_id: workerProfile?.id,
        amount,
        bank_name: withdrawForm.bankName.trim(),
        account_number: withdrawForm.accountNumber.trim(),
        account_title: withdrawForm.accountTitle.trim(),
        status: 'pending',
      });

      if (error) {
        setWithdrawError(error.message);
        return;
      }

      setWithdrawSuccess('Withdrawal request submitted successfully!');
      setWithdrawForm({ amount: '', bankName: '', accountNumber: '', accountTitle: '' });
      setShowWithdraw(false);

      // Refresh wallet data
      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('*')
        .eq('to_user_id', workerProfile?.user_id)
        .order('created_at', { ascending: false });

      const txns = (transactionsData || []) as Transaction[];
      setTransactions(txns);

      const credits = txns.filter((t) => t.type === 'credit');
      const completedCredits = credits.filter((t) => t.status === 'completed');
      const pendingCredits = credits.filter((t) => t.status === 'pending');
      const debits = txns.filter((t) => t.type === 'debit' && t.status === 'completed');

      const totalEarned = completedCredits.reduce((sum, t) => sum + t.amount, 0);
      const pending = pendingCredits.reduce((sum, t) => sum + t.amount, 0);
      const totalDebited = debits.reduce((sum, t) => sum + t.amount, 0);

      setWalletData({
        balance: Math.max(0, totalEarned - totalDebited),
        totalEarned,
        pending,
      });
    } catch {
      setWithdrawError('Failed to process withdrawal. Please try again.');
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="glass-card p-8">
          <div className="skeleton h-4 w-24 mb-3" />
          <div className="skeleton h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-card p-6">
              <div className="skeleton h-4 w-24 mb-3" />
              <div className="skeleton h-8 w-20" />
            </div>
          ))}
        </div>
        <div className="glass-card p-6">
          <div className="skeleton h-5 w-40 mb-4" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="skeleton h-10 w-10 rounded-lg" />
                <div className="flex-1">
                  <div className="skeleton h-4 w-48 mb-2" />
                  <div className="skeleton h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Wallet</h1>
        <p className="text-white/50 mt-1">Manage your earnings and withdrawals</p>
      </div>

      {/* Balance Card */}
      <div className="glass-card p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/3 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10">
          <p className="text-sm font-medium text-white/50 uppercase tracking-wider mb-2">Available Balance</p>
          <p className="text-4xl lg:text-5xl font-bold text-white mb-1">
            {formatCurrency(walletData.balance)}
          </p>
          <p className="text-sm text-white/30">MazdoorPing Worker Account</p>
          <button
            onClick={() => {
              setShowWithdraw(true);
              setWithdrawError('');
              setWithdrawSuccess('');
            }}
            className="mt-6 flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20 transition-all text-sm font-semibold"
          >
            <ArrowDownToLine className="w-4 h-4" />
            Withdraw Funds
          </button>
        </div>
      </div>

      {/* Wallet Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Earned"
          value={formatCurrency(walletData.totalEarned)}
          icon={<TrendingUp className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Pending"
          value={formatCurrency(walletData.pending)}
          icon={<Clock className="w-6 h-6" />}
          color="yellow"
        />
        <StatCard
          title="Withdrawals"
          value={formatCurrency(walletData.totalEarned - walletData.balance)}
          icon={<WalletIcon className="w-6 h-6" />}
          color="blue"
        />
      </div>

      {/* Withdrawal Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 w-full max-w-md animate-fade-in border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Withdraw Funds</h2>
              <button
                onClick={() => setShowWithdraw(false)}
                className="p-2 rounded-lg hover:bg-white/10 text-white/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-xs text-white/40 mb-1.5 font-medium">
                  Available: {formatCurrency(walletData.balance)}
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="number"
                    value={withdrawForm.amount}
                    onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                    placeholder="Amount (PKR)"
                    className="glass-input w-full pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30"
                    min="1"
                    max={walletData.balance}
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-white/40 mb-1.5 font-medium">Bank Name</label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="text"
                    value={withdrawForm.bankName}
                    onChange={(e) => setWithdrawForm({ ...withdrawForm, bankName: e.target.value })}
                    placeholder="e.g. HBL, Meezan Bank"
                    className="glass-input w-full pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-white/40 mb-1.5 font-medium">Account Number</label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="text"
                    value={withdrawForm.accountNumber}
                    onChange={(e) => setWithdrawForm({ ...withdrawForm, accountNumber: e.target.value })}
                    placeholder="Your bank account number"
                    className="glass-input w-full pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-white/40 mb-1.5 font-medium">Account Title</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="text"
                    value={withdrawForm.accountTitle}
                    onChange={(e) => setWithdrawForm({ ...withdrawForm, accountTitle: e.target.value })}
                    placeholder="Account holder name"
                    className="glass-input w-full pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30"
                  />
                </div>
              </div>

              {withdrawError && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  {withdrawError}
                </p>
              )}

              {withdrawSuccess && (
                <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                  {withdrawSuccess}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWithdraw(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition-all text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={withdrawing}
                  className="flex-1 px-4 py-3 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20 transition-all text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {withdrawing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Banknote className="w-4 h-4" />
                      Withdraw
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Transaction History</h2>
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <WalletIcon className="w-12 h-12 text-white/20 mb-3" />
            <p className="text-white/40 text-sm">No transactions yet</p>
            <p className="text-white/20 text-xs mt-1">Your payment history will appear here</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
            {transactions.map((txn) => (
              <div
                key={txn.id}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/3 transition-all"
              >
                <div className={`p-2.5 rounded-lg shrink-0 ${txn.type === 'credit' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                  {txn.type === 'credit' ? (
                    <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5 text-red-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{txn.description}</p>
                  <p className="text-xs text-white/30 mt-0.5">{formatDate(txn.created_at)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-semibold ${txn.type === 'credit' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {txn.type === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                  </p>
                  <span className={`badge text-[10px] ${getStatusColor(txn.status)}`}>{txn.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
