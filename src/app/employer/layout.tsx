'use client';

import { AuthGuard } from '@/components/shared/AuthGuard';
import { SectionLayout } from '@/components/layouts/SectionLayout';
import { LayoutDashboard, PlusCircle, Search, ClipboardList, User, Bell, Heart } from 'lucide-react';

const sidebarItems = [
  { label: 'Dashboard', href: '/employer', icon: LayoutDashboard },
  { label: 'Post Job', href: '/employer/post-job', icon: PlusCircle },
  { label: 'Find Workers', href: '/employer/find-workers', icon: Search },
  { label: 'My Bookings', href: '/employer/my-bookings', icon: ClipboardList },
  { label: 'Profile', href: '/employer/profile', icon: User },
  { label: 'Notifications', href: '/employer/notifications', icon: Bell },
  { label: 'Favorites', href: '/employer/favorites', icon: Heart },
];

const bottomNavItems = [
  { label: 'Home', href: '/employer', icon: LayoutDashboard },
  { label: 'Post', href: '/employer/post-job', icon: PlusCircle },
  { label: 'Workers', href: '/employer/find-workers', icon: Search },
  { label: 'Bookings', href: '/employer/my-bookings', icon: ClipboardList },
  { label: 'Profile', href: '/employer/profile', icon: User },
];

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  return (
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
  );
}
