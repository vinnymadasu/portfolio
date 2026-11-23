'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { MARKETS, marketById } from '@/lib/markets';
import { detectMarket } from '@/lib/geo';
import { t as translate, manifest as manifestFor, LANGS, LANG_NAMES } from '@/lib/i18n';

const Ctx = createContext(null);
const STORE_KEY = 'vm-market';
const LANG_KEY = 'vm-lang';

export function LocaleProvider({ children }) {
  // Always render the same market on the server and on first client paint,
  // otherwise React reports a hydration mismatch.
  const [market, setMarket] = useState(MARKETS[0]);
  const [mounted, setMounted] = useState(false);
  const [autoDetected, setAutoDetected] = useState(false);
  // null = follow the selected market; a code = the visitor chose for themselves.
  const [langPick, setLangPick] = useState(null);

  useEffect(() => {
    let next = null;
    let detected = false;
    try {
      const saved = window.localStorage.getItem(STORE_KEY);
      if (saved) next = MARKETS.find((m) => m.id === saved) || null;
      const savedLang = window.localStorage.getItem(LANG_KEY);
      if (savedLang && LANGS.includes(savedLang)) setLangPick(savedLang);
    } catch {}
    if (!next) {
      next = detectMarket(MARKETS);
      detected = Boolean(next);
    }
    if (next) {
      setMarket(next);
      setAutoDetected(detected);
    }
    setMounted(true);
  }, []);

  const lang = langPick || market.lang;

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(() => {
    return {
      market,
      lang,
      mounted,
      autoDetected,
      markets: MARKETS,
      langs: LANGS,
      langNames: LANG_NAMES,
      langPicked: Boolean(langPick),
      setLang: (code) => {
        setLangPick(code);
        try { window.localStorage.setItem(LANG_KEY, code); } catch {}
      },
      t: (key) => translate(lang, key),
      manifest: () => manifestFor(lang),
      select: (id) => {
        const m = marketById(id);
        setMarket(m);
        setAutoDetected(false);
        try { window.localStorage.setItem(STORE_KEY, m.id); } catch {}
      },
    };
  }, [market, mounted, autoDetected, lang, langPick]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLocale() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useLocale must be used inside LocaleProvider');
  return v;
}
