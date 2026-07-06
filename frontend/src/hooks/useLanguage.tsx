'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import en from '@/locales/en/translation.json';
import ar from '@/locales/ar/translation.json';

const allResources: Record<string, any> = { en, ar };

interface LanguageContextValue {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: 'en',
  setLocale: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState('en');
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    let stored: string | null = null;
    try { stored = localStorage.getItem('mkhtalif_locale'); } catch {}
    if (stored === 'ar' || stored === 'en') {
      setLocaleState(stored);
      document.documentElement.dir = stored === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = stored;
    }
  }, []);

  const setLocale = useCallback((lng: string) => {
    setLocaleState(lng);
    try { localStorage.setItem('mkhtalif_locale', lng); } catch {}
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
  }, []);

  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    let value: any = allResources[locale];
    if (!value) value = en;
    for (const k of keys) {
      value = value?.[k];
    }
    return typeof value === 'string' ? value : key;
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export { LanguageContext };
