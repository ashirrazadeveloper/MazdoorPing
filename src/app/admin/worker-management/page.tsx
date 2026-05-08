'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { useLanguageStore } from '@/store/language-store';
import {
  Wrench,
  ToggleLeft,
  DollarSign,
  CreditCard,
  ShieldCheck,
  Megaphone,
  Save,
  Send,
  Loader2,
  CheckCircle2,
  Briefcase,
  MapPin,
  FolderOpen,
  Star,
  MessageSquare,
  Wallet,
  BarChart3,
  UserCircle,
  Award,
  FileText,
  Clock,
  ThumbsUp,
  AlertTriangle,
  Bot,
  Bell,
  Settings2,
  Calculator,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────
interface PlatformSetting {
  id?: string;
  key: string;
  value: string;
  category: string;
  updated_at?: string;
}

interface Toast {
  message: string;
  type: 'success' | 'error';
}

// ── Feature definitions ────────────────────────────────
const WORKER_FEATURES = [
  { key: 'worker_feature_browse_jobs', labelEn: 'Browse Jobs', labelUr: 'ملازمتیں دیکھیں', icon: Briefcase, defaultOn: true },
  { key: 'worker_feature_nearby_jobs', labelEn: 'Nearby Jobs', labelUr: 'قریبی ملازمتیں', icon: MapPin, defaultOn: true },
  { key: 'worker_feature_my_jobs', labelEn: 'My Jobs', labelUr: 'میری ملازمتیں', icon: FolderOpen, defaultOn: true },
  { key: 'worker_feature_recommendations', labelEn: 'Recommendations', labelUr: 'تجاویز', icon: Star, defaultOn: true },
  { key: 'worker_feature_chat', labelEn: 'Chat', labelUr: 'چیٹ', icon: MessageSquare, defaultOn: true },
  { key: 'worker_feature_wallet', labelEn: 'Wallet', labelUr: 'بٹوا', icon: Wallet, defaultOn: true },
  { key: 'worker_feature_analytics', labelEn: 'Analytics', labelUr: 'تجزیات', icon: BarChart3, defaultOn: false },
  { key: 'worker_feature_profile', labelEn: 'Profile', labelUr: 'پروفائل', icon: UserCircle, defaultOn: true },
  { key: 'worker_feature_badges', labelEn: 'Badges', labelUr: 'بیجز', icon: Award, defaultOn: true },
  { key: 'worker_feature_portfolio', labelEn: 'Portfolio', labelUr: 'پورٹ فولیو', icon: FileText, defaultOn: true },
  { key: 'worker_feature_availability', labelEn: 'Availability', labelUr: 'دسترسی', icon: Clock, defaultOn: true },
  { key: 'worker_feature_reviews', labelEn: 'Reviews', labelUr: 'جائزے', icon: ThumbsUp, defaultOn: true },
  { key: 'worker_feature_invoices', labelEn: 'Invoices', labelUr: 'انوائس', icon: FileText, defaultOn: true },
  { key: 'worker_feature_sos_alert', labelEn: 'SOS Alert', labelUr: 'ایس او ایس', icon: AlertTriangle, defaultOn: true },
  { key: 'worker_feature_ai_assistant', labelEn: 'AI Assistant', labelUr: 'AI اسسٹنٹ', icon: Bot, defaultOn: false },
  { key: 'worker_feature_notifications', labelEn: 'Notifications', labelUr: 'اطلاعات', icon: Bell, defaultOn: true },
  { key: 'worker_feature_notification_settings', labelEn: 'Notification Settings', labelUr: 'اطلاع کی ترتیبات', icon: Settings2, defaultOn: true },
  { key: 'worker_feature_emi_calculator', labelEn: 'EMI Calculator', labelUr: 'ای ایم آئی کیلکولیٹر', icon: Calculator, defaultOn: false },
] as const;

const PAYMENT_METHODS = [
  { key: 'worker_payment_bank_transfer', labelEn: 'Bank Transfer', labelUr: 'بینک ٹرانسفر' },
  { key: 'worker_payment_jazzcash', labelEn: 'JazzCash', labelUr: 'جاز کیش' },
  { key: 'worker_payment_easypaisa', labelEn: 'EasyPaisa', labelUr: 'ایزی پیسہ' },
] as const;

// ── Default values ─────────────────────────────────────
const DEFAULTS: Record<string, string> = {
  ...Object.fromEntries(WORKER_FEATURES.map((f) => [f.key, f.defaultOn ? 'true' : 'false'])),
  ...Object.fromEntries(PAYMENT_METHODS.map((m) => [m.key, 'true'])),
  worker_fee_registration: '500',
  worker_fee_commission: '10',
  worker_payment_min_withdrawal: '1000',
  worker_verification_cnic_required: 'true',
  worker_verification_auto_approve: 'false',
};

// ── Component ──────────────────────────────────────────
export default function WorkerManagementPage() {
  const { language, t } = useLanguageStore();
  const isUrdu = language === 'ur';

  const [settingsMap, setSettingsMap] = useState<Record<string, string>>({ ...DEFAULTS });
  const [originalMap, setOriginalMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      console.error('Failed to fetch worker settings:', err);
      setSettingsMap({ ...DEFAULTS });
      setOriginalMap({ ...DEFAULTS });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  // ── Save all settings ────────────────────────────────
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const upserts = Object.entries(settingsMap).map(([key, value]) => ({
        key,
        value,
        category: 'worker_management',
      }));

      const { error } = await supabase
        .from('platform_settings')
        .upsert(upserts, { onConflict: 'key' });

      if (error) throw error;

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

  // ── Send announcement ────────────────────────────────
  const handleSendAnnouncement = async () => {
    if (!announcementTitle.trim() || !announcementMessage.trim()) return;

    setSendingAnnouncement(true);
    try {
      // Fetch all worker user IDs
      const { data: workerProfiles, error: profileErr } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'worker')
        .eq('is_approved', true);

      if (profileErr) throw profileErr;

      if (!workerProfiles || workerProfiles.length === 0) {
        showToast(isUrdu ? 'کوئی مزدور نہیں ملا' : 'No active workers found', 'error');
        return;
      }

      const notifications = workerProfiles.map((p) => ({
        user_id: p.id,
        type: 'announcement',
        title: announcementTitle.trim(),
        message: announcementMessage.trim(),
        data: { source: 'worker_announcement' },
        is_read: false,
      }));

      const { error: notifErr } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notifErr) throw notifErr;

      showToast(
        isUrdu
          ? `${workerProfiles.length} مزدوروں کو اعلان بھیجا گیا`
          : `Announcement sent to ${workerProfiles.length} workers`,
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
            <div className="p-2.5 rounded-xl bg-emerald-500/10">
              <Wrench className="w-7 h-7 text-emerald-400" />
            </div>
            {isUrdu ? 'مزدور ایپ کا انتظام' : 'Worker App Management'}
          </h1>
          <p className="text-white/50 mt-1">
            {isUrdu ? 'مزدور ایپ کی تمام خصوصیات اور ترتیبات کا انتظام کریں' : 'Manage all worker app features and settings'}
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
          {saving ? (isUrdu ? 'محفوظ ہو رہا ہے...' : 'Saving...') : (isUrdu ? 'محفوظ کریں' : 'Save All Settings')}
        </button>
      </div>

      {/* ── 1. Platform Feature Toggles ─────────────────── */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
            <ToggleLeft className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              {isUrdu ? 'پلیٹ فارم کی خصوصیات' : 'Platform Features'}
            </h2>
            <p className="text-xs text-white/40">
              {isUrdu ? 'مزدور ایپ کی خصوصیات کو فعال یا غیر فعال کریں' : 'Enable or disable worker app features'}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {WORKER_FEATURES.map((feature) => {
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

      {/* ── 2. Fee Settings ─────────────────────────────── */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              {isUrdu ? 'فیس کی ترتیبات' : 'Fee Settings'}
            </h2>
            <p className="text-xs text-white/40">
              {isUrdu ? 'رجسٹریشن فیس اور کمیشن ریٹ سیٹ کریں' : 'Set registration fee and commission rate'}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Registration Fee */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <label className="text-sm text-white/60 block mb-2">
              {isUrdu ? 'رجسٹریشن فیس (PKR)' : 'Registration Fee (PKR)'}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">Rs.</span>
              <input
                type="number"
                value={settingsMap.worker_fee_registration || '500'}
                onChange={(e) => updateSetting('worker_fee_registration', e.target.value)}
                min={0}
                className="w-full pl-12 pr-4 py-2.5 rounded-lg glass-input text-white text-sm text-right focus:outline-none"
              />
            </div>
            <p className="text-xs text-white/25 mt-1.5">
              {isUrdu ? 'پہلے سے طے شدہ: 500 PKR' : 'Default: 500 PKR'}
            </p>
          </div>

          {/* Commission Rate */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <label className="text-sm text-white/60 block mb-2">
              {isUrdu ? 'کمیشن ریٹ (%)' : 'Commission Rate (%)'}
            </label>
            <div className="relative">
              <input
                type="number"
                value={settingsMap.worker_fee_commission || '10'}
                onChange={(e) => updateSetting('worker_fee_commission', e.target.value)}
                min={0}
                max={100}
                className="w-full px-4 py-2.5 rounded-lg glass-input text-white text-sm text-right focus:outline-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">%</span>
            </div>
            <p className="text-xs text-white/25 mt-1.5">
              {isUrdu ? 'پہلے سے طے شدہ: 10%' : 'Default: 10%'}
            </p>
          </div>
        </div>
      </div>

      {/* ── 3. Payment Settings ─────────────────────────── */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              {isUrdu ? 'ادائیگی کی ترتیبات' : 'Payment Settings'}
            </h2>
            <p className="text-xs text-white/40">
              {isUrdu ? 'کم از کم وصولی اور ادائیگی کے طریقے' : 'Minimum withdrawal and payment methods'}
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {/* Min Withdrawal */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 max-w-sm">
            <label className="text-sm text-white/60 block mb-2">
              {isUrdu ? 'کم سے کم وصولی کی رقم (PKR)' : 'Minimum Withdrawal Amount (PKR)'}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">Rs.</span>
              <input
                type="number"
                value={settingsMap.worker_payment_min_withdrawal || '1000'}
                onChange={(e) => updateSetting('worker_payment_min_withdrawal', e.target.value)}
                min={0}
                className="w-full pl-12 pr-4 py-2.5 rounded-lg glass-input text-white text-sm text-right focus:outline-none"
              />
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <p className="text-sm text-white/50 mb-3">
              {isUrdu ? 'ادائیگی کے طریقے' : 'Payment Methods'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PAYMENT_METHODS.map((method) => {
                const isOn = settingsMap[method.key] === 'true';
                return (
                  <div
                    key={method.key}
                    className={cn(
                      'flex items-center justify-between p-3.5 rounded-xl border transition-all',
                      isOn
                        ? 'bg-purple-500/5 border-purple-500/15'
                        : 'bg-white/[0.02] border-white/5'
                    )}
                  >
                    <span className={cn(
                      'text-sm font-medium',
                      isOn ? 'text-white' : 'text-white/40'
                    )}>
                      {isUrdu ? method.labelUr : method.labelEn}
                    </span>
                    <ToggleSwitch
                      value={isOn}
                      onChange={(v) => updateSetting(method.key, String(v))}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. Worker Verification Settings ─────────────── */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              {isUrdu ? 'توثیق کی ترتیبات' : 'Verification Settings'}
            </h2>
            <p className="text-xs text-white/40">
              {isUrdu ? 'مزدور کی تصدیق کی ضروریات' : 'Worker verification requirements'}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* CNIC Required */}
          <div className={cn(
            'flex items-center justify-between p-4 rounded-xl border transition-all',
            settingsMap.worker_verification_cnic_required === 'true'
              ? 'bg-cyan-500/5 border-cyan-500/15'
              : 'bg-white/[0.02] border-white/5'
          )}>
            <div>
              <p className={cn(
                'text-sm font-medium',
                settingsMap.worker_verification_cnic_required === 'true'
                  ? 'text-white'
                  : 'text-white/40'
              )}>
                {isUrdu ? 'شناختی کارڈ ضروری' : 'CNIC Verification Required'}
              </p>
              <p className="text-xs text-white/25 mt-0.5">
                {isUrdu ? 'رجسٹریشن کے لیے شناختی کارڈ تصدیق ضروری ہے' : 'CNIC must be verified during registration'}
              </p>
            </div>
            <ToggleSwitch
              value={settingsMap.worker_verification_cnic_required === 'true'}
              onChange={(v) => updateSetting('worker_verification_cnic_required', String(v))}
            />
          </div>

          {/* Auto-approve */}
          <div className={cn(
            'flex items-center justify-between p-4 rounded-xl border transition-all',
            settingsMap.worker_verification_auto_approve === 'true'
              ? 'bg-cyan-500/5 border-cyan-500/15'
              : 'bg-white/[0.02] border-white/5'
          )}>
            <div>
              <p className={cn(
                'text-sm font-medium',
                settingsMap.worker_verification_auto_approve === 'true'
                  ? 'text-white'
                  : 'text-white/40'
              )}>
                {isUrdu ? 'تصدیق کے بعد خود بخود منظوری' : 'Auto-approve After Verification'}
              </p>
              <p className="text-xs text-white/25 mt-0.5">
                {isUrdu ? 'تصدیق مکمل ہونے پر خود بخود منظور کریں' : 'Automatically approve after verification is complete'}
              </p>
            </div>
            <ToggleSwitch
              value={settingsMap.worker_verification_auto_approve === 'true'}
              onChange={(v) => updateSetting('worker_verification_auto_approve', String(v))}
            />
          </div>
        </div>
      </div>

      {/* ── 5. Announcements ─────────────────────────────── */}
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
              {isUrdu ? 'تمام مزدوروں کو اعلان بھیجیں' : 'Send announcements to all workers'}
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
              : (isUrdu ? 'تمام مزدوروں کو بھیجیں' : 'Send to All Workers')}
          </button>
        </div>
      </div>
    </div>
  );
}
