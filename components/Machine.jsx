'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale } from './LocaleProvider';

const base = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** The two live products, shown in turn on the laptop screen. */
const SCREENS = [
  { id: 'indiaunbox', host: 'indiaunbox.com', file: 'indiaunbox.jpg', tone: 0x7c7cff },
  { id: 'skilledmba', host: 'skilledmba.com', file: 'skilledmba.jpg', tone: 0x2dd4bf },
];

/**
 * A laptop, modelled and lit in WebGL, that opens as the page loads and
 * shows the two products that are actually live. Everything three.js is
 * loaded inside the effect, so it never runs on the server and never
 * lands in the first bundle.
 */
export default function Machine() {
  const mount = useRef(null);
  const [shown, setShown] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      let THREE;
      try {
        THREE = await import('three');
      } catch {
        return; // no three, no scene — the page is complete without it
      }
      if (disposed || !mount.current) return;

      const host = mount.current;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // ---- renderer ------------------------------------------------------
      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      } catch {
        return; // no WebGL on this machine
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(host.clientWidth, host.clientHeight);
      if ('outputColorSpace' in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(32, host.clientWidth / host.clientHeight, 0.1, 100);
      camera.position.set(0, 1.45, 9.4);
      camera.lookAt(0, 0.15, 0);

      // ---- materials -----------------------------------------------------
      const shell = new THREE.MeshStandardMaterial({ color: 0x1a1824, metalness: 0.86, roughness: 0.34 });
      const deck = new THREE.MeshStandardMaterial({ color: 0x15131d, metalness: 0.7, roughness: 0.5 });
      const dark = new THREE.MeshStandardMaterial({ color: 0x0b0a11, metalness: 0.4, roughness: 0.7 });

      // ---- the machine ---------------------------------------------------
      const machine = new THREE.Group();
      scene.add(machine);

      const W = 3.5, D = 2.4;

      const bodyGeo = new THREE.BoxGeometry(W, 0.16, D);
      const body = new THREE.Mesh(bodyGeo, shell);
      body.position.y = 0.08;
      machine.add(body);

      // keyboard well and trackpad, so the deck is not a blank slab
      const wellGeo = new THREE.BoxGeometry(W * 0.84, 0.02, D * 0.46);
      const well = new THREE.Mesh(wellGeo, dark);
      well.position.set(0, 0.17, -D * 0.17);
      machine.add(well);

      const padGeo = new THREE.BoxGeometry(W * 0.3, 0.015, D * 0.26);
      const pad = new THREE.Mesh(padGeo, deck);
      pad.position.set(0, 0.17, D * 0.24);
      machine.add(pad);

      // the lid pivots on the back edge of the body
      const hinge = new THREE.Group();
      hinge.position.set(0, 0.16, -D / 2);
      machine.add(hinge);

      const lidGeo = new THREE.BoxGeometry(W, 0.1, D * 0.95);
      const lid = new THREE.Mesh(lidGeo, shell);
      lid.position.set(0, 0.05, -D * 0.95 / 2);
      hinge.add(lid);

      // ---- the screen ------------------------------------------------------
      const loader = new THREE.TextureLoader();
      const textures = SCREENS.map(({ file }) => {
        const tx = loader.load(`${base}/${file}`);
        if ('colorSpace' in tx) tx.colorSpace = THREE.SRGBColorSpace;
        return tx;
      });

      // MeshBasic so the panel reads as emitting light rather than catching it
      const screenMat = new THREE.MeshBasicMaterial({ map: textures[0], toneMapped: false });
      const screenGeo = new THREE.PlaneGeometry(W * 0.92, D * 0.95 * 0.88);
      const screen = new THREE.Mesh(screenGeo, screenMat);
      screen.position.set(0, 0.052, -D * 0.95 / 2);
      screen.rotation.x = -Math.PI / 2;
      hinge.add(screen);

      // light spilling off the panel onto the deck
      const glow = new THREE.PointLight(SCREENS[0].tone, 0, 6, 2);
      glow.position.set(0, 0.9, -0.5);
      machine.add(glow);

      // ---- lighting --------------------------------------------------------
      scene.add(new THREE.AmbientLight(0xffffff, 0.5));

      const key = new THREE.DirectionalLight(0xffffff, 2.6);
      key.position.set(-4.5, 6, 5);
      scene.add(key);

      const rim = new THREE.DirectionalLight(0x7c7cff, 3.4);
      rim.position.set(5.5, 2.4, -4.5);
      scene.add(rim);

      const fill = new THREE.DirectionalLight(0x2dd4bf, 1.5);
      fill.position.set(-5, 0.6, -4);
      scene.add(fill);

      // ---- interaction -----------------------------------------------------
      const target = { x: 0, y: 0 };
      const eased = { x: 0, y: 0 };
      function onPointer(e) {
        const r = host.getBoundingClientRect();
        target.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
        target.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
      }
      function onLeave() { target.x = 0; target.y = 0; }
      host.addEventListener('pointermove', onPointer);
      host.addEventListener('pointerleave', onLeave);

      function onResize() {
        if (!host.clientWidth) return;
        camera.aspect = host.clientWidth / host.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(host.clientWidth, host.clientHeight);
      }
      const ro = new ResizeObserver(onResize);
      ro.observe(host);

      // pause when scrolled away — no reason to burn a GPU on an unseen canvas
      let visible = true;
      const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.01 });
      io.observe(host);

      // ---- animation --------------------------------------------------------
      const OPEN = -1.92;                 // radians: lid fully open
      const clock = new THREE.Clock();
      let swapAt = 6.5;
      let current = 0;
      let raf = 0;

      if (reduced) { hinge.rotation.x = OPEN; glow.intensity = 2.2; }

      setReady(true);

      function frame() {
        raf = requestAnimationFrame(frame);
        if (!visible) return;

        const t = clock.getElapsedTime();

        if (!reduced) {
          // the lid swings open once, easing out over the first 1.9s
          const p = Math.min(t / 1.9, 1);
          const e = 1 - Math.pow(1 - p, 3);
          hinge.rotation.x = OPEN * e;
          glow.intensity = 2.2 * Math.max(0, (p - 0.45) / 0.55);
          camera.position.z = 9.4 - 3.1 * e;
          camera.lookAt(0, 0.15, 0);

          // swap which product is on screen
          if (t > swapAt) {
            current = (current + 1) % SCREENS.length;
            screenMat.map = textures[current];
            screenMat.needsUpdate = true;
            glow.color.setHex(SCREENS[current].tone);
            setShown(current);
            swapAt = t + 6.5;
          }
        }

        // drift, plus a gentle lean toward the pointer
        eased.x += (target.x - eased.x) * 0.045;
        eased.y += (target.y - eased.y) * 0.045;
        machine.rotation.y = -0.44 + eased.x * 0.34 + (reduced ? 0 : Math.sin(t * 0.3) * 0.05);
        machine.rotation.x = 0.07 + eased.y * 0.12;
        machine.position.y = reduced ? -0.3 : -0.3 + Math.sin(t * 0.55) * 0.045;

        renderer.render(scene, camera);
      }
      frame();

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        io.disconnect();
        host.removeEventListener('pointermove', onPointer);
        host.removeEventListener('pointerleave', onLeave);
        [bodyGeo, wellGeo, padGeo, lidGeo, screenGeo].forEach((g) => g.dispose());
        [shell, deck, dark, screenMat].forEach((m) => m.dispose());
        textures.forEach((tx) => tx.dispose());
        renderer.dispose();
        if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
      };
    })();

    return () => { disposed = true; cleanup(); };
  }, []);

  return (
    <section className="stage" aria-hidden="true">
      <div className="stageCanvas" ref={mount} />
      <div className={`stageCap mono${ready ? ' on' : ''}`}>
        <span className="stageDot" style={{ '--d': shown === 0 ? 'var(--indigo)' : 'var(--teal)' }} />
        {SCREENS[shown].host}
      </div>
    </section>
  );
}
