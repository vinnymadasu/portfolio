'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { MARKETS, marketById } from '@/lib/markets';
import { detectMarket } from '@/lib/geo';
import { t as translate, manifest as manifestFor } from '@/lib/i18n';

const Ctx = createContext(null);
const STORE_KEY = 'vm-market';

export function LocaleProvider({ children }) {
  // Always render the same market on the server and on first client paint,
  // otherwise React reports a hydration mismatch.
  const [market, setMarket] = useState(MARKETS[0]);
  const [mounted, setMounted] = useState(false);
  const [autoDetected, setAutoDetected] = useState(false);

  useEffect(() => {
    let next = null;
    let detected = false;
    try {
      const saved = window.localStorage.getItem(STORE_KEY);
      if (saved) next = MARKETS.find((m) => m.id === saved) || null;
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

  useEffect(() => {
    document.documentElement.lang = market.lang;
  }, [market]);

  const value = useMemo(() => {
    const lang = market.lang;
    return {
      market,
      lang,
      mounted,
      autoDetected,
      markets: MARKETS,
      t: (key) => translate(lang, key),
      manifest: () => manifestFor(lang),
      select: (id) => {
        const m = marketById(id);
        setMarket(m);
        setAutoDetected(false);
        try { window.localStorage.setItem(STORE_KEY, m.id); } catch {}
      },
    };
  }, [market, mounted, autoDetected]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLocale() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useLocale must be used inside LocaleProvider');
  return v;
}
