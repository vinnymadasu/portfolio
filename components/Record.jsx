'use client';

import { useLocale } from './LocaleProvider';

const ROLES = [
  { when: '2026.07 —', key: 'r1', org: null },
  { when: '2024.12 — 2026.07', key: 'r2', org: 'Collegedunia' },
  { when: '2024.08 — 2024.12', key: 'r3', org: 'Startek India' },
  { when: '2020.09 — 2024.07', key: 'r4', org: 'VSAT Analytics' },
];

export default function Record() {
  const { t } = useLocale();
  return (
    <section style={{ '--sc': 'var(--violet)' }} className="sec" id="record">
      <div className="wrap">
        <div className="shead">
          <span className="snum mono">04</span>
          <span className="sttl mono">{t('sec.rec')}</span>
        </div>
        <h2 className="h2narrow">{t('rec.h')}</h2>

        <div className="rec">
          {ROLES.map((r) => (
            <div className="rrow" key={r.key}>
              <div className="rwhen mono">{r.when === '2026.07 —' ? `2026.07 — ${t('ui.now')}` : r.when}</div>
              <div>
                <h4>{t(`${r.key}.t`)}</h4>
                <div className="rorg">{r.org || t('r1.o')}</div>
                <p>{t(`${r.key}.p`)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="cols3">
          <div><h5 className="mono">{t('c.front')}</h5><p>Next.js<br />React<br />JavaScript<br />HTML, CSS</p></div>
          <div><h5 className="mono">{t('c.back')}</h5><p>Node.js · API routes<br />MySQL · {t('c.schema')}<br />SQL<br />Python</p></div>
          <div><h5 className="mono">{t('c.edu')}</h5><p dangerouslySetInnerHTML={{ __html: t('c.eduv') }} /></div>
        </div>

        <p className="note"><b>{t('note.b')}</b> {t('note.t')}</p>
      </div>
    </section>
  );
}
