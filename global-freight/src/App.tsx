import { useEffect, useRef, useState } from 'react';
import { startLenis, stopLenis } from './lib/lenis';
import { Nav } from './components/Nav';
import { Footer } from './components/Footer';
import { Hero } from './sections/Hero';
import { Ocean } from './sections/Ocean';
import { Air } from './sections/Air';
import { Land } from './sections/Land';
import { About } from './sections/About';
import { Network } from './sections/Network';
import { Process } from './sections/Process';
import { WhyUs } from './sections/WhyUs';
import { Contact } from './sections/Contact';

/** Page order below the hero: the scroll scenes, then the lighter closing sections. */
const SCENES = [About, Air, Ocean, Land];
const CLOSING = [Network, Process, WhyUs, Contact];

export default function App() {
  // Hero first. The scroll scenes then mount one per idle moment, so each
  // one's setup is its own short task instead of one long block. The closing
  // sections mount when the visitor gets within a screen and a half of them,
  // keeping their setup out of the first seconds after load.
  const [mountedScenes, setMountedScenes] = useState(0);
  const scenes = mountedScenes >= SCENES.length;
  const [closing, setClosing] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scenes) return;
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 80));
    const id = idle(() => setMountedScenes((n) => n + 1));
    return () => (window.cancelIdleCallback ?? window.clearTimeout)(id);
  }, [mountedScenes, scenes]);

  useEffect(() => {
    if (!scenes || !sentinel.current) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setClosing(true), { rootMargin: '150% 0px' });
    io.observe(sentinel.current);
    return () => io.disconnect();
  }, [scenes]);

  useEffect(() => {
    if (!scenes) return;
    startLenis();
    // No re-measure when web fonts land: the early scenes are fixed screen
    // height, so font metrics can't move their triggers, and the text-heavy
    // closing sections mount later, after the font has loaded.
    return () => stopLenis();
  }, [scenes]);

  return (
    <>
      <Nav ready={closing} />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        {SCENES.slice(0, mountedScenes).map((Section, i) => (
          <Section key={i} />
        ))}
        {scenes && !closing && <div ref={sentinel} aria-hidden="true" className="h-svh" />}
        {closing && CLOSING.map((Section, i) => <Section key={i} />)}
      </main>
      {closing && <Footer />}
    </>
  );
}
