import { useEffect, useState } from 'react';
import { ScrollTrigger } from '../lib/gsap';
import type { SectionId } from '../content';

/** Tracks which section crosses the middle of the viewport, for nav highlighting. */
export function useActiveSection(ids: SectionId[]) {
  const [active, setActive] = useState<SectionId | null>(null);

  useEffect(() => {
    const triggers = ids.flatMap((id) => {
      const el = document.getElementById(id);
      if (!el) return [];
      return ScrollTrigger.create({
        trigger: el,
        start: 'top 50%',
        end: 'bottom 50%',
        onToggle: (self) => self.isActive && setActive(id),
      });
    });
    return () => triggers.forEach((t) => t.kill());
  }, [ids]);

  return active;
}
