'use client';

import { useState, useEffect, useMemo } from 'react';
import { AuthGuard } from '@/components/shared/AuthGuard';
import { MaintenanceGuard } from '@/components/shared/MaintenanceGuard';
import { SectionLayout } from '@/components/layouts/SectionLayout';
import {
  LayoutDashboard, Briefcase, ClipboardList, Wallet, User, Star,
  AlertTriangle, Bell, MapPin, Sparkles, TrendingUp, Award, Camera,
  Calendar, Bot, BellRing, Calculator, MessageCircle, FileText,
} from 'lucide-react';

const ALL_SIDEBAR_ITEMS = [
  { label: 'Dashboard', labelKey: 'nav.workerDashboard', href: '/worker', icon: LayoutDashboard, settingKey: null },
  { label: 'Browse Jobs', labelKey: 'nav.workerBrowseJobs', href: '/worker/jobs', icon: Briefcase, settingKey: 'worker_feature_browse_jobs' },
  { label: 'Nearby Jobs', labelKey: 'nearbyJobs.title', href: '/worker/nearby-jobs', icon: MapPin, settingKey: 'worker_feature_nearby_jobs' },
  { label: 'My Jobs', labelKey: 'nav.workerMyJobs', href: '/worker/my-jobs', icon: ClipboardList, settingKey: 'worker_feature_my_jobs' },
  { label: 'Recommendations', labelKey: 'jobRecommendation.title', href: '/worker/recommendations', icon: Sparkles, settingKey: 'worker_feature_recommendations' },
  { label: 'Chat', labelKey: 'chat.chatTitle', href: '/worker/chat', icon: MessageCircle, settingKey: 'worker_feature_chat' },
  { label: 'Wallet', labelKey: 'nav.workerWallet', href: '/worker/wallet', icon: Wallet, settingKey: 'worker_feature_wallet' },
  { label: 'Analytics', labelKey: 'incomeAnalytics.title', href: '/worker/analytics', icon: TrendingUp, settingKey: 'worker_feature_analytics' },
  { label: 'Profile', labelKey: 'nav.workerProfile', href: '/worker/profile', icon: User, settingKey: 'worker_feature_profile' },
  { label: 'Badges', labelKey: 'badges.title', href: '/worker/badges', icon: Award, settingKey: 'worker_feature_badges' },
  { label: 'Portfolio', labelKey: 'portfolio.title', href: '/worker/portfolio', icon: Camera, settingKey: 'worker_feature_portfolio' },
  { label: 'Availability', labelKey: 'availability.title', href: '/worker/availability', icon: Calendar, settingKey: 'worker_feature_availability' },
  { label: 'Reviews', labelKey: 'nav.workerReviews', href: '/worker/reviews', icon: Star, settingKey: 'worker_feature_reviews' },
  { label: 'Invoices', labelKey: 'invoice.title', href: '/worker/invoices', icon: FileText, settingKey: 'worker_feature_invoices' },
  { label: 'SOS Alert', labelKey: 'nav.workerSOS', href: '/worker/sos', icon: AlertTriangle, settingKey: 'worker_feature_sos_alert' },
  { label: 'AI Assistant', labelKey: 'aiChat.title', href: '/worker/ai-assistant', icon: Bot, settingKey: 'worker_feature_ai_assistant' },
  { label: 'Notifications', labelKey: 'nav.workerNotifications', href: '/worker/notifications', icon: Bell, settingKey: 'worker_feature_notifications' },
  { label: 'Notification Settings', labelKey: 'pushNotifications.title', href: '/worker/notification-settings', icon: BellRing, settingKey: 'worker_feature_notification_settings' },
  { label: 'EMI Calculator', labelKey: 'emiCalculator.title', href: '/worker/emi-calculator', icon: Calculator, settingKey: 'worker_feature_emi_calculator' },
];

const ALL_BOTTOM_NAV_ITEMS = [
  { label: 'Dashboard', labelKey: 'common.home', href: '/worker', icon: LayoutDashboard, settingKey: null },
  { label: 'Jobs', labelKey: 'common.jobs', href: '/worker/jobs', icon: Briefcase, settingKey: 'worker_feature_browse_jobs' },
  { label: 'Chat', labelKey: 'chat.chatTitle', href: '/worker/chat', icon: MessageCircle, settingKey: 'worker_feature_chat' },
  { label: 'Notifications', labelKey: 'common.notifications', href: '/worker/notifications', icon: Bell, settingKey: 'worker_feature_notifications' },
  { label: 'Profile', labelKey: 'common.profile', href: '/worker/profile', icon: User, settingKey: 'worker_feature_profile' },
];

export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  const [settingsMap, setSettingsMap] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/admin/platform-settings')
      .then(r => r.json())
      .then(({ data }) => {
        if (data && Array.isArray(data)) {
          const map: Record<string, string> = {};
          data.forEach((s: { key: string; value: string }) => { map[s.key] = s.value; });
          setSettingsMap(map);
        }
      })
      .catch(() => {});
  }, []);

  const sidebarItems = useMemo(() => {
    return ALL_SIDEBAR_ITEMS.filter(item => {
      if (item.settingKey === null) return true;
      const val = settingsMap[item.settingKey];
      return val !== 'false';
    });
  }, [settingsMap]);

  const bottomNavItems = useMemo(() => {
    return ALL_BOTTOM_NAV_ITEMS.filter(item => {
      if (item.settingKey === null) return true;
      const val = settingsMap[item.settingKey];
      return val !== 'false';
    });
  }, [settingsMap]);

  return (
    <MaintenanceGuard>
      <AuthGuard allowedRole="worker">
        <SectionLayout
          sidebarItems={sidebarItems}
          bottomNavItems={bottomNavItems}
          accentColor="emerald"
          title="Worker"
          meshBg="bg-mesh-worker"
        >
          {children}
        </SectionLayout>
      </AuthGuard>
    </MaintenanceGuard>
  );
}
