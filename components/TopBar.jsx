'use client';

import { useEffect, useState } from 'react';
import { useLocale } from './LocaleProvider';

export default function TopBar({ onOpenPalette }) {
  const { t, lang, langs, langNames, setLang } = useLocale();
  const [theme, setTheme] = useState('light');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme || 'light');
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(h > 0 ? (window.scrollY / h) * 100 : 0);
        frame = 0;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try { window.localStorage.setItem('vm-theme', next); } catch {}
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', next === 'dark' ? '#120f1a' : '#fffaf3');
  }

  return (
    <>
      <div className="progress" style={{ width: progress + '%' }} />
      <div className="bar">
        <div className="wrap">
          <div className="mark"><i />VINEETH RAO MADASU</div>
          <div className="barTools">
            <div className="langPick">
              <span aria-hidden="true">{lang.toUpperCase()}</span>
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" /></svg>
              <label className="sr" htmlFor="langSelect">{t('ui.lang')}</label>
              <select id="langSelect" value={lang} onChange={(e) => setLang(e.target.value)}>
                {langs.map((code) => (
                  <option key={code} value={code}>{langNames[code]}</option>
                ))}
              </select>
            </div>
            <button type="button" className="gbtn" onClick={onOpenPalette}>
              <span className="lbl">{t('ui.search')}</span><kbd>⌘K</kbd>
            </button>
            <button type="button" className="gbtn icon" onClick={toggle} aria-label="Toggle theme">
              {theme === 'dark' ? (
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M4.6 4.6L6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4" /></svg>
              ) : (
                <svg viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
