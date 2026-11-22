'use client';

import { useLocale } from './LocaleProvider';
import { PROFILES } from '@/lib/links';

export default function Profiles() {
  const { t } = useLocale();
  return (
    <section className="sec" id="profiles">
      <div className="wrap">
        <div className="shead">
          <span className="snum mono">05</span>
          <span className="sttl mono">{t('sec.pf')}</span>
        </div>
        <div className="plist">
          {PROFILES.map((p) => (
            <a className="prow" key={p.name} href={p.href} target="_blank" rel="noopener noreferrer">
              <span>
                <span className="pname">{p.name}</span>
                <span className="phandle">{p.handle || t(p.handleKey)}</span>
              </span>
              <span className="pgo" aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
