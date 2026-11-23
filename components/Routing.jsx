'use client';

import { useEffect, useState } from 'react';
import { useLocale } from './LocaleProvider';
import { ORIGIN, WORK_DAY } from '@/lib/markets';
import { distanceKm, timeIn, hourDiff, formatDiff, overlapWindow } from '@/lib/geo';

/** 24-hour strip showing when the two working days actually meet. */
function OverlapBar({ overlap, t }) {
  const pct = (h) => (Math.min(Math.max(h, 0), 24) / 24) * 100;
  const [vStart, vEnd] = overlap.vineethOnDestAxis;
  // Vineeth's availability can wrap around the destination midnight.
  const bands = [];
  for (const shift of [-24, 0, 24]) {
    const s = vStart + shift;
    const e = vEnd + shift;
    if (e > 0 && s < 24) bands.push([Math.max(s, 0), Math.min(e, 24)]);
  }

  return (
    <div className="ob">
      <div className="obRow">
        <span className="obKey mono">{t('route.yourday')}</span>
        <div className="obTrack">
          <i className="obBand obWork"
             style={{ left: pct(WORK_DAY.open) + '%', width: pct(WORK_DAY.close - WORK_DAY.open) + '%' }} />
        </div>
      </div>
      <div className="obRow">
        <span className="obKey mono">{t('route.hisday')}</span>
        <div className="obTrack">
          {bands.map(([s, e], i) => (
            <i key={i} className="obBand obMine"
               style={{ left: pct(s) + '%', width: pct(e - s) + '%' }} />
          ))}
          {overlap.segments.map(([s, e], i) => (
            <i key={'o' + i} className="obBand obHit"
               style={{ left: pct(s) + '%', width: pct(e - s) + '%' }} />
          ))}
        </div>
      </div>
      <div className="obScale mono" aria-hidden="true">
        <span>00</span><span>06</span><span>12</span><span>18</span><span>24</span>
      </div>
    </div>
  );
}

export default function Routing() {
  const { market, markets, select, t, mounted, autoDetected } = useLocale();
  const [now, setNow] = useState(() => new Date(0));

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const km = distanceKm(ORIGIN, market);
  const diff = mounted ? hourDiff(ORIGIN.tz, market.tz, now) : 0;
  const overlap = mounted ? overlapWindow(ORIGIN, market.tz, WORK_DAY, now) : null;
  const dash = '—:—';

  return (
    <section className="routing">
      <div className="wrap">
        <div className="rgrid">
          <div className="node">
            <div className="lab mono">{t('route.origin')}</div>
            <div className="val"><i className="dot" />{ORIGIN.city}, {ORIGIN.country}</div>
            <div className="sub mono">
              {ORIGIN.lat.toFixed(2)}°N {ORIGIN.lon.toFixed(2)}°E ·{' '}
              <strong>{mounted ? timeIn(ORIGIN.tz, now) : dash}</strong> IST
            </div>
          </div>

          <div className="arc" aria-hidden="true">
            <svg viewBox="0 0 400 44" preserveAspectRatio="none">
              <defs>
                <linearGradient id="routeGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--emerald)" />
                  <stop offset="45%" stopColor="var(--indigo)" />
                  <stop offset="100%" stopColor="var(--rose)" />
                </linearGradient>
              </defs>
              <path className="arcBase" d="M4,26 Q200,0 396,26" />
              <path className="arcLive" d="M4,26 Q200,0 396,26" key={market.id} />
            </svg>
            <div className="arcMeta mono">
              <span>{t('route.dist')} {km.toLocaleString()} km</span>
              <span>{mounted ? formatDiff(diff) : dash}</span>
            </div>
          </div>

          <div className="node nodeEnd">
            <div className="lab mono">{t('route.dest')}</div>
            <div className="picker">
              <i className="dot hollow" />
              <span className="pickVal">{market.name}</span>
              <span className="caret" aria-hidden="true">▾</span>
              <label className="sr" htmlFor="destSelect">{t('route.pick')}</label>
              <select
                id="destSelect"
                value={market.id}
                onChange={(e) => select(e.target.value)}
              >
                {markets.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} — {m.city}</option>
                ))}
              </select>
            </div>
            <div className="sub mono">
              {market.city} · <strong>{mounted ? timeIn(market.tz, now) : dash}</strong>
              {mounted && autoDetected ? <em className="auto"> · {t('route.detected')}</em> : null}
            </div>
          </div>
        </div>

        {overlap ? (
          <div className="overlap">
            <div className="ovHead mono">
              <span>{t('route.overlap')}</span>
              <strong>
                {overlap.hours > 0
                  ? `${overlap.hours}h · ${overlap.label} ${market.city} / ${overlap.originLabel} IST`
                  : t('route.nooverlap')}
              </strong>
            </div>
            <OverlapBar overlap={overlap} t={t} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
