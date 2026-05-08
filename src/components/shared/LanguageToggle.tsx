'use client';

import { Globe } from 'lucide-react';
import { useLanguageStore } from '@/store/language-store';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguageStore();

  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'ur' : 'en')}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all
        bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white hover:border-white/20
        backdrop-blur-sm min-h-[36px]"
      title={language === 'en' ? 'اردو میں بدلیں' : 'Switch to English'}
    >
      <Globe className="w-3.5 h-3.5" />
      <span>{language === 'en' ? 'اردو' : 'EN'}</span>
    </button>
  );
}
