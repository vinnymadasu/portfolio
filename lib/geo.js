/** Great-circle distance in kilometres. */
export function distanceKm(a, b) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(s)));
}

/** Minutes a timezone is offset from UTC at `date` (DST-aware). */
export function offsetMinutes(tz, date = new Date()) {
  const p = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  }).formatToParts(date);
  const o = {};
  for (const x of p) o[x.type] = x.value;
  const asUTC = Date.UTC(+o.year, +o.month - 1, +o.day, +o.hour % 24, +o.minute);
  return Math.round((asUTC - date.getTime()) / 60000);
}

/** Current wall-clock time in a timezone, as "HH:MM". */
export function timeIn(tz, date = new Date()) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(date);
}

/** Difference destination − origin, in hours (may be fractional). */
export function hourDiff(originTz, destTz, date = new Date()) {
  return (offsetMinutes(destTz, date) - offsetMinutes(originTz, date)) / 60;
}

export function formatDiff(h) {
  if (h === 0) return 'same time';
  const sign = h > 0 ? '+' : '−';
  const abs = Math.abs(h);
  const hh = Math.floor(abs);
  const mm = Math.round((abs - hh) * 60);
  return `${sign}${hh}${mm ? ':' + String(mm).padStart(2, '0') : ''}h`;
}

const wrap = (h) => ((h % 24) + 24) % 24;
const hhmm = (h) => {
  const w = wrap(h);
  const hh = Math.floor(w);
  const mm = Math.round((w - hh) * 60);
  return `${String(hh).padStart(2, '0')}:${String(mm === 60 ? 0 : mm).padStart(2, '0')}`;
};

/**
 * Overlap between Vineeth's available hours and the destination's working day.
 * All inputs in local wall-clock hours; returns segments on a 0–24 destination-local axis.
 */
export function overlapWindow(origin, destTz, workDay, date = new Date()) {
  const diff = hourDiff(origin.tz, destTz, date);
  // Vineeth's window expressed in destination-local hours
  const vStart = origin.open + diff;
  const vEnd = origin.close + diff;
  const segs = [];
  // His window can straddle midnight on the destination axis; split it.
  for (const shift of [-24, 0, 24]) {
    const s = Math.max(vStart + shift, workDay.open);
    const e = Math.min(vEnd + shift, workDay.close);
    if (e > s) segs.push([s, e]);
  }
  const hours = segs.reduce((n, [s, e]) => n + (e - s), 0);
  return {
    diff,
    hours: Math.round(hours * 10) / 10,
    segments: segs,
    // Human-readable overlap in both local clocks
    label: segs.length
      ? segs.map(([s, e]) => `${hhmm(s)}–${hhmm(e)}`).join(', ')
      : null,
    originLabel: segs.length
      ? segs.map(([s, e]) => `${hhmm(s - diff)}–${hhmm(e - diff)}`).join(', ')
      : null,
    vineethOnDestAxis: [vStart, vEnd],
  };
}

/** Pick the market whose timezone best matches the visitor's. */
export function detectMarket(markets, tz = null) {
  let zone = tz;
  try { zone = zone || Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { zone = null; }
  if (!zone) return null;
  const exact = markets.find((m) => m.tz === zone);
  if (exact) return exact;
  const region = zone.split('/')[0];
  let best = null, bestGap = Infinity;
  const mine = offsetMinutes(zone);
  for (const m of markets) {
    const gap = Math.abs(offsetMinutes(m.tz) - mine);
    const sameRegion = m.tz.split('/')[0] === region;
    const score = gap - (sameRegion ? 90 : 0);
    if (score < bestGap) { bestGap = score; best = m; }
  }
  return bestGap <= 180 ? best : null;
}
