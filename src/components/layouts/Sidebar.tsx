'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { cn, getInitials } from '@/lib/utils';
import { LogOut, ChevronRight, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface SidebarProps {
  items: NavItem[];
  accentColor: string;
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ items, accentColor, title, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { profile, signOut } = useAuthStore();

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside className={cn(
        'fixed top-0 left-0 h-full w-72 glass-sidebar z-50 transition-transform duration-300 flex flex-col',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center font-bold text-white text-lg">
                M
              </div>
              <div>
                <h1 className="font-bold text-white text-lg">MazdoorPing</h1>
                <p className="text-xs text-white/40 capitalize">{title}</p>
              </div>
            </Link>
            <button onClick={onClose} className="lg:hidden p-2 rounded-lg hover:bg-white/10 text-white/50 min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Close menu">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? `bg-${accentColor}/15 text-${accentColor}-400 border border-${accentColor}/20 shadow-lg`
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-sm font-semibold text-white">
              {profile ? getInitials(profile.full_name) : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{profile?.full_name || 'User'}</p>
              <p className="text-xs text-white/40 truncate">{profile?.email || ''}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all min-h-[44px]"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
