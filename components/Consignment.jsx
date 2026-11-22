'use client';

import { useLocale } from './LocaleProvider';

export default function Consignment({ index, id, name, href, image, alt, prefix, reverse }) {
  const { t } = useLocale();
  const specs = [1, 2, 3, 4].map((n) => [t(`${prefix}.k${n}`), t(`${prefix}.v${n}`)]);
  const shot = (
    <a className="shot" href={href} target="_blank" rel="noopener noreferrer">
      <div className="shotBar mono">
        <span>{id}</span>
        <span className="live"><i />LIVE</span>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt={alt} width={1536} height={674} loading="lazy" />
    </a>
  );
  const body = (
    <div>
      <div className="cname">{name}</div>
      <div className="cwhat">{t(`${prefix}.what`)}</div>
      <p className="bd">{t(`${prefix}.p1`)}</p>
      <p className="bd">{t(`${prefix}.p2`)}</p>
      <ul className="spec">
        {specs.map(([k, v]) => (
          <li key={k}><span className="mono">{k}</span><span>{v}</span></li>
        ))}
      </ul>
      <div className="chiprow">
        {['Next.js', 'React', 'MySQL', 'API', 'Auth', 'SEO'].map((c) => (
          <span className="ch" key={c}>{c}</span>
        ))}
      </div>
      <a className="open" href={href} target="_blank" rel="noopener noreferrer">
        {t('ui.open')} {id}
      </a>
    </div>
  );

  return (
    <section className="sec deep">
      <div className="wrap">
        <div className="shead">
          <span className="snum mono">{index}</span>
          <span className="sttl mono">{t('sec.cons')}</span>
        </div>
        <div className="cons">
          {reverse ? body : shot}
          {reverse ? shot : body}
        </div>
      </div>
    </section>
  );
}
