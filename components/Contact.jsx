'use client';

import { useState } from 'react';
import { useLocale } from './LocaleProvider';
import { MAIL } from '@/lib/links';

export default function Contact() {
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(MAIL);
    } catch {
      /* clipboard unavailable — the address is visible anyway */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <section className="sec" id="contact">
      <div className="wrap">
        <div className="shead">
          <span className="snum mono">06</span>
          <span className="sttl mono">{t('sec.ct')}</span>
        </div>
        <h2 className="h2narrow">{t('ct.h')}</h2>
        <p className="bd">{t('ct.p')}</p>
        <div className="mailrow">
          <a className="mailbig" href={`mailto:${MAIL}`}>{MAIL}</a>
          <button type="button" className="copy" onClick={copy}>
            {copied ? '✓' : t('ui.copy')}
          </button>
        </div>
      </div>
      <div className="wrap">
        <div className="foot mono">
          <span>VINEETH RAO MADASU · HYDERABAD, IN</span>
          <span>{t('ui.press')} <kbd>⌘K</kbd></span>
        </div>
      </div>
    </section>
  );
}
