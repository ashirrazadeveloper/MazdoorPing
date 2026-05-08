'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { useLanguageStore } from '@/store/language-store';
import {
  Building,
  ToggleLeft,
  CreditCard,
  Crown,
  Zap,
  Gift,
  FileCheck,
  Megaphone,
  Save,
  Send,
  Loader2,
  CheckCircle2,
  Briefcase,
  Search,
  ClipboardList,
  MessageSquare,
  Bot,
  Wallet,
  UserCircle,
  Bell,
  Heart,
  AlertTriangle,
  Pencil,
  X,
  Check,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────
interface PlatformSetting {
  id?: string;
  key: string;
  value: string;
  category: string;
  updated_at?: string;
}

interface SubscriptionPlan {
  id?: string;
  name: string;
  price: number;
  job_limit: number;
  features: Record<string, boolean>;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface Toast {
  message: string;
  type: 'success' | 'error';
}

// ── Feature definitions ────────────────────────────────
const EMPLOYER_FEATURES = [
  { key: 'employer_feature_post_job', labelEn: 'Post Job', labelUr: 'ملازمت پوسٹ کریں', icon: Briefcase, defaultOn: true },
  { key: 'employer_feature_find_workers', labelEn: 'Find Workers', labelUr: 'مزدور تلاش کریں', icon: Search, defaultOn: true },
  { key: 'employer_feature_my_bookings', labelEn: 'My Bookings', labelUr: 'میری بکنگز', icon: ClipboardList, defaultOn: true },
  { key: 'employer_feature_chat', labelEn: 'Chat', labelUr: 'چیٹ', icon: MessageSquare, defaultOn: true },
  { key: 'employer_feature_worker_availability', labelEn: 'Worker Availability', labelUr: 'مزدور کی دسترسی', icon: Zap, defaultOn: true },
  { key: 'employer_feature_ai_assistant', labelEn: 'AI Assistant', labelUr: 'AI اسسٹنٹ', icon: Bot, defaultOn: false },
  { key: 'employer_feature_wallet', labelEn: 'Wallet', labelUr: 'بٹوا', icon: Wallet, defaultOn: true },
  { key: 'employer_feature_profile', labelEn: 'Profile', labelUr: 'پروفائل', icon: UserCircle, defaultOn: true },
  { key: 'employer_feature_notifications', labelEn: 'Notifications', labelUr: 'اطلاعات', icon: Bell, defaultOn: true },
  { key: 'employer_feature_favorites', labelEn: 'Favorites', labelUr: 'پسندیدہ', icon: Heart, defaultOn: true },
] as const;

const DOCUMENT_REQUIREMENTS = [
  { key: 'employer_doc_cnic', labelEn: 'CNIC', labelUr: 'شناختی کارڈ' },
  { key: 'employer_doc_business_registration', labelEn: 'Business Registration', labelUr: 'کاروباری رجسٹریشن' },
  { key: 'employer_doc_tax_certificate', labelEn: 'Tax Certificate', labelUr: 'ٹیکس سرٹیفکیٹ' },
  { key: 'employer_doc_utility_bill', labelEn: 'Utility Bill', labelUr: 'بل دیکھیں' },
] as const;

// Plan feature definitions
const PLAN_FEATURES = [
  { key: 'featured_listings', labelEn: 'Featured Listings', labelUr: 'خصوصی فہرستیں' },
  { key: 'priority_support', labelEn: 'Priority Support', labelUr: 'ترجیحی سپورٹ' },
  { key: 'analytics', labelEn: 'Analytics', labelUr: 'تجزیات' },
  { key: 'dedicated_support', labelEn: 'Dedicated Support', labelUr: 'خصوصی سپورٹ' },
] as const;

// Default subscription plans
const DEFAULT_PLANS: SubscriptionPlan[] = [
  {
    id: undefined,
    name: 'Free',
    price: 0,
    job_limit: 3,
    features: { featured_listings: false, priority_support: false, analytics: false, dedicated_support: false },
    is_active: true,
  },
  {
    id: undefined,
    name: 'Basic',
    price: 2999,
    job_limit: 20,
    features: { featured_listings: true, priority_support: true, analytics: false, dedicated_support: false },
    is_active: true,
  },
  {
    id: undefined,
    name: 'Premium',
    price: 7999,
    job_limit: -1, // unlimited
    features: { featured_listings: true, priority_support: true, analytics: true, dedicated_support: true },
    is_active: true,
  },
];

// ── Default values ─────────────────────────────────────
const DEFAULTS: Record<string, string> = {
  ...Object.fromEntries(EMPLOYER_FEATURES.map((f) => [f.key, f.defaultOn ? 'true' : 'false'])),
  ...Object.fromEntries(DOCUMENT_REQUIREMENTS.map((d) => [d.key, 'false'])),
};

// ── Component ──────────────────────────────────────────
export default function EmployerManagementPage() {
  const { language, t } = useLanguageStore();
  const isUrdu = language === 'ur';

  const [settingsMap, setSettingsMap] = useState<Record<string, string>>({ ...DEFAULTS });
  const [originalMap, setOriginalMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Subscription plans state
  const [plans, setPlans] = useState<SubscriptionPlan[]>(JSON.parse(JSON.stringify(DEFAULT_PLANS)));
  const [originalPlans, setOriginalPlans] = useState<SubscriptionPlan[]>([]);
  const [editingPlan, setEditingPlan] = useState<number | null>(null);
  const [savingPlan, setSavingPlan] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<SubscriptionPlan | null>(null);

  // Announcement state
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false);

  // Toast
  const [toast, setToast] = useState<Toast | null>(null);
  const showToast = (message: string, type: Toast['type']) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Fetch settings ───────────────────────────────────
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*');

      if (error) throw error;

      const map: Record<string, string> = { ...DEFAULTS };
      if (data && Array.isArray(data)) {
        (data as PlatformSetting[]).forEach((s) => {
          map[s.key] = s.value;
        });
      }

      setSettingsMap(map);
      setOriginalMap({ ...map });
    } catch (err) {
      console.error('Failed to fetch employer settings:', err);
      setSettingsMap({ ...DEFAULTS });
      setOriginalMap({ ...DEFAULTS });
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch subscription plans ─────────────────────────
  const fetchPlans = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const fetched = data.map((p: Record<string, unknown>) => ({
          id: p.id as string,
          name: p.name as string,
          price: Number(p.price),
          job_limit: Number(p.job_limit),
          features: (typeof p.features === 'string' ? JSON.parse(p.features) : p.features) as Record<string, boolean>,
          is_active: p.is_active as boolean,
        }));
        setPlans(fetched);
        setOriginalPlans(JSON.parse(JSON.stringify(fetched)));
      } else {
        setPlans(JSON.parse(JSON.stringify(DEFAULT_PLANS)));
        setOriginalPlans(JSON.parse(JSON.stringify(DEFAULT_PLANS)));
      }
    } catch (err) {
      console.error('Failed to fetch subscription plans:', err);
      setPlans(JSON.parse(JSON.stringify(DEFAULT_PLANS)));
      setOriginalPlans(JSON.parse(JSON.stringify(DEFAULT_PLANS)));
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    fetchPlans();
  }, [fetchSettings, fetchPlans]);

  // ── Save all settings ────────────────────────────────
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const settings = Object.entries(settingsMap).map(([key, value]) => ({ key, value }));

      const res = await fetch('/api/admin/platform-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings, category: 'employer' }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(errData.error || 'Save failed');
      }

      setOriginalMap({ ...settingsMap });
      showToast(isUrdu ? 'ترتیبات محفوظ ہو گئیں' : 'Settings saved successfully', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to save settings:', msg);
      showToast(isUrdu ? 'محفوظ نہ ہو سکی' : `Failed to save: ${msg.slice(0, 60)}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Save a subscription plan ─────────────────────────
  const handleSavePlan = async (index: number) => {
    if (!editDraft) return;

    setSavingPlan(index);
    try {
      const plan = plans[index];
      const planToSave = { ...plan, ...editDraft };

      const row = {
        name: planToSave.name,
        price: planToSave.price,
        job_limit: planToSave.job_limit,
        features: planToSave.features,
        is_active: planToSave.is_active,
      };

      let error;
      if (plan.id) {
        const result = await fetch('/api/admin/subscription-plans', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: plan.id, ...row }),
        });
        if (!result.ok) {
          const errData = await result.json().catch(() => ({ error: 'Update failed' }));
          throw new Error(errData.error || 'Update failed');
        }
      } else {
        const result = await supabase
          .from('subscription_plans')
          .insert(row);
        error = result.error;
      }

      if (error) throw error;

      // Update local state
      const updatedPlans = [...plans];
      updatedPlans[index] = planToSave;
      setPlans(updatedPlans);
      setOriginalPlans(JSON.parse(JSON.stringify(updatedPlans)));
      setEditingPlan(null);
      setEditDraft(null);

      showToast(
        isUrdu ? `${plan.name} پلان محفوظ ہو گیا` : `${plan.name} plan saved`,
        'success'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to save plan:', msg);
      showToast(isUrdu ? 'پلان محفوظ نہ ہو سکا' : `Failed: ${msg.slice(0, 60)}`, 'error');
    } finally {
      setSavingPlan(null);
    }
  };

  // ── Send announcement ────────────────────────────────
  const handleSendAnnouncement = async () => {
    if (!announcementTitle.trim() || !announcementMessage.trim()) return;

    setSendingAnnouncement(true);
    try {
      const { data: employerProfiles, error: profileErr } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'employer')
        .eq('is_approved', true);

      if (profileErr) throw profileErr;

      if (!employerProfiles || employerProfiles.length === 0) {
        showToast(isUrdu ? 'کوئی مقصد کار نہیں ملا' : 'No active employers found', 'error');
        return;
      }

      const notifications = employerProfiles.map((p) => ({
        user_id: p.id,
        type: 'announcement',
        title: announcementTitle.trim(),
        message: announcementMessage.trim(),
        data: { source: 'employer_announcement' },
        is_read: false,
      }));

      const { error: notifErr } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notifErr) throw notifErr;

      showToast(
        isUrdu
          ? `${employerProfiles.length} مقصد کاروں کو اعلان بھیجا گیا`
          : `Announcement sent to ${employerProfiles.length} employers`,
        'success'
      );
      setAnnouncementTitle('');
      setAnnouncementMessage('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to send announcement:', msg);
      showToast(isUrdu ? 'اعلان بھیجنا ناکام' : `Failed: ${msg.slice(0, 60)}`, 'error');
    } finally {
      setSendingAnnouncement(false);
    }
  };

  // ── Helpers ──────────────────────────────────────────
  const updateSetting = (key: string, value: string) => {
    setSettingsMap((prev) => ({ ...prev, [key]: value }));
  };

  const hasChanges = Object.keys(DEFAULTS).some(
    (key) => settingsMap[key] !== (originalMap[key] ?? DEFAULTS[key])
  );

  const hasPlanChanges = plans.some((plan, i) => {
    const orig = originalPlans[i];
    if (!orig) return true;
    return (
      plan.name !== orig.name ||
      plan.price !== orig.price ||
      plan.job_limit !== orig.job_limit ||
      JSON.stringify(plan.features) !== JSON.stringify(orig.features) ||
      plan.is_active !== orig.is_active
    );
  });

  const ToggleSwitch = ({
    value,
    onChange,
  }: {
    value: boolean;
    onChange: (v: boolean) => void;
  }) => (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={cn(
        'w-11 h-6 rounded-full relative transition-colors duration-200 shrink-0',
        value ? 'bg-emerald-500/40' : 'bg-white/10'
      )}
    >
      <div
        className={cn(
          'absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200',
          value ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  );

  // Plan styling
  const PLAN_STYLES = [
    { accent: 'slate', border: 'border-slate-500/20', bg: 'bg-slate-500/5', icon: Gift, badge: 'text-slate-400 bg-slate-500/15' },
    { accent: 'blue', border: 'border-blue-500/20', bg: 'bg-blue-500/5', icon: Zap, badge: 'text-blue-400 bg-blue-500/15' },
    { accent: 'amber', border: 'border-amber-500/20', bg: 'bg-amber-500/5', icon: Crown, badge: 'text-amber-400 bg-amber-500/15' },
  ] as const;

  // ── Render: Loading ──────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="skeleton h-10 w-64 mb-2" />
        <div className="skeleton h-4 w-80" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="glass-card p-6">
            <div className="skeleton h-5 w-40 mb-2" />
            <div className="skeleton h-3 w-56 mb-4" />
            <div className="space-y-3">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="flex justify-between">
                  <div className="skeleton h-4 w-36" />
                  <div className="skeleton h-6 w-11 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── Render: Page ─────────────────────────────────────
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast */}
      {toast && (
        <div
          className={cn(
            'fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg animate-fade-in flex items-center gap-2',
            toast.type === 'success' ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'
          )}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10">
              <Building className="w-7 h-7 text-blue-400" />
            </div>
            {isUrdu ? 'مقصد کار ایپ کا انتظام' : 'Employer App Management'}
          </h1>
          <p className="text-white/50 mt-1">
            {isUrdu ? 'مقصد کار ایپ کی تمام خصوصیات اور ترتیبات کا انتظام کریں' : 'Manage all employer app features and settings'}
          </p>
        </div>
        <button
          onClick={handleSaveAll}
          disabled={saving || !hasChanges}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px]',
            hasChanges
              ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20'
              : 'bg-white/5 text-white/30 border border-white/5 cursor-not-allowed'
          )}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? (isUrdu ? 'محفوظ ہو رہا ہے...' : 'Saving...') : (isUrdu ? 'محفوظ کریں' : 'Save Settings')}
        </button>
      </div>

      {/* ── 1. Feature Toggles ──────────────────────────── */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
            <ToggleLeft className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              {isUrdu ? 'خصوصیات' : 'Feature Toggles'}
            </h2>
            <p className="text-xs text-white/40">
              {isUrdu ? 'مقصد کار ایپ کی خصوصیات کو فعال یا غیر فعال کریں' : 'Enable or disable employer app features'}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {EMPLOYER_FEATURES.map((feature) => {
            const Icon = feature.icon;
            const isOn = settingsMap[feature.key] === 'true';
            return (
              <div
                key={feature.key}
                className={cn(
                  'flex items-center gap-3 p-3.5 rounded-xl border transition-all',
                  isOn
                    ? 'bg-emerald-500/5 border-emerald-500/15'
                    : 'bg-white/[0.02] border-white/5'
                )}
              >
                <div className={cn(
                  'p-2 rounded-lg shrink-0',
                  isOn ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-white/30'
                )}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-sm font-medium truncate',
                    isOn ? 'text-white' : 'text-white/40'
                  )}>
                    {isUrdu ? feature.labelUr : feature.labelEn}
                  </p>
                </div>
                <ToggleSwitch
                  value={isOn}
                  onChange={(v) => updateSetting(feature.key, String(v))}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 2. Subscription Plans ────────────────────────── */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              {isUrdu ? 'سبسکرپشن پلانز' : 'Subscription Plans'}
            </h2>
            <p className="text-xs text-white/40">
              {isUrdu ? 'پلانز کی قیمت، حد، اور خصوصیات کا انتظام کریں' : 'Manage plan pricing, limits, and features'}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan, index) => {
            const style = PLAN_STYLES[index] || PLAN_STYLES[0];
            const PlanIcon = style.icon;
            const isEditing = editingPlan === index;
            const isSavingThis = savingPlan === index;

            return (
              <div
                key={plan.name}
                className={cn(
                  'rounded-xl border p-5 transition-all relative',
                  style.border,
                  style.bg,
                  !plan.is_active && 'opacity-50'
                )}
              >
                {/* Plan header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <PlanIcon className="w-5 h-5 text-amber-400" />
                    {isEditing && editDraft ? (
                      <input
                        type="text"
                        value={editDraft.name}
                        onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })}
                        className="text-lg font-bold text-white bg-white/10 rounded-lg px-2 py-0.5 focus:outline-none w-24"
                      />
                    ) : (
                      <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {!isEditing ? (
                      <button
                        onClick={() => {
                          setEditingPlan(index);
                          setEditDraft({ ...plan, features: { ...plan.features } });
                        }}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingPlan(null);
                            setEditDraft(null);
                          }}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-red-400 transition-all"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleSavePlan(index)}
                          disabled={isSavingThis}
                          className="p-1.5 rounded-lg hover:bg-emerald-500/20 text-emerald-400 transition-all disabled:opacity-50"
                        >
                          {isSavingThis ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="mb-4">
                  {isEditing && editDraft ? (
                    <div className="flex items-center gap-1">
                      <span className="text-white/40 text-sm">Rs.</span>
                      <input
                        type="number"
                        value={editDraft.price}
                        onChange={(e) => setEditDraft({ ...editDraft, price: Number(e.target.value) })}
                        min={0}
                        className="text-2xl font-bold text-white bg-white/10 rounded-lg px-2 py-0.5 focus:outline-none w-28"
                      />
                      <span className="text-white/40 text-sm">/mo</span>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold text-white">
                      {plan.price === 0
                        ? (isUrdu ? 'مفت' : 'Free')
                        : `Rs. ${plan.price.toLocaleString()}`}
                      <span className="text-sm font-normal text-white/40">/mo</span>
                    </p>
                  )}
                </div>

                {/* Job Limit */}
                <div className="mb-4 p-3 rounded-lg bg-white/[0.03] border border-white/5">
                  <p className="text-xs text-white/40 mb-1">
                    {isUrdu ? 'ملازمت کی حد' : 'Job Limit'}
                  </p>
                  {isEditing && editDraft ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={editDraft.job_limit === -1 ? '' : editDraft.job_limit}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditDraft({
                            ...editDraft,
                            job_limit: val === '' || val === '-1' ? -1 : Number(val),
                          });
                        }}
                        min={-1}
                        placeholder={isUrdu ? 'غیر محدود کے لیے -1' : '-1 for unlimited'}
                        className="text-sm font-medium text-white bg-white/10 rounded-lg px-2 py-1 focus:outline-none w-20"
                      />
                      <span className="text-xs text-white/30">
                        {editDraft.job_limit === -1
                          ? (isUrdu ? 'غیر محدود' : 'Unlimited')
                          : (isUrdu ? 'ملازمتیں/ماہ' : 'jobs/mo')}
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-white">
                      {plan.job_limit === -1
                        ? (isUrdu ? 'غیر محدود ملازمتیں' : 'Unlimited Jobs')
                        : `${plan.job_limit} ${isUrdu ? 'ملازمتیں/ماہ' : 'jobs/mo'}`}
                    </p>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-2.5">
                  {PLAN_FEATURES.map((feat) => {
                    const isOn = plan.features[feat.key] ?? false;
                    const isOnDraft = editDraft?.features[feat.key] ?? false;

                    if (isEditing && editDraft) {
                      return (
                        <div key={feat.key} className="flex items-center justify-between">
                          <span className={cn(
                            'text-xs font-medium',
                            isOnDraft ? 'text-white/80' : 'text-white/30'
                          )}>
                            {isUrdu ? feat.labelUr : feat.labelEn}
                          </span>
                          <ToggleSwitch
                            value={isOnDraft}
                            onChange={(v) => {
                              setEditDraft({
                                ...editDraft,
                                features: { ...editDraft.features, [feat.key]: v },
                              });
                            }}
                          />
                        </div>
                      );
                    }

                    return (
                      <div key={feat.key} className="flex items-center justify-between">
                        <span className={cn(
                          'text-xs font-medium',
                          isOn ? 'text-white/80' : 'text-white/30'
                        )}>
                          {isUrdu ? feat.labelUr : feat.labelEn}
                        </span>
                        {isOn ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-white/15" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Active toggle */}
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs text-white/40">
                    {isUrdu ? 'فعال' : 'Active'}
                  </span>
                  {isEditing && editDraft ? (
                    <ToggleSwitch
                      value={editDraft.is_active}
                      onChange={(v) => setEditDraft({ ...editDraft, is_active: v })}
                    />
                  ) : (
                    <div className={cn(
                      'w-2.5 h-2.5 rounded-full',
                      plan.is_active ? 'bg-emerald-400' : 'bg-white/20'
                    )} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3. Document Requirements ─────────────────────── */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              {isUrdu ? 'دستاویز کی ضروریات' : 'Document Requirements'}
            </h2>
            <p className="text-xs text-white/40">
              {isUrdu ? 'رجسٹریشن کے لیے ضروری دستاویزات' : 'Required documents during registration'}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DOCUMENT_REQUIREMENTS.map((doc) => {
            const isOn = settingsMap[doc.key] === 'true';
            return (
              <div
                key={doc.key}
                className={cn(
                  'flex items-center justify-between p-4 rounded-xl border transition-all',
                  isOn
                    ? 'bg-cyan-500/5 border-cyan-500/15'
                    : 'bg-white/[0.02] border-white/5'
                )}
              >
                <span className={cn(
                  'text-sm font-medium',
                  isOn ? 'text-white' : 'text-white/40'
                )}>
                  {isUrdu ? doc.labelUr : doc.labelEn}
                </span>
                <ToggleSwitch
                  value={isOn}
                  onChange={(v) => updateSetting(doc.key, String(v))}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 4. Announcements ─────────────────────────────── */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              {isUrdu ? 'اعلانات' : 'Announcements'}
            </h2>
            <p className="text-xs text-white/40">
              {isUrdu ? 'تمام مقصد کاروں کو اعلان بھیجیں' : 'Send announcements to all employers'}
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="text-sm text-white/60 block mb-2">
              {isUrdu ? 'عنوان' : 'Title'}
            </label>
            <input
              type="text"
              value={announcementTitle}
              onChange={(e) => setAnnouncementTitle(e.target.value)}
              placeholder={isUrdu ? 'اعلان کا عنوان لکھیں...' : 'Enter announcement title...'}
              className="w-full px-4 py-2.5 rounded-lg glass-input text-white text-sm placeholder:text-white/25 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-white/60 block mb-2">
              {isUrdu ? 'پیغام' : 'Message'}
            </label>
            <textarea
              value={announcementMessage}
              onChange={(e) => setAnnouncementMessage(e.target.value)}
              placeholder={isUrdu ? 'اعلان کا پیغام لکھیں...' : 'Enter announcement message...'}
              rows={4}
              className="w-full px-4 py-3 rounded-lg glass-input text-white text-sm placeholder:text-white/25 focus:outline-none resize-none"
            />
          </div>
          <button
            onClick={handleSendAnnouncement}
            disabled={sendingAnnouncement || !announcementTitle.trim() || !announcementMessage.trim()}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px]',
              announcementTitle.trim() && announcementMessage.trim()
                ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border border-orange-500/20'
                : 'bg-white/5 text-white/30 border border-white/5 cursor-not-allowed'
            )}
          >
            {sendingAnnouncement ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {sendingAnnouncement
              ? (isUrdu ? 'بھیجا جا رہا ہے...' : 'Sending...')
              : (isUrdu ? 'تمام مقصد کاروں کو بھیجیں' : 'Send to All Employers')}
          </button>
        </div>
      </div>
    </div>
  );
}
