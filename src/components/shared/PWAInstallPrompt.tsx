'use client';

import { useEffect, useState } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { useLanguageStore } from '@/store/language-store';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<'accepted' | 'dismissed'>;
  prompt(): Promise<void>;
}

export function PWAInstallPrompt() {
  const { t } = useLanguageStore();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user previously dismissed
    const wasDismissed = localStorage.getItem('pwa-install-dismissed');
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const choiceResult = await (deferredPrompt as unknown as { userChoice: Promise<{ outcome: string }> }).userChoice;
    const outcome = choiceResult.outcome;

    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  const handleAppInstalled = () => {
    setShowPrompt(false);
    setDeferredPrompt(null);
  };

  useEffect(() => {
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => window.removeEventListener('appinstalled', handleAppInstalled);
  }, []);

  if (!showPrompt || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-up safe-area-bottom">
      <div className="glass-card-premium p-4 max-w-lg mx-auto flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
          <Smartphone className="w-6 h-6 text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white">{t('pwa.installTitle')}</h3>
          <p className="text-xs text-white/50 mt-0.5 line-clamp-2">{t('pwa.installDesc')}</p>
        </div>
        <button onClick={handleDismiss} className="flex-shrink-0 p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="max-w-lg mx-auto mt-2 flex gap-3">
        <button
          onClick={handleDismiss}
          className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all"
        >
          {t('pwa.dismissBtn')}
        </button>
        <button
          onClick={handleInstall}
          className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          {t('pwa.installBtn')}
        </button>
      </div>
    </div>
  );
}
