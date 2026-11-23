'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale } from './LocaleProvider';

const SEEN = 'vm-intro';

/** Phase boundaries, in seconds. */
const T_OPEN_FROM = 0.35;
const T_OPEN_TO   = 2.25;   // lid finishes opening
const T_BOOT      = 2.05;   // profile fades up on the panel
const T_PUSH      = 2.95;   // camera moves in toward the panel
const T_END       = 4.25;   // overlay is gone

/**
 * Draws the profile card that appears on the laptop screen. Canvas rather
 * than an image so the text is crisp at any size and follows the language
 * the visitor is actually being served.
 */
function profileCanvas(t) {
  const W = 2048, H = 1280;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d');

  x.fillStyle = '#0b0a12';
  x.fillRect(0, 0, W, H);

  const wash = x.createRadialGradient(W * 0.5, H * 0.3, 0, W * 0.5, H * 0.3, W * 0.75);
  wash.addColorStop(0, 'rgba(124,124,255,0.20)');
  wash.addColorStop(1, 'rgba(124,124,255,0)');
  x.fillStyle = wash;
  x.fillRect(0, 0, W, H);

  x.strokeStyle = 'rgba(255,255,255,0.045)';
  x.lineWidth = 2;
  for (let i = 1; i < 10; i++) {
    x.beginPath(); x.moveTo((W / 10) * i, 0); x.lineTo((W / 10) * i, H); x.stroke();
    x.beginPath(); x.moveTo(0, (H / 7) * i); x.lineTo(W, (H / 7) * i); x.stroke();
  }

  const sans = '"DM Sans","Noto Sans","Noto Sans JP","Noto Sans Devanagari",system-ui,sans-serif';
  const mono = '"IBM Plex Mono",ui-monospace,monospace';
  const PAD = 150;

  x.fillStyle = '#34d399';
  x.beginPath(); x.arc(PAD + 11, 210, 11, 0, Math.PI * 2); x.fill();
  x.font = `500 34px ${mono}`;
  x.fillStyle = '#9b90b0';
  x.letterSpacing = '7px';
  x.fillText(String(t('s.availv')).toUpperCase(), PAD + 44, 222);
  x.letterSpacing = '0px';

  x.fillStyle = '#f6f3fb';
  x.font = `700 124px ${sans}`;
  x.fillText('Vineeth Rao Madasu', PAD, 400);

  x.fillStyle = '#7c7cff';
  x.font = `500 56px ${sans}`;
  x.fillText(t('hero.role'), PAD, 492);

  const rows = [
    [t('s.base'),  'Hyderabad, India'],
    [t('s.stack'), 'Next.js · React · Node · MySQL'],
    [t('s.mode'),  String(t('s.modev'))],
  ];
  let y = 660;
  for (const [k, v] of rows) {
    x.strokeStyle = 'rgba(255,255,255,0.09)';
    x.lineWidth = 2;
    x.beginPath(); x.moveTo(PAD, y - 58); x.lineTo(W - PAD, y - 58); x.stroke();

    x.font = `400 30px ${mono}`;
    x.fillStyle = '#7e7496';
    x.letterSpacing = '5px';
    x.fillText(String(k).toUpperCase(), PAD, y);
    x.letterSpacing = '0px';

    x.font = `500 44px ${sans}`;
    x.fillStyle = '#e8e3f2';
    x.fillText(v, PAD + 520, y);
    y += 128;
  }

  x.strokeStyle = 'rgba(255,255,255,0.09)';
  x.beginPath(); x.moveTo(PAD, y - 58); x.lineTo(W - PAD, y - 58); x.stroke();

  const live = [['indiaunbox.com', '#7c7cff'], ['skilledmba.com', '#2dd4bf']];
  let lx = PAD;
  for (const [hostName, tone] of live) {
    x.fillStyle = tone;
    x.beginPath(); x.arc(lx + 9, y + 44, 9, 0, Math.PI * 2); x.fill();
    x.font = `400 38px ${mono}`;
    x.fillStyle = '#b6adc9';
    x.fillText(hostName, lx + 36, y + 56);
    lx += x.measureText(hostName).width + 150;
  }
  return c;
}

/**
 * Full-screen entrance: a closed laptop that opens, shows the profile, then
 * moves aside for the site. Plays once per session, is always skippable,
 * and does not run at all for visitors who ask for reduced motion.
 */
export default function Intro() {
  const holder = useRef(null);
  const finish = useRef(null);
  const [gone, setGone] = useState(false);
  const [fading, setFading] = useState(false);
  const { t, lang, mounted } = useLocale();

  const end = useCallback(() => {
    if (finish.current) finish.current();
  }, []);

  useEffect(() => {
    if (!mounted || gone) return undefined;

    // already watched it this visit, or motion is unwelcome — straight in
    let seen = false;
    try { seen = sessionStorage.getItem(SEEN) === '1'; } catch {}
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (seen || reduced) { setGone(true); return undefined; }

    let disposed = false;
    let cleanup = () => {};
    document.body.style.overflow = 'hidden';

    const close = () => {
      try { sessionStorage.setItem(SEEN, '1'); } catch {}
      document.body.style.overflow = '';
      setFading(true);
      window.setTimeout(() => setGone(true), 620);
    };
    finish.current = close;

    (async () => {
      let THREE;
      try { THREE = await import('three'); } catch { close(); return; }
      if (disposed || !holder.current) return;

      const host = holder.current;
      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      } catch { close(); return; }

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      if ('outputColorSpace' in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(34, window.innerWidth / window.innerHeight, 0.1, 100);

      const shell = new THREE.MeshStandardMaterial({ color: 0x1a1824, metalness: 0.88, roughness: 0.32 });
      const deckMat = new THREE.MeshStandardMaterial({ color: 0x15131d, metalness: 0.7, roughness: 0.5 });
      const darkMat = new THREE.MeshStandardMaterial({ color: 0x0b0a11, metalness: 0.4, roughness: 0.72 });

      const machine = new THREE.Group();
      scene.add(machine);

      const W = 3.5, D = 2.4;
      const bodyGeo = new THREE.BoxGeometry(W, 0.16, D);
      const body = new THREE.Mesh(bodyGeo, shell);
      body.position.y = 0.08;
      machine.add(body);

      const wellGeo = new THREE.BoxGeometry(W * 0.84, 0.02, D * 0.46);
      const well = new THREE.Mesh(wellGeo, darkMat);
      well.position.set(0, 0.17, -D * 0.17);
      machine.add(well);

      const padGeo = new THREE.BoxGeometry(W * 0.3, 0.015, D * 0.26);
      const pad = new THREE.Mesh(padGeo, deckMat);
      pad.position.set(0, 0.17, D * 0.24);
      machine.add(pad);

      const hinge = new THREE.Group();
      hinge.position.set(0, 0.16, -D / 2);
      machine.add(hinge);

      const lidGeo = new THREE.BoxGeometry(W, 0.1, D * 0.95);
      const lid = new THREE.Mesh(lidGeo, shell);
      lid.position.set(0, 0.05, D * 0.95 / 2);
      hinge.add(lid);

      const tex = new THREE.CanvasTexture(profileCanvas(t));
      if ('colorSpace' in tex) tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy?.() || 1;

      const screenMat = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, transparent: true, opacity: 0 });
      const screenGeo = new THREE.PlaneGeometry(W * 0.92, D * 0.95 * 0.88);
      const screen = new THREE.Mesh(screenGeo, screenMat);
      screen.position.set(0, -0.004, D * 0.95 / 2);
      screen.rotation.x = Math.PI / 2;
      hinge.add(screen);

      const glow = new THREE.PointLight(0x7c7cff, 0, 7, 2);
      glow.position.set(0, 0.82, 0.35);
      machine.add(glow);

      scene.add(new THREE.AmbientLight(0xffffff, 0.45));
      const key = new THREE.DirectionalLight(0xffffff, 2.5);
      key.position.set(-4.5, 6, 5); scene.add(key);
      const rim = new THREE.DirectionalLight(0x7c7cff, 3.6);
      rim.position.set(5.5, 2.4, -4.5); scene.add(rim);
      const fill = new THREE.DirectionalLight(0x2dd4bf, 1.6);
      fill.position.set(-5, 0.6, -4); scene.add(fill);

      function onResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
      window.addEventListener('resize', onResize);

      const OPEN = -1.92;
      const clock = new THREE.Clock();
      let raf = 0;
      let ended = false;

      const ease = (p) => 1 - Math.pow(1 - Math.min(Math.max(p, 0), 1), 3);
      const lerp = (a, b, p) => a + (b - a) * p;

      function frame() {
        raf = requestAnimationFrame(frame);
        const s = clock.getElapsedTime();

        // 1 — the lid comes up
        const op = ease((s - T_OPEN_FROM) / (T_OPEN_TO - T_OPEN_FROM));
        hinge.rotation.x = OPEN * op;

        // 2 — the panel lights and the profile resolves
        const boot = ease((s - T_BOOT) / 0.75);
        screenMat.opacity = boot;
        glow.intensity = boot * 2.4;

        // 3 — square up to the viewer and move in
        const push = ease((s - T_PUSH) / (T_END - T_PUSH));
        machine.rotation.y = lerp(-0.5, 0, push);
        machine.rotation.x = lerp(0.08, 0, push);
        machine.position.y = lerp(-0.42, -0.86, push);

        camera.position.set(0, lerp(1.1, 0.92, push), lerp(10.2, 3.15, ease(s / T_END)));
        camera.lookAt(0, lerp(0.46, 0.92, push), 0);

        renderer.render(scene, camera);

        if (!ended && s >= T_END) { ended = true; close(); }
      }
      frame();

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('resize', onResize);
        [bodyGeo, wellGeo, padGeo, lidGeo, screenGeo].forEach((g) => g.dispose());
        [shell, deckMat, darkMat, screenMat].forEach((m) => m.dispose());
        tex.dispose();
        renderer.dispose();
        if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
      };
    })();

    return () => {
      disposed = true;
      document.body.style.overflow = '';
      cleanup();
    };
  }, [mounted, gone, t, lang]);

  // let the keyboard out of it too
  useEffect(() => {
    if (gone) return undefined;
    const onKey = (e) => { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') end(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [gone, end]);

  if (gone) return null;

  return (
    <div className={`intro${fading ? ' out' : ''}`} role="presentation">
      <div className="introStage" ref={holder} />
      <button type="button" className="introSkip mono" onClick={end}>
        {t('ui.skip')}
      </button>
    </div>
  );
}
