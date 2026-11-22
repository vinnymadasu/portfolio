'use client';

import { useEffect, useState } from 'react';
import { useLocale } from './LocaleProvider';

export default function TopBar({ onOpenPalette }) {
  const { t } = useLocale();
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
    if (meta) meta.setAttribute('content', next === 'dark' ? '#111111' : '#ece8e1');
  }

  return (
    <>
      <div className="progress" style={{ width: progress + '%' }} />
      <div className="bar">
        <div className="wrap">
          <div className="mark"><i />VINEETH RAO MADASU</div>
          <div className="barTools">
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
