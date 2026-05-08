'use client';

import { useEffect } from 'react';
import { useLanguageStore } from '@/store/language-store';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { language } = useLanguageStore();

  useEffect(() => {
    if (typeof document !== 'undefined') {
      // Set lang attribute on html
      document.documentElement.lang = language;
      // Use body class for font switching instead of dir on html
      // This prevents the RTL overlap bug since dir="rtl" on html affects ALL elements
      if (language === 'ur') {
        document.body.classList.add('urdu-font');
        document.body.style.fontFamily = "'Noto Nastaliq Urdu', 'Inter', system-ui, sans-serif";
      } else {
        document.body.classList.remove('urdu-font');
        document.body.style.fontFamily = "'Inter', system-ui, -apple-system, sans-serif";
      }
    }
  }, [language]);

  return <>{children}</>;
}
