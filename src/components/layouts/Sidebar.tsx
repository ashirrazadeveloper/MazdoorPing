'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useLanguageStore } from '@/store/language-store';
import { cn, getInitials } from '@/lib/utils';
import { LogOut, ChevronRight, X } from 'lucide-react';
import Image from 'next/image';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  label: string;
  labelKey: string;
  href: string;
  icon: LucideIcon;
}

interface SidebarProps {
  items: NavItem[];
  accentColor: string;
  title: string;
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
}

export function Sidebar({ items, accentColor, title, isOpen, isCollapsed, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { profile, signOut } = useAuthStore();
  const { t } = useLanguageStore();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full z-50 transition-all duration-300 flex flex-col glass-sidebar',
          isCollapsed ? 'w-20' : 'w-72',
          // Mobile: always off-screen unless open
          isOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop: always visible
          'lg:translate-x-0',
          isCollapsed ? 'lg:border-r' : ''
        )}
      >
        {/* Header */}
        <div className={cn(
          'border-b border-white/5',
          isCollapsed ? 'p-3 flex justify-center' : 'p-5'
        )}>
          <div className={cn('items-center', isCollapsed ? '' : 'justify-between flex')}>
            <Link href="/" className={cn('flex items-center gap-3', isCollapsed ? 'justify-center' : '')}>
              <Image src="/logo.png" alt="MazdoorPing" width={40} height={40} className="w-10 h-10 rounded-xl shrink-0 object-cover" />
              {!isCollapsed && (
                <div>
                  <h1 className="font-bold text-white text-lg">MazdoorPing</h1>
                  <p className="text-xs text-white/40 capitalize">{title}</p>
                </div>
              )}
            </Link>
            {!isCollapsed && (
              <button onClick={onClose} className="lg:hidden p-2 rounded-lg hover:bg-white/10 text-white/50 min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Close menu">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
          {items.map((item) => {
            const isActive = pathname === item.href;
            const translatedLabel = t(item.labelKey);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                title={isCollapsed ? translatedLabel : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200',
                  isCollapsed ? 'px-0 py-3 justify-center' : 'px-4 py-3',
                  isActive
                    ? `bg-${accentColor}/15 text-${accentColor}-400 border border-${accentColor}/20 shadow-lg`
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!isCollapsed && (
                  <>
                    <span className="flex-1">{translatedLabel}</span>
                    {isActive && <ChevronRight className="w-4 h-4" />}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer - User info + Sign Out */}
        <div className={cn('border-t border-white/5', isCollapsed ? 'p-3 pb-20 lg:pb-3' : 'p-4 pb-20 lg:pb-4')}>
          {!isCollapsed && (
            <div className="flex items-center gap-3 mb-3 px-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-sm font-semibold text-white shrink-0">
                {profile ? getInitials(profile.full_name) : 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{profile?.full_name || 'User'}</p>
                <p className="text-xs text-white/40 truncate">{profile?.email || ''}</p>
              </div>
            </div>
          )}
          <button
            onClick={signOut}
            title={isCollapsed ? t('common.signOut') : undefined}
            className={cn(
              'flex items-center gap-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all min-h-[44px]',
              isCollapsed ? 'justify-center px-0 w-full' : 'w-full px-4 py-3'
            )}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>{t('common.signOut')}</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
