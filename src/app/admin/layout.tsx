'use client';

import { AuthGuard } from '@/components/shared/AuthGuard';
import { SectionLayout } from '@/components/layouts/SectionLayout';
import { LayoutDashboard, Users, Building2, Briefcase, Tag, DollarSign, AlertTriangle, Settings, ShieldCheck } from 'lucide-react';

const sidebarItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Workers', href: '/admin/workers', icon: Users },
  { label: 'Verification', href: '/admin/verification', icon: ShieldCheck },
  { label: 'Employers', href: '/admin/employers', icon: Building2 },
  { label: 'Jobs', href: '/admin/jobs', icon: Briefcase },
  { label: 'Categories', href: '/admin/categories', icon: Tag },
  { label: 'Financials', href: '/admin/financials', icon: DollarSign },
  { label: 'SOS Alerts', href: '/admin/sos-alerts', icon: AlertTriangle },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

const bottomNavItems = [
  { label: 'Home', href: '/admin', icon: LayoutDashboard },
  { label: 'Verify', href: '/admin/verification', icon: ShieldCheck },
  { label: 'Workers', href: '/admin/workers', icon: Users },
  { label: 'Alerts', href: '/admin/sos-alerts', icon: AlertTriangle },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
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
