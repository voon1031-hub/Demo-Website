import { useEffect, useState } from 'react';
import type { SectionId } from '../content';

/**
 * Tracks which section crosses the middle of the viewport, for nav
 * highlighting. Uses an IntersectionObserver on a one-pixel band at the
 * centre of the screen rather than precomputed scroll positions, so pinned
 * scenes and sections that mount later can't leave it with stale offsets.
 * `ready` re-runs it once late sections exist.
 */
export function useActiveSection(ids: SectionId[], ready = true) {
  const [active, setActive] = useState<SectionId | null>(null);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id as SectionId);
      },
      { rootMargin: '-50% 0px -50% 0px' },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [ids, ready]);

  return active;
}
