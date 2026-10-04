import type { ReactNode } from 'react';
import { useContent, type SectionId } from '../content';
import type { MediaKey } from '../config/media';
import { MediaFrame } from './MediaFrame';

/**
 * Placeholder block for sections scheduled for the next round. When a media
 * slot is given, its footage plays in the block so it can be reviewed in context.
 */
export function PendingSection({
  id,
  label,
  slot,
  children,
}: {
  id: SectionId;
  label: string;
  slot?: MediaKey;
  children?: ReactNode;
}) {
  const t = useContent();
  return (
    <section id={id} tabIndex={-1} aria-labelledby={`${id}-title`} className="px-4 py-24 sm:px-8">
      <div className="relative mx-auto flex min-h-[40vh] max-w-6xl flex-col items-start justify-end gap-3 overflow-hidden rounded-2xl border border-dashed border-chart/30 p-8 sm:min-h-[60vh] sm:p-12">
        {slot && <MediaFrame slot={slot} className="!absolute inset-0 opacity-80" />}
        <div className="relative">
          <h2 id={`${id}-title`} className="type-heading text-2xl text-fog">
            {label}
          </h2>
          <p className="mt-2 text-fog/80">
            {t.pending.title}. {t.pending.note}
          </p>
          {children}
        </div>
      </div>
    </section>
  );
}
