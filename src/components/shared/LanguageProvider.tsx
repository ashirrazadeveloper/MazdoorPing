'use client';

import { useEffect } from 'react';
import { useLanguageStore } from '@/store/language-store';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { language } = useLanguageStore();

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = language === 'ur' ? 'rtl' : 'ltr';
      document.documentElement.lang = language;
    }
  }, [language]);

  return <>{children}</>;
}
