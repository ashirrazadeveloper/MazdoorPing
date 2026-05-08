'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Bell, BellOff, Check, AlertTriangle, CreditCard, MessageSquare,
  ShieldAlert, Megaphone, Loader2, Save, RefreshCw
} from 'lucide-react';
import { useLanguageStore } from '@/store/language-store';

interface NotificationSetting {
  id: string;
  icon: string;
  enabled: boolean;
}

const DEFAULT_SETTINGS: NotificationSetting[] = [
  { id: 'jobAlerts', icon: 'bell', enabled: true },
  { id: 'bidResponses', icon: 'check', enabled: true },
  { id: 'paymentUpdates', icon: 'creditCard', enabled: true },
  {  id: 'newMessages', icon: 'messageSquare', enabled: true },
  { id: 'sosAlerts', icon: 'shieldAlert', enabled: true },
  { id: 'marketing', icon: 'megaphone', enabled: false },
];

const STORAGE_KEY = 'mazdoorping-notif-settings';
const PUSH_DISMISSED_KEY = 'mazdoorping-push-dismissed';

export default function NotificationSettingsPage() {
  const { t } = useLanguageStore();
  const [settings, setSettings] = useState<NotificationSetting[]>(DEFAULT_SETTINGS);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushPermission, setPushPermission] = useState<'default' | 'granted' | 'denied'>('default');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Load settings from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as NotificationSetting[];
        setSettings(parsed);
      }
    } catch {
      // Use defaults
    }
  }, []);

  // Check push notification permission
  useEffect(() => {
    if ('Notification' in window) {
      setPushPermission(Notification.permission);
    }
  }, []);

  // Check if previously dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem(PUSH_DISMISSED_KEY);
    if (dismissed === 'true') {
      setPushEnabled(false);
    }
  }, []);

  const toggleSetting = useCallback((id: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  }, []);

  const togglePush = useCallback(() => {
    setPushEnabled((prev) => !prev);
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      alert(t('notifSettings.browserNotSupported'));
      return;
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);
      if (permission === 'granted') {
        setPushEnabled(true);
        localStorage.setItem(PUSH_DISMISSED_KEY, 'false');
      } else {
        localStorage.setItem(PUSH_DISMISSED_KEY, 'true');
      }
    } else if (Notification.permission === 'granted') {
      setPushEnabled(true);
      localStorage.setItem(PUSH_DISMISSED_KEY, 'false');
    }
  }, [t]);

  const saveSettings = useCallback(() => {
    setSaveStatus('saving');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  }, [settings]);

  const iconMap: Record<string, React.ReactNode> = {
    bell: <Bell className="w-5 h-5" />,
    check: <Check className="w-5 h-5" />,
    creditCard: <CreditCard className="w-5 h-5" />,
    messageSquare: <MessageSquare className="w-5 h-5" />,
    shieldAlert: <ShieldAlert className="w-5 h-5" />,
    megaphone: <Megaphone className="w-5 h-5" />,
  };

  const descriptionMap: Record<string, string> = {
    jobAlerts: t('notifSettings.jobAlertsDesc'),
    bidResponses: t('notifSettings.bidResponsesDesc'),
    paymentUpdates: t('notifSettings.paymentUpdatesDesc'),
    newMessages: t('notifSettings.newMessagesDesc'),
    sosAlerts: t('notifSettings.sosAlertsDesc'),
    marketing: t('notifSettings.marketingDesc'),
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">{t('notifSettings.title')}</h1>
        <p className="text-white/50 mt-1">{t('notifSettings.subtitle')}</p>
      </div>

      {/* Push Notification Toggle */}
      <div className="glass-card-premium p-6 animate-scale-in">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              pushEnabled
                ? 'bg-emerald-500/20 border border-emerald-500/30'
                : 'bg-white/5 border border-white/10'
            }`}>
              {pushEnabled ? (
                <Bell className="w-6 h-6 text-emerald-400" />
              ) : (
                <BellOff className="w-6 h-6 text-white/40" />
              )}
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">{t('notifSettings.enablePush')}</h3>
              <p className="text-xs text-white/40 mt-0.5 max-w-sm">{t('notifSettings.enablePushDesc')}</p>
            </div>
          </div>
          <button
            onClick={requestPermission}
            className="px-4 py-2 text-sm font-medium rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20 transition-all"
          >
            {pushPermission === 'granted' ? t('notifSettings.permissionGranted') : t('notifSettings.requestPermission')}
          </button>
        </div>

        {/* Permission status */}
        {pushPermission === 'denied' && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/15 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-xs text-red-300">{t('notifSettings.permissionDenied')}</p>
            <button
              onClick={() => {
                localStorage.removeItem(PUSH_DISMISSED_KEY);
                requestPermission();
              }}
              className="text-xs text-emerald-400 hover:text-emerald-300 ml-auto whitespace-nowrap flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              {t('notifSettings.grantPermission')}
            </button>
          </div>
        )}

        {pushPermission === 'granted' && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/15 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <p className="text-xs text-emerald-300">{t('notifSettings.permissionGranted')}</p>
          </div>
        )}
      </div>

      {/* Individual Notification Toggles */}
      <div className="glass-card p-6 space-y-1 animate-scale-in">
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
          {t('common.notifications')}
        </h3>
        <div className="space-y-1">
          {settings.map((setting, index) => (
            <div
              key={setting.id}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-white/3 transition-colors -mx-1"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  setting.enabled
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'bg-white/5 text-white/40'
                }`}>
                  {iconMap[setting.icon] || <Bell className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{t(`notifSettings.${setting.id}`)}</p>
                  <p className="text-xs text-white/35 mt-0.5">{descriptionMap[setting.id]}</p>
                </div>
              </div>
              <button
                onClick={() => toggleSetting(setting.id)}
                className={`toggle-switch ${setting.enabled ? 'active' : ''}`}
                role="switch"
                aria-checked={setting.enabled}
                aria-label={t(`notifSettings.${setting.id}`)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={saveSettings}
        disabled={saveStatus === 'saving'}
        className="w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-400 hover:to-emerald-500 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
      >
        {saveStatus === 'saving' && <Loader2 className="w-4 h-4 animate-spin" />}
        {saveStatus === 'saved' && <Check className="w-4 h-4" />}
        {saveStatus === 'idle' && <Save className="w-4 h-4" />}
        {saveStatus === 'saving'
          ? t('common.processing')
          : saveStatus === 'saved'
            ? t('notifSettings.settingsSaved')
            : t('common.save')}
      </button>
    </div>
  );
}
