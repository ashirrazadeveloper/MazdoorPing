'use client';

import { AuthGuard } from '@/components/shared/AuthGuard';
import { MaintenanceGuard } from '@/components/shared/MaintenanceGuard';
import { SectionLayout } from '@/components/layouts/SectionLayout';
import {
  LayoutDashboard, Briefcase, ClipboardList, Wallet, User, Star,
  AlertTriangle, Bell, MapPin, Sparkles, TrendingUp, Award, Camera,
  Calendar, Bot, BellRing, Calculator, MessageCircle, FileText,
} from 'lucide-react';

const sidebarItems = [
  { label: 'Dashboard', labelKey: 'nav.workerDashboard', href: '/worker', icon: LayoutDashboard },
  { label: 'Browse Jobs', labelKey: 'nav.workerBrowseJobs', href: '/worker/jobs', icon: Briefcase },
  { label: 'Nearby Jobs', labelKey: 'nearbyJobs.title', href: '/worker/nearby-jobs', icon: MapPin },
  { label: 'My Jobs', labelKey: 'nav.workerMyJobs', href: '/worker/my-jobs', icon: ClipboardList },
  { label: 'Recommendations', labelKey: 'jobRecommendation.title', href: '/worker/recommendations', icon: Sparkles },
  { label: 'Chat', labelKey: 'chat.chatTitle', href: '/worker/chat', icon: MessageCircle },
  { label: 'Wallet', labelKey: 'nav.workerWallet', href: '/worker/wallet', icon: Wallet },
  { label: 'Analytics', labelKey: 'incomeAnalytics.title', href: '/worker/analytics', icon: TrendingUp },
  { label: 'Profile', labelKey: 'nav.workerProfile', href: '/worker/profile', icon: User },
  { label: 'Badges', labelKey: 'badges.title', href: '/worker/badges', icon: Award },
  { label: 'Portfolio', labelKey: 'portfolio.title', href: '/worker/portfolio', icon: Camera },
  { label: 'Availability', labelKey: 'availability.title', href: '/worker/availability', icon: Calendar },
  { label: 'Reviews', labelKey: 'nav.workerReviews', href: '/worker/reviews', icon: Star },
  { label: 'Invoices', labelKey: 'invoice.title', href: '/worker/invoices', icon: FileText },
  { label: 'SOS Alert', labelKey: 'nav.workerSOS', href: '/worker/sos', icon: AlertTriangle },
  { label: 'AI Assistant', labelKey: 'aiChat.title', href: '/worker/ai-assistant', icon: Bot },
  { label: 'Notifications', labelKey: 'nav.workerNotifications', href: '/worker/notifications', icon: Bell },
  { label: 'Notification Settings', labelKey: 'pushNotifications.title', href: '/worker/notification-settings', icon: BellRing },
  { label: 'EMI Calculator', labelKey: 'emiCalculator.title', href: '/worker/emi-calculator', icon: Calculator },
];

const bottomNavItems = [
  { label: 'Dashboard', labelKey: 'common.home', href: '/worker', icon: LayoutDashboard },
  { label: 'Jobs', labelKey: 'common.jobs', href: '/worker/jobs', icon: Briefcase },
  { label: 'Chat', labelKey: 'chat.chatTitle', href: '/worker/chat', icon: MessageCircle },
  { label: 'Notifications', labelKey: 'common.notifications', href: '/worker/notifications', icon: Bell },
  { label: 'Profile', labelKey: 'common.profile', href: '/worker/profile', icon: User },
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
