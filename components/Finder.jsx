'use client';

import { useMemo, useState } from 'react';
import { useLocale } from './LocaleProvider';

export default function Finder() {
  const { t, manifest, lang } = useLocale();
  const data = manifest();
  const [cat, setCat] = useState(0);
  const [q, setQ] = useState('');

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return data.items.filter(([category, title, desc]) => {
      if (cat > 0 && category !== data.cats[cat]) return false;
      if (!needle) return true;
      return `${category} ${title} ${desc}`.toLowerCase().includes(needle);
    });
  }, [data, cat, q]);

  return (
    <section className="sec" id="build">
      <div className="wrap">
        <div className="shead">
          <span className="snum mono">03</span>
          <span className="sttl mono">{t('sec.cap')}</span>
        </div>
        <h2 className="h2narrow">{t('cap.h')}</h2>
        <p className="bd">{t('cap.p')}</p>

        <div className="fsearch">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.6-3.6" /></svg>
          <label className="sr" htmlFor="fq">{t('cap.search')}</label>
          <input
            id="fq"
            type="search"
            autoComplete="off"
            placeholder={t('cap.search')}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="fchips" role="group" aria-label={t('cap.search')}>
          {data.cats.map((c, i) => (
            <button
              key={`${lang}-${c}`}
              type="button"
              className="fc"
              aria-pressed={i === cat}
              onClick={() => setCat(i)}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="fcount mono" aria-live="polite">{rows.length} / {data.items.length}</div>

        <div className="fgrid">
          {rows.map(([category, title, desc]) => (
            <div className="frow" key={title}>
              <div className="fcat mono">{category}</div>
              <div className="ftitle">{title}</div>
              <div className="fdesc">{desc}</div>
            </div>
          ))}
          {rows.length === 0 ? <div className="fnone">—</div> : null}
        </div>
      </div>
    </section>
  );
}
