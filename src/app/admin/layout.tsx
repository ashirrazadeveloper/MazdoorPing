'use client';

import { AuthGuard } from '@/components/shared/AuthGuard';
import { SectionLayout } from '@/components/layouts/SectionLayout';
import { LayoutDashboard, Users, Building2, Briefcase, Tag, DollarSign, AlertTriangle, Settings, ShieldCheck, Bell } from 'lucide-react';

const sidebarItems = [
  { label: 'Dashboard', labelKey: 'nav.adminDashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Workers', labelKey: 'nav.adminWorkers', href: '/admin/workers', icon: Users },
  { label: 'Verification', labelKey: 'nav.adminVerification', href: '/admin/verification', icon: ShieldCheck },
  { label: 'Employers', labelKey: 'nav.adminEmployers', href: '/admin/employers', icon: Building2 },
  { label: 'Jobs', labelKey: 'nav.adminJobs', href: '/admin/jobs', icon: Briefcase },
  { label: 'Categories', labelKey: 'nav.adminCategories', href: '/admin/categories', icon: Tag },
  { label: 'Financials', labelKey: 'nav.adminFinancials', href: '/admin/financials', icon: DollarSign },
  { label: 'SOS Alerts', labelKey: 'nav.adminSOSAlerts', href: '/admin/sos-alerts', icon: AlertTriangle },
  { label: 'Notifications', labelKey: 'nav.adminNotifications', href: '/admin/notifications', icon: Bell },
  { label: 'Settings', labelKey: 'nav.adminSettings', href: '/admin/settings', icon: Settings },
];

const bottomNavItems = [
  { label: 'Home', labelKey: 'common.home', href: '/admin', icon: LayoutDashboard },
  { label: 'Verify', labelKey: 'nav.adminVerification', href: '/admin/verification', icon: ShieldCheck },
  { label: 'Workers', labelKey: 'nav.adminWorkers', href: '/admin/workers', icon: Users },
  { label: 'Alerts', labelKey: 'nav.adminSOSAlerts', href: '/admin/sos-alerts', icon: AlertTriangle },
  { label: 'Settings', labelKey: 'nav.adminSettings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRole="admin">
      <SectionLayout
        sidebarItems={sidebarItems}
        bottomNavItems={bottomNavItems}
        accentColor="orange"
        title="Admin"
        meshBg="bg-mesh-admin"
      >
        {children}
      </SectionLayout>
    </AuthGuard>
  );
}
