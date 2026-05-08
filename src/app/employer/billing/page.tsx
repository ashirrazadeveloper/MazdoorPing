'use client';

import { useEffect, useState } from 'react';
import { useLanguageStore } from '@/store/language-store';
import { useAuthStore } from '@/store/auth-store';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import Link from 'next/link';
import {
  CreditCard,
  Receipt,
  Download,
  Calendar,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Crown,
  Zap,
  ArrowRight,
  FileText,
  RefreshCcw,
  History,
} from 'lucide-react';

interface SubscriptionData {
  plan_name: string;
  price: number;
  currency: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  jobs_used: number;
  jobs_limit: number;
  auto_renew: boolean;
  payment_method: string | null;
}

interface PaymentRecord {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: string;
}

interface InvoiceRecord {
  id: string;
  invoice_number: string;
  date: string;
  amount: number;
  status: string;
  description: string;
}

const mockPayments: PaymentRecord[] = [
  { id: '1', date: '2025-01-15', description: 'Premium Plan - Monthly', amount: 2999, status: 'completed' },
  { id: '2', date: '2024-12-15', description: 'Premium Plan - Monthly', amount: 2999, status: 'completed' },
  { id: '3', date: '2024-11-15', description: 'Premium Plan - Monthly', amount: 2999, status: 'completed' },
  { id: '4', date: '2024-10-15', description: 'Basic Plan - Monthly', amount: 999, status: 'completed' },
];

const mockInvoices: InvoiceRecord[] = [
  { id: '1', invoice_number: 'INV-2025-0015', date: '2025-01-15', amount: 2999, status: 'paid', description: 'Premium Plan - January 2025' },
  { id: '2', invoice_number: 'INV-2024-0048', date: '2024-12-15', amount: 2999, status: 'paid', description: 'Premium Plan - December 2024' },
  { id: '3', invoice_number: 'INV-2024-0036', date: '2024-11-15', amount: 2999, status: 'paid', description: 'Premium Plan - November 2024' },
];

const defaultSubscription: SubscriptionData = {
  plan_name: 'Free',
  price: 0,
  currency: 'PKR',
  status: 'active',
  current_period_start: null,
  current_period_end: null,
  jobs_used: 0,
  jobs_limit: 3,
  auto_renew: false,
  payment_method: null,
};

function getPlanIcon(planName: string) {
  switch (planName) {
    case 'Premium':
      return <Crown className="w-5 h-5 text-amber-400" />;
    case 'Basic':
      return <Zap className="w-5 h-5 text-blue-400" />;
    default:
      return <DollarSign className="w-5 h-5 text-emerald-400" />;
  }
}

function getPlanGradient(planName: string) {
  switch (planName) {
    case 'Premium':
      return 'from-amber-500/20 to-amber-600/5 border-amber-500/20';
    case 'Basic':
      return 'from-blue-500/20 to-blue-600/5 border-blue-500/20';
    default:
      return 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20';
  }
}

function getPlanAccent(planName: string) {
  switch (planName) {
    case 'Premium':
      return 'text-amber-400';
    case 'Basic':
      return 'text-blue-400';
    default:
      return 'text-emerald-400';
  }
}

export default function EmployerBillingPage() {
  const { language } = useLanguageStore();
  const { employerProfile } = useAuthStore();
  const [subscription, setSubscription] = useState<SubscriptionData>(defaultSubscription);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRenew, setAutoRenew] = useState(defaultSubscription.auto_renew);

  // Update planFeatures with current language on re-render
  const currentPlanFeatures = (() => {
    const features: Record<string, string[]> = {
      Free: [
        language === 'ur' ? '3 ماہانہ جاب پوسٹ' : '3 Monthly Job Posts',
        language === 'ur' ? 'بنیادی ورکر تلاش' : 'Basic Worker Search',
        language === 'ur' ? 'چیٹ کی حد' : 'Limited Chat',
      ],
      Basic: [
        language === 'ur' ? '15 ماہانہ جاب پوسٹ' : '15 Monthly Job Posts',
        language === 'ur' ? 'اعلیٰ ورکر تلاش' : 'Advanced Worker Search',
        language === 'ur' ? 'آنسکرین چیٹ' : 'Unlimited Chat',
        language === 'ur' ? 'پرائمری سپورٹ' : 'Priority Support',
      ],
      Premium: [
        language === 'ur' ? 'نہ محدود جاب پوسٹ' : 'Unlimited Job Posts',
        language === 'ur' ? 'AI مشورہ آسسٹنٹ' : 'AI Recommendation Assistant',
        language === 'ur' ? 'آنسکرین سب کچھ' : 'Unlimited Everything',
        language === 'ur' ? 'VIP سپورٹ' : 'VIP Support',
        language === 'ur' ? 'تجزیات اور رپورٹیں' : 'Analytics & Reports',
      ],
    };
    return features;
  })();

  const usagePercentage = subscription.jobs_limit > 0
    ? Math.min((subscription.jobs_used / subscription.jobs_limit) * 100, 100)
    : 0;

  const usageBarColor = usagePercentage >= 90
    ? 'bg-red-500'
    : usagePercentage >= 70
      ? 'bg-amber-500'
      : 'bg-emerald-500';

  useEffect(() => {
    const userId = employerProfile?.user_id;
    let cancelled = false;

    const fetchData = async () => {
      if (!userId) {
        // No user, use defaults + mock data
        setPayments(mockPayments);
        setInvoices(mockInvoices);
        setLoading(false);
        return;
      }

      try {
        // Fetch employer subscription
        const { data: subData, error: subError } = await supabase
          .from('employer_subscriptions')
          .select('*')
          .eq('employer_id', userId)
          .single();

        if (!cancelled && subData && !subError) {
          setSubscription({
            plan_name: subData.plan_name || 'Free',
            price: subData.price || 0,
            currency: subData.currency || 'PKR',
            status: subData.status || 'active',
            current_period_start: subData.current_period_start || null,
            current_period_end: subData.current_period_end || null,
            jobs_used: subData.jobs_used || 0,
            jobs_limit: subData.jobs_limit || 3,
            auto_renew: subData.auto_renew ?? false,
            payment_method: subData.payment_method || null,
          });
          setAutoRenew(subData.auto_renew ?? false);
        }

        // Fetch payment history
        const { data: paymentData } = await supabase
          .from('transactions')
          .select('*')
          .eq('from_user_id', userId)
          .eq('type', 'debit')
          .order('created_at', { ascending: false })
          .limit(20);

        if (!cancelled && paymentData && paymentData.length > 0) {
          setPayments(paymentData.map((p) => ({
            id: p.id,
            date: p.created_at,
            description: p.description || (language === 'ur' ? 'پیمنٹ' : 'Payment'),
            amount: p.amount,
            status: p.status,
          })));
        } else if (!cancelled) {
          setPayments(mockPayments);
        }

        // Fetch invoices
        const { data: invoiceData } = await supabase
          .from('invoices')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10);

        if (!cancelled && invoiceData && invoiceData.length > 0) {
          setInvoices(invoiceData.map((inv) => ({
            id: inv.id,
            invoice_number: inv.invoice_number || `INV-${inv.id.slice(0, 8)}`,
            date: inv.created_at,
            amount: inv.amount || 0,
            status: inv.status || 'paid',
            description: inv.description || (language === 'ur' ? 'انوائس' : 'Invoice'),
          })));
        } else if (!cancelled) {
          setInvoices(mockInvoices);
        }
      } catch {
        if (!cancelled) {
          setPayments(mockPayments);
          setInvoices(mockInvoices);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => { cancelled = true; };
  }, [employerProfile?.user_id, language]);

  // Text helper
  const txt = (en: string, ur: string) => language === 'ur' ? ur : en;

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="glass-card p-8">
          <div className="skeleton h-4 w-40 mb-3" />
          <div className="skeleton h-6 w-60" />
        </div>
        <div className="glass-card p-8">
          <div className="skeleton h-5 w-32 mb-4" />
          <div className="skeleton h-20 w-full mb-4" />
          <div className="skeleton h-10 w-40" />
        </div>
        <div className="glass-card p-8">
          <div className="skeleton h-5 w-32 mb-4" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20 border border-blue-500/20">
              <CreditCard className="w-5 h-5 lg:w-6 lg:h-6 text-blue-400" />
            </div>
            {txt('Billing & Subscription', 'بلنگ اور سبسکرپشن')}
          </h1>
          <p className="text-white/50 mt-2 text-sm lg:text-base">
            {txt('Manage your plan, payments, and invoices', 'اپنا پلان، پیمنٹس اور انوائس مینیج کریں')}
          </p>
        </div>
        <Link
          href="/pricing"
          className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/20 transition-all text-sm font-semibold"
        >
          <Crown className="w-4 h-4" />
          {txt('View Plans', 'پلان دیکھیں')}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Mobile View Plans Button */}
      <Link
        href="/pricing"
        className="sm:hidden flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/20 transition-all text-sm font-semibold min-h-[44px]"
      >
        <Crown className="w-4 h-4" />
        {txt('View Plans', 'پلان دیکھیں')}
        <ArrowRight className="w-4 h-4" />
      </Link>

      {/* Current Plan Card */}
      <div className={`glass-card p-6 lg:p-8 relative overflow-hidden bg-gradient-to-br ${getPlanGradient(subscription.plan_name)}`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.02] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              {getPlanIcon(subscription.plan_name)}
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider font-medium">
                  {txt('Current Plan', 'موجودہ پلان')}
                </p>
                <h2 className="text-xl lg:text-2xl font-bold text-white">
                  {subscription.plan_name === 'Free'
                    ? txt('Free Plan', 'مفت پلان')
                    : subscription.plan_name === 'Basic'
                      ? txt('Basic Plan', 'بنیادی پلان')
                      : txt('Premium Plan', 'پریمیئم پلان')}
                </h2>
              </div>
            </div>
            <div className="text-right sm:text-right">
              <p className={`text-2xl lg:text-3xl font-bold ${getPlanAccent(subscription.plan_name)}`}>
                {subscription.price === 0
                  ? txt('Free', 'مفت')
                  : formatCurrency(subscription.price)}
              </p>
              {subscription.price > 0 && (
                <p className="text-xs text-white/40">{txt('/month', '/ماہ')}</p>
              )}
            </div>
          </div>

          {/* Subscription Status */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className={`badge text-xs ${getStatusColor(subscription.status)}`}>
              {subscription.status === 'active'
                ? (txt('Active', 'فعال'))
                : txt(subscription.status, subscription.status)}
            </span>
            {subscription.current_period_end && (
              <div className="flex items-center gap-1.5 text-xs text-white/40">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {txt('Renews on', 'تجدید')} {formatDate(subscription.current_period_end)}
                </span>
              </div>
            )}
          </div>

          {/* Usage Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-white/60 font-medium">
                {txt('Job Posts Usage', 'جاب پوسٹس کا استعمال')}
              </p>
              <p className="text-sm font-semibold text-white">
                {subscription.jobs_used} / {subscription.jobs_limit === -1 ? txt('Unlimited', 'نہ محدود') : subscription.jobs_limit}
              </p>
            </div>
            <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${usageBarColor}`}
                style={{ width: `${subscription.jobs_limit === -1 ? 10 : usagePercentage}%` }}
              />
            </div>
            {usagePercentage >= 80 && subscription.jobs_limit !== -1 && (
              <div className="flex items-center gap-1.5 mt-2">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <p className="text-xs text-amber-400">
                  {usagePercentage >= 100
                    ? txt('You have reached your job post limit. Upgrade for more!', 'آپ نے جاب پوسٹ کی حد پہنچ گئے ہیں۔ مزید کے لیے اپگریڈ کریں!')
                    : txt('You are approaching your job post limit.', 'آپ جاب پوسٹ کی حد کے قریب ہیں۔')}
                </p>
              </div>
            )}
          </div>

          {/* Plan Features */}
          <div className="mb-6">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-3 font-medium">
              {txt('Plan Includes', 'پلان میں شامل ہے')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(currentPlanFeatures[subscription.plan_name] || currentPlanFeatures.Free).map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-sm text-white/70">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upgrade Button */}
          {subscription.plan_name === 'Free' && (
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-400 hover:from-amber-500/30 hover:to-amber-600/20 border border-amber-500/20 transition-all text-sm font-semibold min-h-[44px]"
            >
              <Zap className="w-4 h-4" />
              {txt('Upgrade Plan', 'پلان اپگریڈ کریں')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
          {subscription.plan_name === 'Basic' && (
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-400 hover:from-amber-500/30 hover:to-amber-600/20 border border-amber-500/20 transition-all text-sm font-semibold min-h-[44px]"
            >
              <Crown className="w-4 h-4" />
              {txt('Upgrade to Premium', 'پریمیئم میں اپگریڈ کریں')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Two Column Grid: Payment History + Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment History */}
        <div className="glass-card p-4 lg:p-6">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">
              {txt('Payment History', 'پیمنٹ کی تاریخ')}
            </h2>
          </div>

          {payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Receipt className="w-12 h-12 text-white/20 mb-3" />
              <p className="text-white/40 text-sm">
                {txt('No payment history yet', 'ابھی تک کوئی پیمنٹ کی تاریخ نہیں')}
              </p>
              <p className="text-white/20 text-xs mt-1">
                {txt('Your past payments will appear here', 'آپ کے پرانے پیمنٹ یہاں دکھائی دیں گے')}
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
              {/* Desktop Table Header */}
              <div className="hidden sm:grid grid-cols-12 gap-2 px-3 py-2 text-xs text-white/30 uppercase tracking-wider font-medium">
                <div className="col-span-4">{txt('Description', 'تفصیل')}</div>
                <div className="col-span-3">{txt('Date', 'تاریخ')}</div>
                <div className="col-span-3 text-right">{txt('Amount', 'رقم')}</div>
                <div className="col-span-2 text-right">{txt('Status', 'حالت')}</div>
              </div>
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-2 p-3 rounded-xl hover:bg-white/[0.03] transition-all"
                >
                  <div className="sm:col-span-4">
                    <p className="text-xs lg:text-sm font-medium text-white truncate">{payment.description}</p>
                  </div>
                  <div className="sm:col-span-3">
                    <p className="text-xs text-white/40">{formatDate(payment.date)}</p>
                  </div>
                  <div className="sm:col-span-3 sm:text-right">
                    <p className="text-xs lg:text-sm font-semibold text-white">{formatCurrency(payment.amount)}</p>
                  </div>
                  <div className="sm:col-span-2 sm:text-right">
                    <span className={`badge text-[10px] ${getStatusColor(payment.status)}`}>
                      {payment.status === 'completed'
                        ? (txt('Paid', 'ادا شدہ'))
                        : payment.status === 'pending'
                          ? (txt('Pending', 'زیر التوثیق'))
                          : txt(payment.status, payment.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Invoice Section */}
        <div className="glass-card p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-semibold text-white">
                {txt('Invoices', 'انوائسز')}
              </h2>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/80 transition-all text-xs font-medium min-h-[36px]">
              <Download className="w-3.5 h-3.5" />
              {txt('Download All', 'سب ڈاؤنلوڈ')}
            </button>
          </div>

          {invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="w-12 h-12 text-white/20 mb-3" />
              <p className="text-white/40 text-sm">
                {txt('No invoices yet', 'ابھی تک کوئی انوائس نہیں')}
              </p>
              <p className="text-white/20 text-xs mt-1">
                {txt('Invoices will be generated after your first payment', 'آپ کے پہلے پیمنٹ کے بعد انوائس بنائی جائیں گی')}
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-all"
                >
                  <div className="p-2.5 rounded-lg bg-blue-500/10 shrink-0">
                    <Receipt className="w-4 h-4 lg:w-5 lg:h-5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs lg:text-sm font-medium text-white truncate">
                      {invoice.description}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-white/30 font-mono">{invoice.invoice_number}</p>
                      <span className="text-white/10">|</span>
                      <p className="text-xs text-white/30">{formatDate(invoice.date)}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex items-center gap-3">
                    <p className="text-xs lg:text-sm font-semibold text-white">
                      {formatCurrency(invoice.amount)}
                    </p>
                    <button
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/60 transition-all min-w-[36px] min-h-[36px] flex items-center justify-center"
                      title={txt('Download Invoice', 'انوائس ڈاؤنلوڈ')}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Billing Info Section */}
      <div className="glass-card p-4 lg:p-6">
        <div className="flex items-center gap-2 mb-6">
          <CreditCard className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">
            {txt('Billing Information', 'بلنگ کی معلومات')}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Payment Method */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <CreditCard className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-xs text-white/40 uppercase tracking-wider font-medium">
                {txt('Payment Method', 'پیمنٹ کا طریقہ')}
              </p>
            </div>
            <p className="text-sm font-medium text-white">
              {subscription.payment_method
                ? subscription.payment_method
                : txt('No payment method on file', 'کوئی پیمنٹ طریقہ محفوظ نہیں')}
            </p>
            {subscription.plan_name === 'Free' && (
              <p className="text-xs text-white/30 mt-1">
                {txt('Add a payment method to upgrade', 'اپگریڈ کے لیے پیمنٹ کا طریقہ شامل کریں')}
              </p>
            )}
          </div>

          {/* Next Billing Date */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Calendar className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xs text-white/40 uppercase tracking-wider font-medium">
                {txt('Next Billing Date', 'اگلی بلنگ کی تاریخ')}
              </p>
            </div>
            <p className="text-sm font-medium text-white">
              {subscription.current_period_end
                ? formatDate(subscription.current_period_end)
                : txt('N/A (Free Plan)', 'N/A (مفت پلان)')}
            </p>
            {subscription.price > 0 && (
              <p className="text-xs text-white/30 mt-1">
                {txt(`Next charge: ${formatCurrency(subscription.price)}`, `اگلا چارج: ${formatCurrency(subscription.price)}`)}
              </p>
            )}
          </div>

          {/* Auto-Renewal Toggle */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <RefreshCcw className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-xs text-white/40 uppercase tracking-wider font-medium">
                {txt('Auto-Renewal', 'خودکار تجدید')}
              </p>
            </div>
            {subscription.plan_name === 'Free' ? (
              <p className="text-sm text-white/40">
                {txt('Not applicable for Free plan', 'مفت پلان کے لیے لاگو نہیں')}
              </p>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-sm text-white">
                  {autoRenew
                    ? txt('Enabled', 'فعال')
                    : txt('Disabled', 'غیر فعال')}
                </p>
                <button
                  onClick={() => setAutoRenew(!autoRenew)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors min-h-[44px] min-w-[44px] ${
                    autoRenew ? 'bg-emerald-500' : 'bg-white/10'
                  }`}
                  aria-label={txt('Toggle auto-renewal', 'خودکار تجدید تبدیل کریں')}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      autoRenew ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            )}
            {autoRenew && subscription.price > 0 && (
              <p className="text-xs text-white/30 mt-1">
                {txt('Your plan will renew automatically', 'آپ کا پلان خودکار طور پر تجدید ہوگا')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions / Help */}
      <div className="glass-card p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2.5 rounded-xl bg-white/5">
              <AlertCircle className="w-5 h-5 text-white/40" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                {txt('Need help with billing?', 'بلنگ میں مدد چاہیے؟')}
              </p>
              <p className="text-xs text-white/40">
                {txt('Contact our support team for billing questions or disputes.', 'بلنگ کے سوالات یا تنازعات کے لیے ہماری سپورٹ ٹیم سے رابطہ کریں۔')}
              </p>
            </div>
          </div>
          <Link
            href="/employer/chat"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all text-sm font-medium min-h-[44px] shrink-0"
          >
            <Receipt className="w-4 h-4" />
            {txt('Contact Support', 'سپورٹ سے رابطہ')}
          </Link>
        </div>
      </div>
    </div>
  );
}
