'use client';

import { AuthGuard } from '@/components/shared/AuthGuard';
import { MaintenanceGuard } from '@/components/shared/MaintenanceGuard';
import { SectionLayout } from '@/components/layouts/SectionLayout';
import { LayoutDashboard, PlusCircle, Search, ClipboardList, User, Bell, Heart, Wallet, MessageCircle, Bot, Calendar } from 'lucide-react';

const sidebarItems = [
  { label: 'Dashboard', labelKey: 'nav.employerDashboard', href: '/employer', icon: LayoutDashboard },
  { label: 'Post Job', labelKey: 'nav.employerPostJob', href: '/employer/post-job', icon: PlusCircle },
  { label: 'Find Workers', labelKey: 'nav.employerFindWorkers', href: '/employer/find-workers', icon: Search },
  { label: 'My Bookings', labelKey: 'nav.employerMyBookings', href: '/employer/my-bookings', icon: ClipboardList },
  { label: 'Chat', labelKey: 'chat.chatTitle', href: '/employer/chat', icon: MessageCircle },
  { label: 'Worker Availability', labelKey: 'availability.title', href: '/employer/worker-availability', icon: Calendar },
  { label: 'AI Assistant', labelKey: 'aiChat.title', href: '/employer/ai-assistant', icon: Bot },
  { label: 'Wallet', labelKey: 'common.wallet', href: '/employer/wallet', icon: Wallet },
  { label: 'Profile', labelKey: 'nav.employerProfile', href: '/employer/profile', icon: User },
  { label: 'Notifications', labelKey: 'nav.employerNotifications', href: '/employer/notifications', icon: Bell },
  { label: 'Favorites', labelKey: 'nav.employerFavorites', href: '/employer/favorites', icon: Heart },
];

const bottomNavItems = [
  { label: 'Home', labelKey: 'common.home', href: '/employer', icon: LayoutDashboard },
  { label: 'Post', labelKey: 'nav.employerPostJob', href: '/employer/post-job', icon: PlusCircle },
  { label: 'Workers', labelKey: 'nav.employerFindWorkers', href: '/employer/find-workers', icon: Search },
  { label: 'Bookings', labelKey: 'nav.employerMyBookings', href: '/employer/my-bookings', icon: ClipboardList },
  { label: 'Profile', labelKey: 'common.profile', href: '/employer/profile', icon: User },
];

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
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
