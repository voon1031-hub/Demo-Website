import { useEffect, useRef } from 'react';
import { media, type MediaKey, type MediaSlot } from '../config/media';
import { prefersReducedMotion } from '../lib/gsap';

type Props = {
  slot: MediaKey;
  className?: string;
};

const showSlotIds =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('media');

/** Video only plays when motion is welcome and the visitor isn't saving data. */
function canPlayVideo() {
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
  return !prefersReducedMotion() && !saveData;
}

/**
 * One media slot from config/media.ts with the shared photo grade.
 * The poster shows first; the looping video is attached only when the frame
 * comes near the viewport, and pauses again when it leaves.
 */
export function MediaFrame({ slot, className = '' }: Props) {
  const item: MediaSlot = media[slot];
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !item.video || !canPlayVideo()) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!video.src) video.src = item.video!;
          video.play().catch(() => {
            /* Autoplay refused: the poster stays, which is fine. */
          });
        } else if (video.src) {
          video.pause();
        }
      },
      { rootMargin: '300px' },
    );
    io.observe(video);
    return () => io.disconnect();
  }, [item.video]);

  return (
    <figure className={`media-frame ${className}`} data-media-id={item.id}>
      <figcaption className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-[14%] text-center text-sm text-chart/80" aria-hidden="true">
        <span className="type-data text-fog/70">{item.id}</span>
        <span className="max-w-[40ch] leading-snug">{item.brief}</span>
      </figcaption>
      <img
        className="relative"
        src={item.poster}
        alt={item.alt}
        loading="lazy"
        decoding="async"
        onError={(e) => (e.currentTarget.style.visibility = 'hidden')}
      />
      {item.video && (
        <video
          ref={videoRef}
          className="absolute inset-0"
          poster={item.poster}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          tabIndex={-1}
        />
      )}
      <span className="media-tint" aria-hidden="true" />
      {showSlotIds && (
        <span className="type-data absolute left-3 top-3 z-10 rounded bg-signal px-2 py-1 text-sm text-navy">
          {item.id} · {item.size}
        </span>
      )}
    </figure>
  );
}
