'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useLanguageStore } from '@/store/language-store';
import { Construction, RefreshCw } from 'lucide-react';

export function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const { t } = useLanguageStore();
  const [maintenance, setMaintenance] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'maintenance_mode')
        .single();
      if (!cancelled) {
        setMaintenance(data?.value === 'true');
      }
    })();
    // Poll every 30 seconds
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'maintenance_mode')
        .single();
      if (!cancelled) {
        setMaintenance(data?.value === 'true');
      }
    }, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  // Loading state — show nothing or a very quick skeleton
  if (maintenance === null) {
    return <>{children}</>;
  }

  if (maintenance) {
    return (
      <div className="fixed inset-0 z-[100] bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md animate-fade-in">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
            <Construction className="w-12 h-12 text-orange-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">
            {t('maintenance.title')}
          </h1>
          <p className="text-white/50 text-sm leading-relaxed mb-8">
            {t('maintenance.subtitle')}
          </p>
          <div className="flex items-center justify-center gap-2 text-orange-400/60 text-sm">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>{t('maintenance.checking')}</span>
          </div>
          <p className="text-white/30 text-xs mt-6">
            {t('maintenance.thankYou')}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
