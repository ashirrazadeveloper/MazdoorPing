'use client';

import { useState, useEffect, useMemo } from 'react';
import { AuthGuard } from '@/components/shared/AuthGuard';
import { MaintenanceGuard } from '@/components/shared/MaintenanceGuard';
import { SectionLayout } from '@/components/layouts/SectionLayout';
import { LayoutDashboard, PlusCircle, Search, ClipboardList, User, Bell, Heart, Wallet, MessageCircle, Bot, Calendar, CreditCard } from 'lucide-react';

const ALL_SIDEBAR_ITEMS = [
  { label: 'Dashboard', labelKey: 'nav.employerDashboard', href: '/employer', icon: LayoutDashboard, settingKey: null },
  { label: 'Post Job', labelKey: 'nav.employerPostJob', href: '/employer/post-job', icon: PlusCircle, settingKey: 'employer_feature_post_job' },
  { label: 'Find Workers', labelKey: 'nav.employerFindWorkers', href: '/employer/find-workers', icon: Search, settingKey: 'employer_feature_find_workers' },
  { label: 'My Bookings', labelKey: 'nav.employerMyBookings', href: '/employer/my-bookings', icon: ClipboardList, settingKey: 'employer_feature_my_bookings' },
  { label: 'Chat', labelKey: 'chat.chatTitle', href: '/employer/chat', icon: MessageCircle, settingKey: 'employer_feature_chat' },
  { label: 'Worker Availability', labelKey: 'availability.title', href: '/employer/worker-availability', icon: Calendar, settingKey: 'employer_feature_worker_availability' },
  { label: 'AI Assistant', labelKey: 'aiChat.title', href: '/employer/ai-assistant', icon: Bot, settingKey: 'employer_feature_ai_assistant' },
  { label: 'Wallet', labelKey: 'common.wallet', href: '/employer/wallet', icon: Wallet, settingKey: 'employer_feature_wallet' },
  { label: 'Billing', labelKey: 'nav.employerBilling', href: '/employer/billing', icon: CreditCard, settingKey: null },
  { label: 'Profile', labelKey: 'nav.employerProfile', href: '/employer/profile', icon: User, settingKey: 'employer_feature_profile' },
  { label: 'Notifications', labelKey: 'nav.employerNotifications', href: '/employer/notifications', icon: Bell, settingKey: 'employer_feature_notifications' },
  { label: 'Favorites', labelKey: 'nav.employerFavorites', href: '/employer/favorites', icon: Heart, settingKey: 'employer_feature_favorites' },
];

const ALL_BOTTOM_NAV_ITEMS = [
  { label: 'Home', labelKey: 'common.home', href: '/employer', icon: LayoutDashboard, settingKey: null },
  { label: 'Post', labelKey: 'nav.employerPostJob', href: '/employer/post-job', icon: PlusCircle, settingKey: 'employer_feature_post_job' },
  { label: 'Workers', labelKey: 'nav.employerFindWorkers', href: '/employer/find-workers', icon: Search, settingKey: 'employer_feature_find_workers' },
  { label: 'Bookings', labelKey: 'nav.employerMyBookings', href: '/employer/my-bookings', icon: ClipboardList, settingKey: 'employer_feature_my_bookings' },
  { label: 'Profile', labelKey: 'common.profile', href: '/employer/profile', icon: User, settingKey: 'employer_feature_profile' },
];

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
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
      <AuthGuard allowedRole="employer">
        <SectionLayout
          sidebarItems={sidebarItems}
          bottomNavItems={bottomNavItems}
          accentColor="blue"
          title="Employer"
          meshBg="bg-mesh-employer"
        >
          {children}
        </SectionLayout>
      </AuthGuard>
    </MaintenanceGuard>
  );
}
