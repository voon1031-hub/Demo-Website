import { useEffect } from 'react';
import { useContent } from './content';
import { ScrollTrigger } from './lib/gsap';
import { startLenis, stopLenis } from './lib/lenis';
import { Nav } from './components/Nav';
import { PendingSection } from './components/PendingSection';
import { Hero } from './sections/Hero';
import { Ocean } from './sections/Ocean';

export default function App() {
  const t = useContent();
  const label = (id: string) => t.nav.links.find((l) => l.id === id)?.label ?? id;

  useEffect(() => {
    startLenis();
    // Web fonts change text metrics; recompute trigger positions once they land.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => stopLenis();
  }, []);

  return (
    <>
      <Nav />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <PendingSection id="about" label={label('about')} />
        <PendingSection id="air" label={label('air')} />
        <Ocean />
        <PendingSection id="land" label={label('land')} />
        <PendingSection id="network" label={label('network')} />
        <PendingSection id="process" label={label('process')} />
        <PendingSection id="why" label={label('why')} />
        <PendingSection id="contact" label="Contact" />
      </main>
    </>
  );
}
