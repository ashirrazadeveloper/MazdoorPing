'use client';

import { AuthGuard } from '@/components/shared/AuthGuard';
import { MaintenanceGuard } from '@/components/shared/MaintenanceGuard';
import { SectionLayout } from '@/components/layouts/SectionLayout';
import { LayoutDashboard, Briefcase, ClipboardList, Wallet, User, Star, AlertTriangle, Bell } from 'lucide-react';

const sidebarItems = [
  { label: 'Dashboard', labelKey: 'nav.workerDashboard', href: '/worker', icon: LayoutDashboard },
  { label: 'Browse Jobs', labelKey: 'nav.workerBrowseJobs', href: '/worker/jobs', icon: Briefcase },
  { label: 'My Jobs', labelKey: 'nav.workerMyJobs', href: '/worker/my-jobs', icon: ClipboardList },
  { label: 'Wallet', labelKey: 'nav.workerWallet', href: '/worker/wallet', icon: Wallet },
  { label: 'Profile', labelKey: 'nav.workerProfile', href: '/worker/profile', icon: User },
  { label: 'Reviews', labelKey: 'nav.workerReviews', href: '/worker/reviews', icon: Star },
  { label: 'SOS Alert', labelKey: 'nav.workerSOS', href: '/worker/sos', icon: AlertTriangle },
  { label: 'Notifications', labelKey: 'nav.workerNotifications', href: '/worker/notifications', icon: Bell },
];

const bottomNavItems = [
  { label: 'Home', labelKey: 'common.home', href: '/worker', icon: LayoutDashboard },
  { label: 'Jobs', labelKey: 'common.jobs', href: '/worker/jobs', icon: Briefcase },
  { label: 'My Jobs', labelKey: 'nav.workerMyJobs', href: '/worker/my-jobs', icon: ClipboardList },
  { label: 'Wallet', labelKey: 'common.wallet', href: '/worker/wallet', icon: Wallet },
  { label: 'Alerts', labelKey: 'common.notifications', href: '/worker/notifications', icon: Bell },
];

export default function WorkerLayout({ children }: { children: React.ReactNode }) {
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
