import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { t as translate, type Language } from '@/lib/translations';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
  t: (key: string) => string;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'en',
      setLanguage: (lang: Language) => set({ language: lang }),
      get isRTL() {
        return get().language === 'ur';
      },
      t: (key: string) => translate(key, get().language),
    }),
    {
      name: 'mazdoorping-language',
    }
  )
);
