'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useLanguageStore } from '@/store/language-store';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { StatCard } from '@/components/shared/StatCard';
import {
  Wallet as WalletIcon,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  Banknote,
  Info,
} from 'lucide-react';
import type { Transaction } from '@/types';

export default function EmployerWalletPage() {
  const { employerProfile, profile } = useAuthStore();
  const { t, language } = useLanguageStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositing, setDepositing] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositMethod, setDepositMethod] = useState('');
  const [depositAccount, setDepositAccount] = useState('');
  const [depositTxId, setDepositTxId] = useState('');
  const [depositError, setDepositError] = useState('');
  const [depositSuccess, setDepositSuccess] = useState('');

  const [walletData, setWalletData] = useState({
    balance: 0,
    totalDeposited: 0,
    totalSpent: 0,
    pending: 0,
  });

  useEffect(() => {
    if (!employerProfile?.user_id) return;

    let cancelled = false;

    (async () => {
      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('*')
        .eq('from_user_id', employerProfile.user_id)
        .order('created_at', { ascending: false });

      if (cancelled) return;

      const txns = (transactionsData || []) as Transaction[];
      setTransactions(txns);

      // Employer deposits: transactions where from_user_id = employer and type = credit
      const deposits = txns.filter((tr) => tr.type === 'credit' && tr.status === 'completed');
      const totalDeposited = deposits.reduce((sum, tr) => sum + tr.amount, 0);

      // Employer spending: transactions where from_user_id = employer and type = debit
      const spent = txns.filter((tr) => tr.type === 'debit');
      const totalSpent = spent.reduce((sum, tr) => sum + tr.amount, 0);

      const balance = totalDeposited - totalSpent;
      const pendingPayments = txns.filter((tr) => tr.status === 'pending' && tr.type === 'debit').reduce((s, tr) => s + tr.amount, 0);

      setWalletData({
        balance: Math.max(0, balance),
        totalDeposited,
        totalSpent,
        pending: pendingPayments,
      });
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [employerProfile?.user_id]);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDepositError('');
    setDepositSuccess('');

    const amount = parseFloat(depositAmount);
    if (!amount || amount < 500) {
      setDepositError(language === 'ur' ? 'کم از کم PKR 500 جمع کریں' : 'Please deposit at least PKR 500.');
      return;
    }
    if (amount > 1000000) {
      setDepositError(language === 'ur' ? 'ایک وقت میں PKR 1,000,000 سے زیادہ نہیں' : 'Maximum deposit is PKR 1,000,000 at once.');
      return;
    }
    if (!depositMethod) {
      setDepositError(language === 'ur' ? 'ادائیگی کا طریقہ منتخب کریں' : 'Please select a deposit method.');
      return;
    }
    if (!depositAccount.trim() || depositAccount.trim().length < 7) {
      setDepositError(language === 'ur' ? 'درست اکاؤنٹ/فون نمبر درج کریں' : 'Please enter a valid account/phone number.');
      return;
    }

    setDepositing(true);
    try {
      const { error } = await supabase.from('transactions').insert({
        from_user_id: employerProfile?.user_id,
        to_user_id: employerProfile?.user_id,
        amount,
        type: 'credit',
        status: 'pending',
        description: `Deposit via ${depositMethod} - Pending Verification`,
        metadata: { deposit_method: depositMethod, account_number: depositAccount.trim(), transaction_id: depositTxId.trim() },
      });

      if (error) {
        setDepositError(error.message);
        return;
      }

      setDepositSuccess(t('wallet2.depositPendingMsg'));
      setDepositAmount('');
      setDepositMethod('');
      setDepositAccount('');
      setDepositTxId('');
      setShowDeposit(false);

      // Refresh wallet data
      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('*')
        .eq('from_user_id', employerProfile?.user_id)
        .order('created_at', { ascending: false });

      const txns = (transactionsData || []) as Transaction[];
      setTransactions(txns);

      const deposits = txns.filter((tr) => tr.type === 'credit' && tr.status === 'completed');
      const totalDeposited = deposits.reduce((sum, tr) => sum + tr.amount, 0);
      const spent = txns.filter((tr) => tr.type === 'debit');
      const totalSpent = spent.reduce((sum, tr) => sum + tr.amount, 0);

      setWalletData({
        balance: Math.max(0, totalDeposited - totalSpent),
        totalDeposited,
        totalSpent,
        pending: txns.filter((tr) => tr.status === 'pending' && tr.type === 'debit').reduce((s, tr) => s + tr.amount, 0),
      });
    } catch {
      setDepositError(t('common.failed'));
    } finally {
      setDepositing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="glass-card p-8">
          <div className="skeleton h-4 w-24 mb-3" />
          <div className="skeleton h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-card p-6">
              <div className="skeleton h-4 w-24 mb-3" />
              <div className="skeleton h-8 w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">{t('wallet.employerWalletTitle')}</h1>
        <p className="text-white/50 mt-1 text-sm lg:text-base">{t('wallet.employerWalletSubtitle')}</p>
      </div>

      {/* Balance Card */}
      <div className="glass-card p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/3 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10">
          <p className="text-sm font-medium text-white/50 uppercase tracking-wider mb-2">{t('wallet.currentBalance')}</p>
          <p className="text-3xl lg:text-5xl font-bold text-white mb-1">
            {formatCurrency(walletData.balance)}
          </p>
          <p className="text-sm text-white/30">{t('wallet2.employerAccount')}</p>
          <button
            onClick={() => {
              setShowDeposit(true);
              setDepositError('');
              setDepositSuccess('');
            }}
            className="mt-6 flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/20 transition-all text-sm font-semibold min-h-[44px]"
          >
            <TrendingUp className="w-4 h-4" />
            {t('wallet.addFunds')}
          </button>
        </div>
      </div>

      {/* Wallet Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
        <StatCard
          title={t('wallet.totalDeposited')}
          value={formatCurrency(walletData.totalDeposited)}
          icon={<TrendingUp className="w-5 h-5 lg:w-6 lg:h-6" />}
          color="green"
        />
        <StatCard
          title={t('wallet.totalSpent')}
          value={formatCurrency(walletData.totalSpent)}
          icon={<span className="text-lg lg:text-xl font-bold">₨</span>}
          color="red"
        />
        <StatCard
          title={t('common.pending')}
          value={formatCurrency(walletData.pending)}
          icon={<Clock className="w-5 h-5 lg:w-6 lg:h-6" />}
          color="yellow"
        />
      </div>

      {/* Deposit Modal */}
      {showDeposit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="glass-card p-6 w-full max-w-md animate-fade-in border border-white/10 sm:my-0 max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">{t('wallet.depositTitle')}</h2>
              <button onClick={() => setShowDeposit(false)} className="p-2.5 rounded-lg hover:bg-white/10 text-white/50 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-white/50 mb-4">{t('wallet.depositSubtitle')}</p>

            {/* Warning banner */}
            <div className="glass-card p-3 mb-4 bg-amber-500/5 border border-amber-500/20">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-white/60">{t('wallet2.noFakeDeposit')}</p>
              </div>
            </div>

            <form onSubmit={handleDeposit} className="space-y-4">
              {/* Amount */}
              <div>
                <label className="block text-xs text-white/40 mb-1.5 font-medium">{t('wallet.amount')}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/30 font-medium">₨</span>
                  <input type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} placeholder={t('wallet.amountPlaceholder')} className="glass-input w-full pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30" min="500" max="1000000" step="100" />
                </div>
                <p className="text-xs text-white/30 mt-1">{t('wallet.minDeposit')}</p>
              </div>

              {/* Deposit Method */}
              <div>
                <label className="block text-xs text-white/40 mb-1.5 font-medium">{t('wallet2.depositMethod')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {['jazzcash', 'easypaisa', 'bank_transfer'].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setDepositMethod(method)}
                      className={`p-3 rounded-xl border text-xs font-medium transition-all text-center min-h-[44px] ${
                        depositMethod === method
                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                          : 'bg-white/3 text-white/50 border-white/10 hover:bg-white/5'
                      }`}
                    >
                      {t(`wallet2.${method === 'jazzcash' ? 'jazzcash' : method === 'easypaisa' ? 'easypaisa' : 'bankTransfer'}`)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-xs text-white/40 mb-1.5 font-medium">{t('wallet2.accountOrPhoneNumber')}</label>
                <input type="text" value={depositAccount} onChange={(e) => setDepositAccount(e.target.value)} placeholder={t('wallet2.enterAccountOrPhone')} className="glass-input w-full px-4 py-3 text-sm text-white placeholder:text-white/30" />
              </div>

              {/* Transaction ID (optional) */}
              <div>
                <label className="block text-xs text-white/40 mb-1.5 font-medium">{t('wallet2.transactionId')}</label>
                <input type="text" value={depositTxId} onChange={(e) => setDepositTxId(e.target.value)} placeholder={t('wallet2.enterTransactionId')} className="glass-input w-full px-4 py-3 text-sm text-white placeholder:text-white/30" />
              </div>

              {depositError && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">{depositError}</p>
              )}
              {depositSuccess && (
                <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">{depositSuccess}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowDeposit(false)} className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition-all text-sm font-medium min-h-[44px]">
                  {t('common.cancel')}
                </button>
                <button type="submit" disabled={depositing} className="flex-1 px-4 py-3 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/20 transition-all text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2 min-h-[44px]">
                  {depositing ? (
                    <><div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />{t('wallet2.processingDeposit')}</>
                  ) : (
                    <><Banknote className="w-4 h-4" />{t('wallet.addFunds')}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="glass-card p-4 lg:p-6">
        <h2 className="text-lg font-semibold text-white mb-4">{t('worker.transactionHistory')}</h2>
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <WalletIcon className="w-12 h-12 text-white/20 mb-3" />
            <p className="text-white/40 text-sm">{t('worker.noTransactions')}</p>
            <p className="text-white/20 text-xs mt-1">{t('worker.noTransactionsSub')}</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
            {transactions.map((txn) => (
              <div
                key={txn.id}
                className="flex items-center gap-3 lg:gap-4 p-3 rounded-xl hover:bg-white/3 transition-all"
              >
                <div className={`p-2 lg:p-2.5 rounded-lg shrink-0 ${txn.type === 'credit' ? 'bg-blue-500/10' : 'bg-red-500/10'}`}>
                  {txn.type === 'credit' ? (
                    <ArrowDownLeft className="w-4 h-4 lg:w-5 lg:h-5 text-blue-400" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4 lg:w-5 lg:h-5 text-red-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs lg:text-sm font-medium text-white truncate">{txn.description}</p>
                  <p className="text-xs text-white/30 mt-0.5">{formatDate(txn.created_at)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-xs lg:text-sm font-semibold ${txn.type === 'credit' ? 'text-blue-400' : 'text-red-400'}`}>
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
