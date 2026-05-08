'use client';

import { useEffect, useState, useCallback } from 'react';
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
  Check,
  Copy,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  Landmark,
  CircleDollarSign,
  Shield,
} from 'lucide-react';
import type { Transaction } from '@/types';

const presetAmounts = [500, 1000, 2000, 5000, 10000];

const paymentMethods = [
  { id: 'jazzcash', name: 'JazzCash', nameUr: 'جاز کیش', color: 'from-red-500 to-red-600', number: '0300-1234567', icon: Smartphone },
  { id: 'easypaisa', name: 'EasyPaisa', nameUr: 'ایزی پیسہ', color: 'from-green-500 to-green-600', number: '0301-1234567', icon: Smartphone },
  { id: 'bank', name: 'Bank Transfer', nameUr: 'بینک ٹرانسفر', color: 'from-blue-500 to-blue-600', details: { bank: 'HBL', account: '1234-5678-9012-34', title: 'MazdoorPing Pvt Ltd' }, icon: Landmark },
  { id: 'sadapay', name: 'SadaPay', nameUr: 'سادا پے', color: 'from-purple-500 to-purple-600', number: '0302-1234567', icon: CircleDollarSign },
];

export default function EmployerWalletPage() {
  const { employerProfile } = useAuthStore();
  const { t, language } = useLanguageStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositing, setDepositing] = useState(false);
  const [depositError, setDepositError] = useState('');

  // Multi-step deposit wizard
  const [paymentStep, setPaymentStep] = useState(1);
  const [depositAmount, setDepositAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<typeof paymentMethods[0] | null>(null);
  const [depositReference, setDepositReference] = useState('');
  const [depositSubmitted, setDepositSubmitted] = useState(false);
  const [submittedTxnId, setSubmittedTxnId] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);

  const [walletData, setWalletData] = useState({
    balance: 0,
    totalDeposited: 0,
    totalSpent: 0,
    pending: 0,
  });

  const refreshWalletData = useCallback(async (userId: string) => {
    const { data: transactionsData } = await supabase
      .from('transactions')
      .select('*')
      .eq('from_user_id', userId)
      .order('created_at', { ascending: false });

    const txns = (transactionsData || []) as Transaction[];
    setTransactions(txns);

    const deposits = txns.filter((tr) => tr.type === 'credit' && tr.status === 'completed');
    const totalDeposited = deposits.reduce((sum, tr) => sum + tr.amount, 0);
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
  }, []);

  useEffect(() => {
    if (!employerProfile?.user_id) return;
    let cancelled = false;

    (async () => {
      if (cancelled) return;
      await refreshWalletData(employerProfile.user_id);
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [employerProfile?.user_id, refreshWalletData]);

  const resetDepositForm = useCallback(() => {
    setPaymentStep(1);
    setDepositAmount('');
    setSelectedMethod(null);
    setDepositReference('');
    setDepositError('');
    setDepositSubmitted(false);
    setSubmittedTxnId('');
    setCopiedNumber(false);
  }, []);

  const handleCopyNumber = (number: string) => {
    const cleaned = number.replace(/-/g, '');
    navigator.clipboard.writeText(cleaned).then(() => {
      setCopiedNumber(true);
      setTimeout(() => setCopiedNumber(false), 2000);
    });
  };

  const handleDepositSubmit = async () => {
    setDepositError('');
    const amount = parseFloat(depositAmount);

    if (!amount || amount < 500) {
      setDepositError(t('payment.minAmount'));
      return;
    }
    if (amount > 100000) {
      setDepositError(t('payment.maxAmount'));
      return;
    }
    if (!selectedMethod) {
      setDepositError(t('wallet2.selectMethod'));
      return;
    }
    if (!depositReference.trim()) {
      setDepositError(t('payment.enterReference'));
      return;
    }

    setDepositing(true);
    try {
      const { data, error } = await supabase.from('transactions').insert({
        from_user_id: employerProfile?.user_id,
        to_user_id: employerProfile?.user_id,
        amount,
        type: 'credit',
        status: 'pending',
        description: `Deposit via ${selectedMethod.name} - Pending Verification`,
        metadata: { deposit_method: selectedMethod.id, transaction_id: depositReference.trim() },
      }).select();

      if (error) {
        setDepositError(error.message);
        return;
      }

      const txn = (data as Transaction[])[0];
      setSubmittedTxnId(txn?.id?.slice(0, 8).toUpperCase() || 'N/A');
      setDepositSubmitted(true);
      setPaymentStep(5);

      await refreshWalletData(employerProfile?.user_id || '');
    } catch {
      setDepositError(t('common.failed'));
    } finally {
      setDepositing(false);
    }
  };

  const renderStepIndicator = (step: number, title: string) => {
    const isActive = paymentStep === step;
    const isCompleted = paymentStep > step;
    return (
      <div className="flex items-center gap-2">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
          isCompleted ? 'bg-blue-500/20 text-blue-400' :
          isActive ? 'bg-blue-500/30 text-blue-400 ring-2 ring-blue-500/50' :
          'bg-white/5 text-white/30'
        }`}>
          {isCompleted ? <Check className="w-3.5 h-3.5" /> : step}
        </div>
        <span className={`text-xs font-medium transition-all ${isActive ? 'text-white' : isCompleted ? 'text-blue-400' : 'text-white/30'}`}>
          {title}
        </span>
      </div>
    );
  };

  const renderDepositStep = () => {
    if (depositSubmitted) {
      return (
        <div className="text-center py-6">
          <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCheck className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">{t('payment.depositPending')}</h3>
          <p className="text-sm text-white/50 mb-4 leading-relaxed">{t('payment.depositPendingMsg')}</p>
          <div className="glass-card p-3 bg-white/[0.02] border border-white/5 mb-6 inline-block">
            <p className="text-xs text-white/40 mb-1">Transaction ID</p>
            <p className="text-sm font-mono text-blue-400 font-semibold">{submittedTxnId}</p>
          </div>
          <button
            onClick={() => { setShowDeposit(false); resetDepositForm(); }}
            className="w-full px-4 py-3 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/20 transition-all text-sm font-semibold min-h-[44px]"
          >
            {t('payment.done')}
          </button>
        </div>
      );
    }

    if (paymentStep === 1) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2 mb-4">
            {presetAmounts.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setDepositAmount(String(amt))}
                className={`p-3 rounded-xl border text-sm font-semibold transition-all min-h-[52px] ${
                  depositAmount === String(amt)
                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/30 shadow-lg shadow-blue-500/5'
                    : 'bg-white/[0.03] text-white/60 border-white/10 hover:bg-white/[0.06] hover:border-white/20'
                }`}
              >
                Rs. {amt.toLocaleString()}
              </button>
            ))}
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1.5 font-medium">{t('payment.customAmount')}</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/30 font-medium">Rs.</span>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="500"
                className="glass-input w-full pl-12 pr-4 py-3 text-sm text-white placeholder:text-white/30"
                min="500"
                max="100000"
                step="100"
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <p className="text-[10px] text-white/30">{t('payment.minAmount')}</p>
              <p className="text-[10px] text-white/30">{t('payment.maxAmount')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              const amt = parseFloat(depositAmount);
              if (!amt || amt < 500) {
                setDepositError(t('payment.minAmount'));
                return;
              }
              setDepositError('');
              setPaymentStep(2);
            }}
            className="w-full px-4 py-3 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/20 transition-all text-sm font-semibold min-h-[44px] flex items-center justify-center gap-2"
          >
            {t('common.next')}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      );
    }

    if (paymentStep === 2) {
      return (
        <div className="space-y-3">
          {paymentMethods.map((method) => {
            const IconComp = method.icon;
            return (
              <button
                key={method.id}
                type="button"
                onClick={() => { setSelectedMethod(method); setPaymentStep(3); setDepositError(''); }}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left min-h-[60px] ${
                  selectedMethod?.id === method.id
                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    : 'bg-white/[0.03] text-white/80 border-white/10 hover:bg-white/[0.06] hover:border-white/20'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${method.color} flex items-center justify-center shrink-0`}>
                  <IconComp className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{language === 'ur' ? method.nameUr : method.name}</p>
                  <p className="text-xs text-white/40">{method.number || method.details?.bank}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-white/30 shrink-0" />
              </button>
            );
          })}
        </div>
      );
    }

    if (paymentStep === 3) {
      if (!selectedMethod) return null;
      const isWallet = ['jazzcash', 'easypaisa', 'sadapay'].includes(selectedMethod.id);

      return (
        <div className="space-y-4">
          <div className="glass-card p-4 bg-amber-500/5 border border-amber-500/20">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-white/70 mb-2">{t('payment.depositInstructions')}</p>
                {isWallet ? (
                  <>
                    <p className="text-xs text-white/50 mb-2">{t('payment.sendToAccount')}:</p>
                    <div className="flex items-center gap-2 bg-white/[0.05] rounded-lg p-2.5">
                      <p className="text-base font-mono font-bold text-white">{selectedMethod.number}</p>
                      <button
                        type="button"
                        onClick={() => handleCopyNumber(selectedMethod.number || '')}
                        className="ml-auto flex items-center gap-1 px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-xs text-white/60 transition-all shrink-0"
                      >
                        {copiedNumber ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copiedNumber ? t('payment.numberCopied') : t('payment.copyNumber')}
                      </button>
                    </div>
                    <div className="mt-3 p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                      <p className="text-xs text-white/40 font-medium mb-1">{t('payment.noBankAccount')}</p>
                      <p className="text-[11px] text-white/30 leading-relaxed">{t('payment.visitShop')}</p>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-white/60">{t('payment.bankDetails')}:</p>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-white/40">{t('payment.bankNameLabel')}</span>
                        <span className="text-white font-medium">{selectedMethod.details?.bank}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/40">{t('payment.accountTitleLabel')}</span>
                        <span className="text-white font-medium">{selectedMethod.details?.title}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/40">{t('payment.accountNumberLabel')}</span>
                        <span className="text-white font-mono font-medium">{selectedMethod.details?.account}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs text-white/40 mb-1.5 font-medium">{t('payment.transactionRef')} <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={depositReference}
              onChange={(e) => setDepositReference(e.target.value)}
              placeholder={t('payment.referencePlaceholder')}
              className="glass-input w-full px-4 py-3 text-sm text-white placeholder:text-white/30"
            />
          </div>

          <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-white/50 leading-relaxed">{t('payment.depositWarning')}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setPaymentStep(2); setDepositError(''); }}
              className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition-all text-sm font-medium min-h-[44px] flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              {t('common.back')}
            </button>
            <button
              type="button"
              onClick={() => {
                if (!depositReference.trim()) {
                  setDepositError(t('payment.enterReference'));
                  return;
                }
                setDepositError('');
                setPaymentStep(4);
              }}
              className="flex-1 px-4 py-3 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/20 transition-all text-sm font-semibold min-h-[44px] flex items-center justify-center gap-2"
            >
              {t('common.next')}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      );
    }

    if (paymentStep === 4) {
      return (
        <div className="space-y-4">
          <div className="text-center mb-2">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">{t('payment.step4Title')}</p>
            <p className="text-2xl font-bold text-white">Rs. {parseFloat(depositAmount).toLocaleString()}</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-xs text-white/40">{t('payment.summaryMethod')}</span>
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${selectedMethod?.color} flex items-center justify-center`}>
                  {selectedMethod && <selectedMethod.icon className="w-3.5 h-3.5 text-white" />}
                </div>
                <span className="text-sm font-medium text-white">{selectedMethod?.name}</span>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-xs text-white/40">{t('payment.summaryReference')}</span>
              <span className="text-sm font-mono text-white">{depositReference}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-white/50 leading-relaxed">{t('payment.depositWarning')}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setPaymentStep(3); setDepositError(''); }}
              className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition-all text-sm font-medium min-h-[44px] flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              {t('common.back')}
            </button>
            <button
              type="button"
              onClick={handleDepositSubmit}
              disabled={depositing}
              className="flex-1 px-4 py-3 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/20 transition-all text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2 min-h-[44px]"
            >
              {depositing ? (
                <>
                  <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                  {t('common.processing')}
                </>
              ) : (
                <>
                  <Banknote className="w-4 h-4" />
                  {t('payment.confirmDeposit')}
                </>
              )}
            </button>
          </div>
        </div>
      );
    }

    return null;
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
            onClick={() => { setShowDeposit(true); resetDepositForm(); }}
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

      {/* Deposit Modal - Multi Step Wizard */}
      {showDeposit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="glass-card p-6 w-full max-w-md animate-fade-in border border-white/10 sm:my-0 max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">{t('wallet.depositTitle')}</h2>
              <button
                onClick={() => { setShowDeposit(false); resetDepositForm(); }}
                className="p-2.5 rounded-lg hover:bg-white/10 text-white/50 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!depositSubmitted && paymentStep <= 4 && (
              <div className="flex items-center gap-1 mb-5 overflow-x-auto pb-1">
                {renderStepIndicator(1, t('payment.step1Title'))}
                <div className="w-4 h-px bg-white/10 shrink-0" />
                {renderStepIndicator(2, t('payment.step2Title'))}
                <div className="w-4 h-px bg-white/10 shrink-0" />
                {renderStepIndicator(3, t('payment.step3Title'))}
                <div className="w-4 h-px bg-white/10 shrink-0" />
                {renderStepIndicator(4, t('payment.step4Title'))}
              </div>
            )}

            {depositError && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">{depositError}</p>
            )}

            {renderDepositStep()}
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
