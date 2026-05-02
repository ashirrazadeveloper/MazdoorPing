'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/layouts/Sidebar';
import { BottomNav } from '@/components/layouts/BottomNav';
import { AuthGuard } from '@/components/shared/AuthGuard';
import { LanguageToggle } from '@/components/shared/LanguageToggle';
import { Menu, Bell, Search, PanelLeftClose, PanelLeft } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useLanguageStore } from '@/store/language-store';
import { supabase } from '@/lib/supabase';
import type { LucideIcon } from 'lucide-react';

interface SectionLayoutProps {
  children: React.ReactNode;
  sidebarItems: { label: string; labelKey: string; href: string; icon: LucideIcon }[];
  bottomNavItems: { label: string; labelKey: string; href: string; icon: LucideIcon }[];
  accentColor: string;
  title: string;
  meshBg?: string;
}

export function SectionLayout({ children, sidebarItems, bottomNavItems, accentColor, title, meshBg }: SectionLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { profile } = useAuthStore();
  const { language, t } = useLanguageStore();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!profile?.id) return;

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
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [profile?.id]);

  // Restore sidebar collapsed state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`sidebar-collapsed-${title}`);
      if (saved === 'true') setSidebarCollapsed(true);
    } catch {}
  }, [title]);

  const toggleSidebarCollapse = () => {
    const newVal = !sidebarCollapsed;
    setSidebarCollapsed(newVal);
    try { localStorage.setItem(`sidebar-collapsed-${title}`, String(newVal)); } catch {}
  };

  const sectionPath = title.toLowerCase();

  return (
    <AuthGuard>
      <div className={`min-h-screen ${meshBg || 'bg-mesh'}`}>
        <Sidebar
          items={sidebarItems}
          accentColor={accentColor}
          title={title}
          isOpen={sidebarOpen}
          isCollapsed={sidebarCollapsed}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Content area - sidebar always on left, margin adjusts for collapsed state */}
        <div className={sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}>
          <header className="sticky top-0 z-30 glass-sidebar border-b border-white/5">
            <div className="flex items-center justify-between px-4 lg:px-8 py-3 lg:py-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2.5 rounded-xl hover:bg-white/5 text-white/50 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Open menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
                {/* Desktop sidebar collapse toggle */}
                <button
                  onClick={toggleSidebarCollapse}
                  className="hidden lg:flex p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-white/70 transition-colors min-w-[36px] min-h-[36px] items-center justify-center"
                  aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  {sidebarCollapsed ? <PanelLeft className="w-4.5 h-4.5" /> : <PanelLeftClose className="w-4.5 h-4.5" />}
                </button>
                <div className="min-w-0">
                  <h2 className="text-sm lg:text-lg font-bold text-white truncate">
                    {t('common.welcomeBack')}, {profile?.full_name?.split(' ')[0] || 'User'}
                  </h2>
                  <p className="text-xs text-white/40 capitalize">{title} {t('common.dashboard')}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 lg:gap-2">
                <button className="p-2.5 rounded-xl hover:bg-white/5 text-white/50 transition-all hidden sm:flex items-center justify-center min-w-[44px] min-h-[44px]">
                  <Search className="w-5 h-5" />
                </button>
                <Link
                  href={`/${sectionPath}/notifications`}
                  className="p-2.5 rounded-xl hover:bg-white/5 text-white/50 transition-all relative flex items-center justify-center min-w-[44px] min-h-[44px]"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 end-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                <LanguageToggle />
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
