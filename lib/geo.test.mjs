// Plain-Node tests for the pure geo/time logic:  node lib/geo.test.mjs
import { ORIGIN, MARKETS, WORK_DAY, marketById } from './markets.js';
import { distanceKm, timeIn, hourDiff, formatDiff, overlapWindow, detectMarket } from './geo.js';

let fail = 0;
const ok = (cond, msg) => { if (!cond) { console.error('FAIL:', msg); fail++; } };

ok(distanceKm(ORIGIN, marketById('in')) === 0, 'Hyderabad to itself is 0 km');
const london = distanceKm(ORIGIN, marketById('uk'));
ok(london > 7500 && london < 7900, `Hyderabad→London ≈7720km, got ${london}`);
const tokyo = distanceKm(ORIGIN, marketById('jp'));
ok(tokyo > 6000 && tokyo < 6600, `Hyderabad→Tokyo ≈6310km, got ${tokyo}`);

ok(formatDiff(0) === 'same time', 'zero offset label');
ok(formatDiff(-10.5).includes('10:30'), `half-hour offsets format, got ${formatDiff(-10.5)}`);

const india = overlapWindow(ORIGIN, 'Asia/Kolkata', WORK_DAY);
ok(india.hours === WORK_DAY.close - WORK_DAY.open, `same timezone = full day, got ${india.hours}`);
const berlin = overlapWindow(ORIGIN, 'Europe/Berlin', WORK_DAY);
ok(berlin.hours >= 4, `Berlin should overlap substantially, got ${berlin.hours}`);
for (const m of MARKETS) {
  const o = overlapWindow(ORIGIN, m.tz, WORK_DAY);
  ok(o.hours >= 0 && o.hours <= 24, `${m.name} overlap in range`);
  ok(typeof timeIn(m.tz) === 'string', `${m.name} clock renders`);
}

ok(detectMarket(MARKETS, 'Europe/Berlin')?.id === 'de', 'detect Berlin → Deutschland');
ok(detectMarket(MARKETS, 'Asia/Kolkata')?.id === 'in', 'detect Kolkata → भारत');
ok(detectMarket(MARKETS, 'America/Los_Angeles')?.id === 'us', 'detect LA → United States');

console.log(fail ? `${fail} test(s) failed` : 'all geo tests passed');
process.exit(fail ? 1 : 0);
