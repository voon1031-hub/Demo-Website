import { useContent, type SectionId } from '../content';

/** Placeholder block for sections scheduled for the next round. */
export function PendingSection({ id, label }: { id: SectionId; label: string }) {
  const t = useContent();
  return (
    <section id={id} tabIndex={-1} aria-labelledby={`${id}-title`} className="px-4 py-24 sm:px-8">
      <div className="mx-auto flex min-h-[40vh] max-w-6xl flex-col items-start justify-center gap-3 rounded-2xl border border-dashed border-chart/30 p-8 sm:p-12">
        <h2 id={`${id}-title`} className="type-heading text-2xl text-fog/80">
          {label}
        </h2>
        <p className="text-chart">
          {t.pending.title}. {t.pending.note}
        </p>
      </div>
    </section>
  );
}
