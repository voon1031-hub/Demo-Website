import { useEffect } from 'react';
import { useContent } from './content';
import { brand } from './config/brand';
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
        <PendingSection id="about" label={label('about')} slot="aboutCrane" />
        <PendingSection id="air" label={label('air')} slot="airFreighter" />
        <Ocean />
        <PendingSection id="land" label={label('land')} slot="landRoad" />
        <PendingSection id="network" label={label('network')} />
        <PendingSection id="process" label={label('process')} />
        <PendingSection id="why" label={label('why')} />
        <PendingSection id="contact" label={t.contact.heading}>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-chart">{t.contact.email}</dt>
              <dd>
                <a className="type-heading text-lg underline decoration-signal underline-offset-4 hover:text-signal" href={`mailto:${brand.contact.email}`}>
                  {brand.contact.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-chart">{t.contact.whatsapp}</dt>
              <dd>
                <a
                  className="type-heading text-lg underline decoration-signal underline-offset-4 hover:text-signal"
                  href={`https://wa.me/${brand.contact.whatsapp.intl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {brand.contact.whatsapp.display}
                </a>
              </dd>
            </div>
          </dl>
        </PendingSection>
      </main>
    </>
  );
}
