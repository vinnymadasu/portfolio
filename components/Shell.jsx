'use client';

import { useCallback, useEffect, useState } from 'react';
import TopBar from './TopBar';
import Routing from './Routing';
import Finder from './Finder';
import Consignment from './Consignment';
import Record from './Record';
import Profiles from './Profiles';
import Contact from './Contact';
import CommandPalette from './CommandPalette';
import { useLocale } from './LocaleProvider';

export default function Shell() {
  const { t } = useLocale();
  const [palOpen, setPalOpen] = useState(false);
  const openPalette = useCallback(() => setPalOpen(true), []);
  const closePalette = useCallback(() => setPalOpen(false), []);

  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPalOpen((v) => !v);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <TopBar onOpenPalette={openPalette} />
      <Routing />

      <header className="hero">
        <div className="wrap">
          <h1 dangerouslySetInnerHTML={{ __html: t('hero.h') }} />
          <p className="heroSub">{t('hero.sub')}</p>
          <div className="strip">
            <div className="cellx"><div className="k mono">{t('s.base')}</div><div className="v">Hyderabad, India</div></div>
            <div className="cellx"><div className="k mono">{t('s.avail')}</div><div className="v">{t('s.availv')}</div></div>
            <div className="cellx"><div className="k mono">{t('s.stack')}</div><div className="v">Next.js · React · MySQL</div></div>
            <div className="cellx"><div className="k mono">{t('s.mode')}</div><div className="v">{t('s.modev')}</div></div>
          </div>
        </div>
      </header>

      <div id="work">
        <Consignment
          index="01" id="indiaunbox.com" name="IndiaUnbox" prefix="iu"
          href="https://indiaunbox.com" image="indiaunbox.jpg"
          alt="IndiaUnbox homepage showing a live sourcing order moving through verification stages"
        />
      </div>
      <Consignment
        index="02" id="skilledmba.com" name="SkilledMBA" prefix="sm" reverse
        href="https://skilledmba.com" image="skilledmba.jpg"
        alt="SkilledMBA homepage showing search and subject filters over a catalogue of AI tools"
      />

      <Finder />
      <Record />
      <Profiles />
      <Contact />

      <CommandPalette open={palOpen} onClose={closePalette} />
    </>
  );
}
