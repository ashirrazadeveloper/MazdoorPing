'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/layouts/Sidebar';
import { BottomNav } from '@/components/layouts/BottomNav';
import { AuthGuard } from '@/components/shared/AuthGuard';
import { Menu, Bell, Search } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { supabase } from '@/lib/supabase';
import type { LucideIcon } from 'lucide-react';

interface SectionLayoutProps {
  children: React.ReactNode;
  sidebarItems: { label: string; href: string; icon: LucideIcon }[];
  bottomNavItems: { label: string; href: string; icon: LucideIcon }[];
  accentColor: string;
  title: string;
  meshBg?: string;
}

export function SectionLayout({ children, sidebarItems, bottomNavItems, accentColor, title, meshBg }: SectionLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!profile?.id) return;

    // Fetch unread count
    async function fetchCount() {
      try {
        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile!.id)
          .eq('is_read', false);
        setUnreadCount(count || 0);
      } catch {
        // silent fail
      }
    }

    fetchCount();

    // Refresh every 30 seconds
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [profile?.id]);

  return (
    <AuthGuard>
      <div className={`min-h-screen ${meshBg || 'bg-mesh'}`}>
        <Sidebar
          items={sidebarItems}
          accentColor={accentColor}
          title={title}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="lg:ml-72">
          <header className="sticky top-0 z-30 glass-sidebar border-b border-white/5">
            <div className="flex items-center justify-between px-4 lg:px-8 py-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-xl hover:bg-white/5 text-white/50"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-lg font-bold text-white">Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}</h2>
                  <p className="text-xs text-white/40 capitalize">{title} Dashboard</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2.5 rounded-xl hover:bg-white/5 text-white/50 transition-all">
                  <Search className="w-5 h-5" />
                </button>
                <Link href={`/${title.toLowerCase()}/notifications`} className="p-2.5 rounded-xl hover:bg-white/5 text-white/50 transition-all relative">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </header>

          <main className="p-4 lg:p-8 pb-24 lg:pb-8">
            {children}
          </main>

          <BottomNav items={bottomNavItems} accentColor={accentColor} />
        </div>
      </div>
    </AuthGuard>
  );
}
