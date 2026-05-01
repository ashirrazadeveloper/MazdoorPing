'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import {
  Settings as SettingsIcon, Globe, UserCog, CreditCard, Bell,
  Save, Pencil, X, Check,
} from 'lucide-react';
import type { Settings } from '@/types';

interface SettingsGroup {
  title: string;
  icon: React.ReactNode;
  description: string;
  settings: {
    key: string;
    label: string;
    type: 'text' | 'email' | 'number' | 'toggle' | 'select';
    placeholder?: string;
    options?: { label: string; value: string }[];
  }[];
}

const SETTINGS_GROUPS: SettingsGroup[] = [
  {
    title: 'General',
    icon: <Globe className="w-5 h-5" />,
    description: 'Platform-wide general settings',
    settings: [
      { key: 'platform_name', label: 'Platform Name', type: 'text', placeholder: 'MazdoorPing' },
      { key: 'platform_tagline', label: 'Tagline', type: 'text', placeholder: 'Find trusted workers near you' },
      { key: 'support_email', label: 'Support Email', type: 'email', placeholder: 'support@mazdoorping.pk' },
      { key: 'maintenance_mode', label: 'Maintenance Mode', type: 'toggle' },
    ],
  },
  {
    title: 'Worker Settings',
    icon: <UserCog className="w-5 h-5" />,
    description: 'Worker onboarding and verification',
    settings: [
      { key: 'default_hourly_rate', label: 'Default Hourly Rate (PKR)', type: 'number', placeholder: '500' },
      { key: 'auto_approve_threshold', label: 'Auto-Approve Rating Threshold', type: 'number', placeholder: '4.5' },
      {
        key: 'verification_requirements',
        label: 'Verification Requirements',
        type: 'select',
        options: [
          { label: 'CNIC + Profile', value: 'cnic_profile' },
          { label: 'CNIC + Profile + Skills', value: 'cnic_profile_skills' },
          { label: 'Full Verification', value: 'full' },
        ],
      },
    ],
  },
  {
    title: 'Payment Settings',
    icon: <CreditCard className="w-5 h-5" />,
    description: 'Platform fees and payment processing',
    settings: [
      { key: 'platform_commission', label: 'Platform Commission (%)', type: 'number', placeholder: '10' },
      { key: 'min_withdrawal_amount', label: 'Min Withdrawal Amount (PKR)', type: 'number', placeholder: '1000' },
      {
        key: 'payment_methods',
        label: 'Payment Methods',
        type: 'select',
        options: [
          { label: 'Bank Transfer Only', value: 'bank' },
          { label: 'JazzCash + Bank', value: 'jazzcash_bank' },
          { label: 'All Methods', value: 'all' },
        ],
      },
    ],
  },
  {
    title: 'Notification Settings',
    icon: <Bell className="w-5 h-5" />,
    description: 'Email and SMS notification preferences',
    settings: [
      { key: 'email_notifications', label: 'Email Notifications', type: 'toggle' },
      { key: 'sms_notifications', label: 'SMS Notifications', type: 'toggle' },
      { key: 'push_notifications', label: 'Push Notifications', type: 'toggle' },
      { key: 'sos_email_alerts', label: 'SOS Email Alerts to Admin', type: 'toggle' },
    ],
  },
];

const DEFAULT_VALUES: Record<string, string> = {
  platform_name: 'MazdoorPing',
  platform_tagline: 'Find trusted workers near you',
  support_email: 'support@mazdoorping.pk',
  maintenance_mode: 'false',
  default_hourly_rate: '500',
  auto_approve_threshold: '4.5',
  verification_requirements: 'cnic_profile_skills',
  platform_commission: '10',
  min_withdrawal_amount: '1000',
  payment_methods: 'all',
  email_notifications: 'true',
  sms_notifications: 'true',
  push_notifications: 'true',
  sos_email_alerts: 'true',
};

export default function SettingsPage() {
  const [settingsMap, setSettingsMap] = useState<Record<string, string>>({});
  const [originalMap, setOriginalMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingGroup, setSavingGroup] = useState<string | null>(null);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    let cancelled = false;
    async function fetchSettings() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('*');

        if (error) throw error;

        const map: Record<string, string> = { ...DEFAULT_VALUES };
        (data as Settings[]).forEach((s) => {
          map[s.key] = s.value;
        });

        if (!cancelled) {
          setSettingsMap(map);
          setOriginalMap({ ...map });
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
        if (!cancelled) {
          setSettingsMap({ ...DEFAULT_VALUES });
          setOriginalMap({ ...DEFAULT_VALUES });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchSettings();
    return () => { cancelled = true; };
  }, []);

  const handleSaveGroup = async (group: SettingsGroup) => {
    setSavingGroup(group.title);
    try {
      const upserts = group.settings.map((s) => ({
        key: s.key,
        value: settingsMap[s.key] || DEFAULT_VALUES[s.key] || '',
      }));

      const { error } = await supabase
        .from('settings')
        .upsert(upserts, { onConflict: 'key' });

      if (error) throw error;

      showToast(`${group.title} settings saved`, 'success');
      setOriginalMap({ ...settingsMap });
      setEditingGroup(null);
    } catch (err) {
      console.error('Failed to save settings:', err);
      showToast('Failed to save settings', 'error');
    } finally {
      setSavingGroup(null);
    }
  };

  const updateSetting = (key: string, value: string) => {
    setSettingsMap((prev) => ({ ...prev, [key]: value }));
  };

  const hasGroupChanges = (group: SettingsGroup): boolean => {
    return group.settings.some(
      (s) => settingsMap[s.key] !== (originalMap[s.key] || DEFAULT_VALUES[s.key])
    );
  };

  const getDisplayValue = (key: string, type: string) => {
    const val = settingsMap[key] || DEFAULT_VALUES[key] || '';
    if (type === 'toggle') {
      return val === 'true' ? 'Enabled' : 'Disabled';
    }
    if (type === 'select') {
      const group = SETTINGS_GROUPS.find((g) => g.settings.some((s) => s.key === key));
      const setting = group?.settings.find((s) => s.key === key);
      return setting?.options?.find((o) => o.value === val)?.label || val;
    }
    return val;
  };

  const renderSettingControl = (setting: SettingsGroup['settings'][0], groupTitle: string) => {
    const isEditing = editingGroup === groupTitle;
    const value = settingsMap[setting.key] || DEFAULT_VALUES[setting.key] || '';

    if (!isEditing) {
      return (
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/60">
            {getDisplayValue(setting.key, setting.type)}
          </span>
          {setting.type === 'toggle' && (
            <div className={cn(
              'w-10 h-5 rounded-full relative transition-colors',
              value === 'true' ? 'bg-emerald-500/40' : 'bg-white/10'
            )}>
              <div className={cn(
                'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform',
                value === 'true' ? 'translate-x-5' : 'translate-x-0.5'
              )} />
            </div>
          )}
        </div>
      );
    }

    switch (setting.type) {
      case 'toggle':
        return (
          <button
            onClick={() => updateSetting(setting.key, value === 'true' ? 'false' : 'true')}
            className={cn(
              'w-10 h-5 rounded-full relative transition-colors',
              value === 'true' ? 'bg-emerald-500/40' : 'bg-white/10'
            )}
          >
            <div className={cn(
              'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform',
              value === 'true' ? 'translate-x-5' : 'translate-x-0.5'
            )} />
          </button>
        );
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => updateSetting(setting.key, e.target.value)}
            className="glass-input px-3 py-1.5 text-sm text-white max-w-[200px]"
          >
            {setting.options?.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-gray-900 text-white">
                {opt.label}
              </option>
            ))}
          </select>
        );
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => updateSetting(setting.key, e.target.value)}
            placeholder={setting.placeholder}
            className="glass-input px-3 py-1.5 text-sm text-white max-w-[180px] text-right"
          />
        );
      default:
        return (
          <input
            type={setting.type}
            value={value}
            onChange={(e) => updateSetting(setting.key, e.target.value)}
            placeholder={setting.placeholder}
            className="glass-input px-3 py-1.5 text-sm text-white max-w-[280px]"
          />
        );
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
        <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-orange-400" />
          Platform Settings
        </h1>
        <p className="text-white/50 mt-1">Configure platform behavior, payments, and notifications</p>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-6">
              <div className="skeleton h-5 w-32 mb-2" />
              <div className="skeleton h-3 w-48 mb-4" />
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="flex justify-between">
                    <div className="skeleton h-4 w-40" />
                    <div className="skeleton h-8 w-32 rounded-lg" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {SETTINGS_GROUPS.map((group) => {
            const isEditing = editingGroup === group.title;
            const isSaving = savingGroup === group.title;
            const changed = hasGroupChanges(group);

            return (
              <div key={group.title} className="glass-card p-6">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                      {group.icon}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">{group.title}</h2>
                      <p className="text-xs text-white/40">{group.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => {
                            setEditingGroup(null);
                            setSettingsMap({ ...originalMap });
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 text-xs font-medium transition-all"
                        >
                          <X className="w-3.5 h-3.5" /> Cancel
                        </button>
                        <button
                          onClick={() => handleSaveGroup(group)}
                          disabled={isSaving}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20 text-xs font-medium transition-all disabled:opacity-50"
                        >
                          <Save className="w-3.5 h-3.5" />
                          {isSaving ? 'Saving...' : 'Save'}
                        </button>
                      </>
                    ) : (
                      <>
                        {changed && (
                          <span className="flex items-center gap-1 text-xs text-amber-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            Unsaved changes
                          </span>
                        )}
                        <button
                          onClick={() => setEditingGroup(group.title)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/5 text-orange-400 hover:text-orange-300 text-xs font-medium transition-all"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-4">
                  {group.settings.map((setting) => (
                    <div
                      key={setting.key}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 border-b border-white/5 last:border-0"
                    >
                      <div className="min-w-0">
                        <label className="text-sm font-medium text-white/70">{setting.label}</label>
                        <p className="text-xs text-white/30 mt-0.5">Key: {setting.key}</p>
                      </div>
                      <div className="shrink-0">
                        {renderSettingControl(setting, group.title)}
                      </div>
                    </div>
                  ))}
                </div>

                {isEditing && changed && (
                  <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
                    <button
                      onClick={() => handleSaveGroup(group)}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border border-orange-500/20 font-medium text-sm transition-all disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      {isSaving ? 'Saving...' : `Save ${group.title}`}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
