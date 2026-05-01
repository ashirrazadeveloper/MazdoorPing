'use client';

import { AuthGuard } from '@/components/shared/AuthGuard';
import { SectionLayout } from '@/components/layouts/SectionLayout';
import { LayoutDashboard, Briefcase, ClipboardList, Wallet, User, Star, AlertTriangle, Bell } from 'lucide-react';

const sidebarItems = [
  { label: 'Dashboard', href: '/worker', icon: LayoutDashboard },
  { label: 'Browse Jobs', href: '/worker/jobs', icon: Briefcase },
  { label: 'My Jobs', href: '/worker/my-jobs', icon: ClipboardList },
  { label: 'Wallet', href: '/worker/wallet', icon: Wallet },
  { label: 'Profile', href: '/worker/profile', icon: User },
  { label: 'Reviews', href: '/worker/reviews', icon: Star },
  { label: 'SOS Alert', href: '/worker/sos', icon: AlertTriangle },
  { label: 'Notifications', href: '/worker/notifications', icon: Bell },
];

const bottomNavItems = [
  { label: 'Home', href: '/worker', icon: LayoutDashboard },
  { label: 'Jobs', href: '/worker/jobs', icon: Briefcase },
  { label: 'My Jobs', href: '/worker/my-jobs', icon: ClipboardList },
  { label: 'Wallet', href: '/worker/wallet', icon: Wallet },
  { label: 'Profile', href: '/worker/profile', icon: User },
];

export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  return (
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
  );
}
