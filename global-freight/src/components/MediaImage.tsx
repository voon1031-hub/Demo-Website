import { media, type MediaKey } from '../config/media';

type Props = {
  slot: MediaKey;
  /** CSS sizes attribute, describing the rendered width. */
  sizes: string;
  className?: string;
  imgClassName?: string;
  /** Load eagerly (only for images visible on first paint). */
  priority?: boolean;
};

const WIDTHS = [640, 960, 1440, 2000];
const showSlotIds =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('media');

function buildSrc(src: string, width: number) {
  if (src.startsWith('/')) return src;
  return `${src}?w=${width}&q=70&auto=format&fit=crop`;
}

/**
 * One image slot from config/media.ts, with the shared photo grade.
 * The slot id and brief sit underneath the image, so an empty or failed
 * slot still says what belongs there.
 */
export function MediaImage({ slot, sizes, className = '', imgClassName = '', priority }: Props) {
  const item = media[slot];
  const isRemote = !item.src.startsWith('/');

  return (
    <figure className={`media-frame ${className}`} data-media-id={item.id}>
      <figcaption className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-[14%] text-center text-sm text-chart/80" aria-hidden="true">
        <span className="type-data text-fog/70">{item.id}</span>
        <span className="max-w-[40ch] leading-snug">{item.brief}</span>
      </figcaption>
      <img
        className={`relative ${imgClassName}`}
        src={buildSrc(item.src, 1440)}
        srcSet={isRemote ? WIDTHS.map((w) => `${buildSrc(item.src, w)} ${w}w`).join(', ') : undefined}
        sizes={isRemote ? sizes : undefined}
        alt={item.alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        // Hide the broken-image glyph so the labelled fallback shows through.
        onError={(e) => (e.currentTarget.style.visibility = 'hidden')}
      />
      <span className="media-tint" aria-hidden="true" />
      {showSlotIds && (
        <span className="type-data absolute left-3 top-3 z-10 rounded bg-signal px-2 py-1 text-sm text-navy">
          {item.id} · {item.size}
        </span>
      )}
    </figure>
  );
}
