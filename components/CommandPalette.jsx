'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocale } from './LocaleProvider';
import { PROFILES, MAIL } from '@/lib/links';

function score(item, q) {
  if (!q) return 1;
  const hay = `${item.name} ${item.sub || ''}`.toLowerCase();
  const at = hay.indexOf(q);
  if (at > -1) return 100 - at;
  let i = 0, k = 0;                       // subsequence fuzzy match
  while (i < hay.length && k < q.length) {
    if (hay[i] === q[k]) k++;
    i++;
  }
  return k === q.length ? 10 : 0;
}

export default function CommandPalette({ open, onClose }) {
  const { t, markets, select, market } = useLocale();
  const [q, setQ] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const items = useMemo(() => {
    const go = (id, name, sub) => ({ group: '→', name, sub, href: '#' + id });
    const out = [
      go('work', t('sec.cons').split('—')[0].trim(), 'IndiaUnbox · SkilledMBA'),
      go('build', t('sec.cap').split('—')[0].trim(), t('cap.search')),
      go('record', t('sec.rec'), '2020 — ' + t('ui.now')),
      go('profiles', t('sec.pf'), 'GitHub · LinkedIn · Upwork · Credly'),
      go('contact', t('sec.ct'), MAIL),
    ];
    for (const p of PROFILES) {
      out.push({ group: '↗', name: p.name, sub: p.handle || t(p.handleKey), href: p.href, external: true });
    }
    for (const m of markets) {
      out.push({
        group: '⌖',
        name: m.name,
        sub: `${m.city} · ${m.lang.toUpperCase()}`,
        action: () => select(m.id),
        current: m.id === market.id,
      });
    }
    return out;
  }, [t, markets, select, market]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items
      .map((it) => ({ it, v: score(it, needle) }))
      .filter((r) => r.v > 0)
      .sort((a, b) => b.v - a.v)
      .map((r) => r.it);
  }, [items, q]);

  useEffect(() => { setCursor(0); }, [q]);

  useEffect(() => {
    if (!open) return;
    setQ('');
    setCursor(0);
    const id = setTimeout(() => inputRef.current?.focus(), 30);
    return () => clearTimeout(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector('[data-cursor="true"]');
    el?.scrollIntoView({ block: 'nearest' });
  }, [cursor, open, shown.length]);

  function run(item) {
    if (!item) return;
    onClose();
    if (item.action) { item.action(); return; }
    if (item.external) { window.open(item.href, '_blank', 'noopener'); return; }
    const el = document.querySelector(item.href);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setCursor((c) => Math.min(c + 1, shown.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); run(shown[cursor]); }
  }

  if (!open) return null;

  let lastGroup = null;
  return (
    <div className="pal" role="dialog" aria-modal="true" aria-label="Command palette" onKeyDown={onKeyDown}>
      <div className="palBg" onClick={onClose} />
      <div className="palBox">
        <div className="palQ">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.6-3.6" /></svg>
          <label className="sr" htmlFor="palInput">{t('ui.search')}</label>
          <input
            id="palInput"
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <div className="palList" ref={listRef}>
          {shown.length === 0 ? <div className="palNone">—</div> : null}
          {shown.map((it, i) => {
            const head = it.group !== lastGroup ? <div className="palGroup mono" key={'g' + i}>{it.group}</div> : null;
            lastGroup = it.group;
            return (
              <div key={it.name + i}>
                {head}
                <button
                  type="button"
                  className="palItem"
                  data-cursor={i === cursor}
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => run(it)}
                >
                  <span className="palIcon">{it.external ? '↗' : it.action ? (it.current ? '●' : '○') : '#'}</span>
                  <span className="palText">
                    {it.name}
                    {it.sub ? <span className="palSub">{it.sub}</span> : null}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
        <div className="palFoot mono">
          <span>↑↓ {t('ui.nav')}</span><span>↵ {t('ui.open2')}</span><span>ESC {t('ui.close')}</span>
        </div>
      </div>
    </div>
  );
}
