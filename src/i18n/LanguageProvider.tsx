import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { dictionaries, languages, type Dict, type Lang } from './translations';

type LanguageContextValue = {
  lang: Lang;
  dir: 'ltr' | 'rtl';
  isRtl: boolean;
  t: Dict;
  setLang: (lang: Lang) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);
const STORAGE_KEY = 'hema-lang';

function readInitialLang(): Lang {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('lang');
    if (fromUrl && fromUrl in dictionaries) return fromUrl as Lang;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && stored in dictionaries) return stored as Lang;
  } catch {
    // Storage can be blocked (private mode); fall back to the browser language.
  }
  const nav = navigator.language.toLowerCase();
  if (nav.startsWith('ckb') || nav.startsWith('ku')) return 'ku';
  if (nav.startsWith('ar')) return 'ar';
  return 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readInitialLang);
  const meta = languages.find((l) => l.code === lang)!;
  const t = dictionaries[lang];

  useEffect(() => {
    const root = document.documentElement;
    root.lang = meta.htmlLang;
    root.dir = meta.dir;
    document.title = t.meta.title;
  }, [meta, t]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Not critical: the choice simply won't be remembered.
    }
  }, []);

  const value = useMemo(
    () => ({ lang, dir: meta.dir, isRtl: meta.dir === 'rtl', t, setLang }),
    [lang, meta.dir, t, setLang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
