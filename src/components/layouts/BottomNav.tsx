'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguageStore } from '@/store/language-store';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface BottomNavItem {
  label: string;
  labelKey: string;
  href: string;
  icon: LucideIcon;
}

interface BottomNavProps {
  items: BottomNavItem[];
  accentColor: string;
}

const accentColorMap: Record<string, string> = {
  emerald: 'text-emerald-400',
  blue: 'text-blue-400',
  orange: 'text-orange-400',
  purple: 'text-purple-400',
  red: 'text-red-400',
};

export function BottomNav({ items, accentColor }: BottomNavProps) {
  const pathname = usePathname();
  const { t } = useLanguageStore();

  const activeColorClass = accentColorMap[accentColor] || 'text-emerald-400';

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-sidebar border-t border-white/5 z-50 lg:hidden">
      <div className="flex items-center justify-around px-1 py-1 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl transition-all duration-200 min-w-[56px] min-h-[48px] justify-center',
                isActive ? activeColorClass : 'text-white/40'
              )}
            >
              <item.icon className={cn('w-5 h-5', isActive && activeColorClass)} />
              <span className="text-[10px] font-medium leading-tight">{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
