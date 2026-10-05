import { cn } from "@/lib/cn";

/**
 * A label whose letters roll up one after another when the nearest `.group`
 * ancestor is hovered or focused. A copy of each letter waits below and takes
 * its place, so the word never disappears.
 */
export function RollText({ text, className }: { text: string; className?: string }) {
  const letters = Array.from(text);

  return (
    <span className={cn("relative inline-flex overflow-hidden leading-[1.25]", className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="inline-flex">
        {letters.map((letter, i) => {
          const glyph = letter === " " ? " " : letter;
          return (
            <span
              key={i}
              className="relative inline-block transition-transform duration-[650ms] ease-in-out-quart group-hover:-translate-y-full group-focus-visible:-translate-y-full"
              style={{ transitionDelay: `${i * 16}ms` }}
            >
              <span className="block">{glyph}</span>
              <span className="absolute inset-x-0 top-full block">{glyph}</span>
            </span>
          );
        })}
      </span>
    </span>
  );
}
