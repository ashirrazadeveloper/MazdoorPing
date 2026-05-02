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
  ArrowDownToLine,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  Banknote,
  Building,
  CreditCard,
  User,
  Info,
  Shield,
  Edit3,
  Save,
  Percent,
  Check,
} from 'lucide-react';
import type { Transaction, Settings } from '@/types';

const BANK_OPTIONS = [
  'HBL', 'Meezan Bank', 'UBL', 'Alfalah', 'JazzCash', 'EasyPaisa', 'Other'
];

export default function WalletPage() {
  const { workerProfile } = useAuthStore();
  const { t, language } = useLanguageStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [depositing, setDepositing] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositMethod, setDepositMethod] = useState('');
  const [depositAccount, setDepositAccount] = useState('');
  const [depositTxId, setDepositTxId] = useState('');
  const [depositError, setDepositError] = useState('');
  const [depositSuccess, setDepositSuccess] = useState('');
  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
    bankName: '',
    accountNumber: '',
    accountTitle: '',
  });
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState('');

  // Bank details
  const [showBankForm, setShowBankForm] = useState(false);
  const [bankForm, setBankForm] = useState({
    bankName: '',
    accountNumber: '',
    accountTitle: '',
  });
  const [savingBank, setSavingBank] = useState(false);
  const [bankError, setBankError] = useState('');
  const [bankSuccess, setBankSuccess] = useState('');

  // Commission
  const [commission, setCommission] = useState(10);

  const [walletData, setWalletData] = useState({
    balance: 0,
    totalEarned: 0,
    pending: 0,
    totalCommission: 0,
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

      const credits = txns.filter((tr) => tr.type === 'credit');
      const completedCredits = credits.filter((tr) => tr.status === 'completed');
      const pendingCredits = credits.filter((tr) => tr.status === 'pending');
      const debits = txns.filter((tr) => tr.type === 'debit' && tr.status === 'completed');

      // Commission debits (description contains 'commission')
      const commissionDebits = debits.filter((d) =>
        d.description.toLowerCase().includes('commission') ||
        d.description.toLowerCase().includes('platform')
      );
      const totalCommission = commissionDebits.reduce((sum, d) => sum + d.amount, 0);

      const totalEarned = completedCredits.reduce((sum, tr) => sum + tr.amount, 0);
      const pending = pendingCredits.reduce((sum, tr) => sum + tr.amount, 0);
      const totalDebited = debits.reduce((sum, tr) => sum + tr.amount, 0);
      const balance = totalEarned - totalDebited;

      setWalletData({
        balance: Math.max(0, balance),
        totalEarned,
        pending,
        totalCommission,
      });
      setLoading(false);
    })();

    // Load bank details from worker profile
    if (workerProfile.bank_name || workerProfile.account_number) {
      setBankForm({
        bankName: workerProfile.bank_name || '',
        accountNumber: workerProfile.account_number || '',
        accountTitle: workerProfile.account_title || '',
      });
    }

    // Also load bank details into withdraw form
    setWithdrawForm({
      amount: '',
      bankName: workerProfile.bank_name || '',
      accountNumber: workerProfile.account_number || '',
      accountTitle: workerProfile.account_title || '',
    });

    return () => { cancelled = true; };
  }, [workerProfile]);

  // Fetch platform commission
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('settings')
        .select('*')
        .eq('key', 'platform_commission')
        .single();
      if (data) {
        setCommission(parseFloat(data.value) || 10);
      }
    })();
  }, []);

  const maskAccountNumber = (num: string) => {
    if (num.length <= 4) return '••••••••';
    return '••••' + num.slice(-4);
  };

  const handleSaveBankDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setBankError('');
    setBankSuccess('');

    if (!bankForm.bankName.trim()) {
      setBankError(language === 'ur' ? 'براہ کرم بینک کا نام درج کریں' : 'Please enter your bank name.');
      return;
    }
    if (!bankForm.accountNumber.trim()) {
      setBankError(language === 'ur' ? 'براہ کرم اکاؤنٹ نمبر درج کریں' : 'Please enter your account number.');
      return;
    }
    if (!bankForm.accountTitle.trim()) {
      setBankError(language === 'ur' ? 'براہ کرم اکاؤنٹ ہولڈر کا نام درج کریں' : 'Please enter the account holder name.');
      return;
    }

    setSavingBank(true);
    try {
      const { error } = await supabase
        .from('workers')
        .update({
          bank_name: bankForm.bankName.trim(),
          account_number: bankForm.accountNumber.trim(),
          account_title: bankForm.accountTitle.trim(),
        })
        .eq('user_id', workerProfile?.user_id);

      if (error) {
        setBankError(error.message);
        return;
      }

      setBankSuccess(t('worker.bankDetailsSaved'));
      setShowBankForm(false);
      setWithdrawForm({
        amount: '',
        bankName: bankForm.bankName.trim(),
        accountNumber: bankForm.accountNumber.trim(),
        accountTitle: bankForm.accountTitle.trim(),
      });

      // Refresh worker profile
      useAuthStore.getState().fetchProfiles();
    } catch {
      setBankError(t('common.failed'));
    } finally {
      setSavingBank(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError('');
    setWithdrawSuccess('');

    const amount = parseFloat(withdrawForm.amount);
    if (!amount || amount <= 0) {
      setWithdrawError(language === 'ur' ? 'براہ کرم درست رقم درج کریں' : 'Please enter a valid amount.');
      return;
    }
    if (amount > walletData.balance) {
      setWithdrawError(t('worker.insufficientBalance'));
      return;
    }
    if (!withdrawForm.bankName.trim()) {
      setWithdrawError(t('worker.enterBankName'));
      return;
    }
    if (!withdrawForm.accountNumber.trim()) {
      setWithdrawError(t('worker.enterAccountNumber'));
      return;
    }
    if (!withdrawForm.accountTitle.trim()) {
      setWithdrawError(t('worker.enterAccountTitle'));
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

      setWithdrawSuccess(t('worker.withdrawalSubmitted'));
      setWithdrawForm({ ...withdrawForm, amount: '' });
      setShowWithdraw(false);

      // Refresh wallet data
      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('*')
        .eq('to_user_id', workerProfile?.user_id)
        .order('created_at', { ascending: false });

      const txns = (transactionsData || []) as Transaction[];
      setTransactions(txns);

      const credits = txns.filter((tr) => tr.type === 'credit');
      const completedCredits = credits.filter((tr) => tr.status === 'completed');
      const debits = txns.filter((tr) => tr.type === 'debit' && tr.status === 'completed');
      const totalEarned = completedCredits.reduce((sum, tr) => sum + tr.amount, 0);
      const totalDebited = debits.reduce((sum, tr) => sum + tr.amount, 0);

      setWalletData({
        balance: Math.max(0, totalEarned - totalDebited),
        totalEarned,
        pending: txns.filter((tr) => tr.type === 'credit' && tr.status === 'pending').reduce((s, tr) => s + tr.amount, 0),
        totalCommission: walletData.totalCommission,
      });
    } catch {
      setWithdrawError(t('common.failed'));
    } finally {
      setWithdrawing(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDepositError('');
    setDepositSuccess('');

    const amount = parseFloat(depositAmount);
    if (!amount || amount < 500) {
      setDepositError(language === 'ur' ? 'کم از کم PKR 500 جمع کریں' : 'Please deposit at least PKR 500.');
      return;
    }
    if (amount > 100000) {
      setDepositError(language === 'ur' ? 'ایک وقت میں PKR 100,000 سے زیادہ نہیں' : 'Maximum deposit is PKR 100,000 at once.');
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
        from_user_id: workerProfile?.user_id,
        to_user_id: workerProfile?.user_id,
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
        .eq('to_user_id', workerProfile?.user_id)
        .order('created_at', { ascending: false });

      const txns = (transactionsData || []) as Transaction[];
      setTransactions(txns);

      const completedCredits = txns.filter((tr) => tr.type === 'credit' && tr.status === 'completed');
      const debits = txns.filter((tr) => tr.type === 'debit' && tr.status === 'completed');
      const totalEarned = completedCredits.reduce((sum, tr) => sum + tr.amount, 0);
      const totalDebited = debits.reduce((sum, tr) => sum + tr.amount, 0);

      setWalletData({
        balance: Math.max(0, totalEarned - totalDebited),
        totalEarned,
        pending: txns.filter((tr) => tr.type === 'credit' && tr.status === 'pending').reduce((s, tr) => s + tr.amount, 0),
        totalCommission: walletData.totalCommission,
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
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
        <h1 className="text-2xl lg:text-3xl font-bold text-white">{t('worker.walletTitle')}</h1>
        <p className="text-white/50 mt-1 text-sm lg:text-base">{t('worker.walletSubtitle')}</p>
      </div>

      {/* Deposit Safety Banner */}
      <div className="glass-card p-4 border-emerald-500/20 bg-emerald-500/5">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-white/70 font-medium">
              {language === 'ur' ? t('worker.depositBannerUr') : t('worker.depositBannerEn')}
            </p>
          </div>
        </div>
      </div>

      {/* Balance Card */}
      <div className="glass-card p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/3 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10">
          <p className="text-sm font-medium text-white/50 uppercase tracking-wider mb-2">{t('worker.availableBalance')}</p>
          <p className="text-3xl lg:text-5xl font-bold text-white mb-1">
            {formatCurrency(walletData.balance)}
          </p>
          <p className="text-sm text-white/30">{t('wallet2.workerAccount')}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => {
                setShowDeposit(true);
                setDepositError('');
                setDepositSuccess('');
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20 transition-all text-sm font-semibold min-h-[44px]"
            >
              <TrendingUp className="w-4 h-4" />
              {t('wallet.addFunds')}
            </button>
            <button
              onClick={() => {
                setShowWithdraw(true);
                setWithdrawError('');
                setWithdrawSuccess('');
                setWithdrawForm({
                  amount: '',
                  bankName: bankForm.bankName || workerProfile?.bank_name || '',
                  accountNumber: bankForm.accountNumber || workerProfile?.account_number || '',
                  accountTitle: bankForm.accountTitle || workerProfile?.account_title || '',
                });
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 border border-white/10 transition-all text-sm font-semibold min-h-[44px]"
            >
              <ArrowDownToLine className="w-4 h-4" />
              {t('worker.withdrawFunds')}
            </button>
          </div>
        </div>
      </div>

      {/* Wallet Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard
          title={t('worker.totalEarned')}
          value={formatCurrency(walletData.totalEarned)}
          icon={<TrendingUp className="w-5 h-5 lg:w-6 lg:h-6" />}
          color="green"
        />
        <StatCard
          title={t('common.pending')}
          value={formatCurrency(walletData.pending)}
          icon={<Clock className="w-5 h-5 lg:w-6 lg:h-6" />}
          color="yellow"
        />
        <StatCard
          title={t('worker.commissionDeducted')}
          value={formatCurrency(walletData.totalCommission)}
          icon={<Percent className="w-5 h-5 lg:w-6 lg:h-6" />}
          color="red"
        />
        <StatCard
          title={t('worker.platformCommission')}
          value={`${commission}%`}
          icon={<span className="text-lg lg:text-xl font-bold">₨</span>}
          color="purple"
        />
      </div>

      {/* Bank Details Section */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">{t('worker.bankDetailsSection')}</h2>
          {!showBankForm && (
            <button
              onClick={() => setShowBankForm(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white text-xs font-medium transition-all min-h-[40px]"
            >
              <Edit3 className="w-3.5 h-3.5" />
              {bankForm.bankName ? t('worker.editBankDetails') : t('worker.addBankDetails')}
            </button>
          )}
        </div>

        {showBankForm ? (
          <form onSubmit={handleSaveBankDetails} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-white/40 mb-1.5 font-medium">{t('worker.bankName')}</label>
                <select
                  value={bankForm.bankName}
                  onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                  className="glass-input w-full px-4 py-3 text-sm text-white appearance-none cursor-pointer"
                >
                  <option value="" className="bg-gray-900">{t('worker.bankNamePlaceholder')}</option>
                  {BANK_OPTIONS.map((b) => (
                    <option key={b} value={b} className="bg-gray-900">{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1.5 font-medium">{t('worker.accountNumber')}</label>
                <input
                  type="text"
                  value={bankForm.accountNumber}
                  onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                  placeholder={t('worker.accountNumberPlaceholder')}
                  className="glass-input w-full px-4 py-3 text-sm text-white placeholder:text-white/30"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5 font-medium">{t('worker.accountTitle')}</label>
              <input
                type="text"
                value={bankForm.accountTitle}
                onChange={(e) => setBankForm({ ...bankForm, accountTitle: e.target.value })}
                placeholder={t('worker.accountTitlePlaceholder')}
                className="glass-input w-full px-4 py-3 text-sm text-white placeholder:text-white/30 sm:max-w-md"
              />
            </div>

            {bankError && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">{bankError}</p>
            )}
            {bankSuccess && (
              <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">{bankSuccess}</p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowBankForm(false)}
                className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition-all text-sm font-medium min-h-[44px]"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={savingBank}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20 transition-all text-sm font-semibold disabled:opacity-50 min-h-[44px]"
              >
                {savingBank ? (
                  <div className="w-4 h-4 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {t('worker.saveBankDetails')}
              </button>
            </div>
          </form>
        ) : bankForm.bankName ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <p className="text-xs text-white/40 mb-1">{t('worker.bankName')}</p>
              <p className="text-sm font-medium text-white">{bankForm.bankName}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <p className="text-xs text-white/40 mb-1">{t('worker.accountNumber')}</p>
              <p className="text-sm font-medium text-white font-mono">{maskAccountNumber(bankForm.accountNumber)}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <p className="text-xs text-white/40 mb-1">{t('worker.accountTitle')}</p>
              <p className="text-sm font-medium text-white">{bankForm.accountTitle}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <Building className="w-10 h-10 text-white/15 mx-auto mb-2" />
            <p className="text-sm text-white/40">{t('worker.noBankDetails')}</p>
          </div>
        )}
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
                <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-white/60">{t('wallet2.noFakeDeposit')}</p>
              </div>
            </div>

            <form onSubmit={handleDeposit} className="space-y-4">
              {/* Amount */}
              <div>
                <label className="block text-xs text-white/40 mb-1.5 font-medium">{t('wallet.amount')}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/30 font-medium">₨</span>
                  <input type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} placeholder={t('wallet.amountPlaceholder')} className="glass-input w-full pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30" min="500" max="100000" step="100" />
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
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
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
                <button type="submit" disabled={depositing} className="flex-1 px-4 py-3 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20 transition-all text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2 min-h-[44px]">
                  {depositing ? (
                    <><div className="w-4 h-4 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />{t('wallet2.processingDeposit')}</>
                  ) : (
                    <><Banknote className="w-4 h-4" />{t('wallet.addFunds')}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="glass-card p-6 w-full max-w-md animate-fade-in border border-white/10 sm:my-0 max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">{t('worker.withdrawFunds')}</h2>
              <button
                onClick={() => setShowWithdraw(false)}
                className="p-2.5 rounded-lg hover:bg-white/10 text-white/50 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-xs text-white/40 mb-1.5 font-medium">
                  {t('worker.availableBalance')}: {formatCurrency(walletData.balance)}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/30 font-medium">₨</span>
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
                <label className="block text-xs text-white/40 mb-1.5 font-medium">{t('worker.bankName')}</label>
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
                <label className="block text-xs text-white/40 mb-1.5 font-medium">{t('worker.accountNumber')}</label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="text"
                    value={withdrawForm.accountNumber}
                    onChange={(e) => setWithdrawForm({ ...withdrawForm, accountNumber: e.target.value })}
                    placeholder={t('worker.accountNumberPlaceholder')}
                    className="glass-input w-full pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-white/40 mb-1.5 font-medium">{t('worker.accountTitle')}</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="text"
                    value={withdrawForm.accountTitle}
                    onChange={(e) => setWithdrawForm({ ...withdrawForm, accountTitle: e.target.value })}
                    placeholder={t('worker.accountTitlePlaceholder')}
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
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition-all text-sm font-medium min-h-[44px]"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={withdrawing}
                  className="flex-1 px-4 py-3 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20 transition-all text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2 min-h-[44px]"
                >
                  {withdrawing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                      {t('common.processing')}
                    </>
                  ) : (
                    <>
                      <Banknote className="w-4 h-4" />
                      {t('worker.withdrawFunds')}
                    </>
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
                <div className={`p-2 lg:p-2.5 rounded-lg shrink-0 ${txn.type === 'credit' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                  {txn.type === 'credit' ? (
                    <ArrowDownLeft className="w-4 h-4 lg:w-5 lg:h-5 text-emerald-400" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4 lg:w-5 lg:h-5 text-red-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs lg:text-sm font-medium text-white truncate">{txn.description}</p>
                  <p className="text-xs text-white/30 mt-0.5">{formatDate(txn.created_at)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-xs lg:text-sm font-semibold ${txn.type === 'credit' ? 'text-emerald-400' : 'text-red-400'}`}>
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
