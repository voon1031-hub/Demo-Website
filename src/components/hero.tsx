"use client";

import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useLayoutEffect, useRef } from "react";
import { site } from "@/content/site";
import { ease, riseSpring } from "@/lib/motion";
import { LinkButton, MagneticButton } from "./ui/button";

/** The page-load sequence, in seconds: light first, then the horizon, then the name rises over it. */
const T = { glow: 0, line: 0.1, name: 0.45, role: 0.95, pitch: 1.15, actions: 1.3 };

export function Hero() {
  const section = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end start"] });

  // Scrolling away is the same scene in reverse: the name sets below the
  // horizon and the light fades with it, while the text above drifts off faster.
  const glowOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const glowScale = useTransform(scrollYProgress, [0, 0.7], [1, reduce ? 1 : 0.5]);
  const roleY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -110]);
  const fade = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={section} id="top" aria-label="Introduction" className="relative isolate flex min-h-svh flex-col overflow-hidden">
      <div className="shell flex flex-1 flex-col pb-10 pt-28 md:pb-14 md:pt-36">
        <motion.div
          style={{ y: roleY, opacity: fade }}
          className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-8"
        >
          <SplitWords
            text={site.role}
            delay={T.role}
            className="max-w-[17ch] text-[1.375rem] font-medium leading-[1.2] tracking-[-0.015em] text-chalk [font-stretch:112%] md:text-[1.75rem]"
          />
          <motion.p
            data-reveal=""
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: ease.outQuint, delay: T.role + 0.25 }}
            className="type-meta flex items-center gap-2.5 text-ash md:pt-2"
          >
            <span aria-hidden="true" className="size-1.5 rounded-full bg-dusk shadow-[0_0_10px_2px_rgb(211_162_122/0.5)]" />
            {site.availability}
          </motion.p>
        </motion.div>

        <div className="relative mt-auto pt-20">
          <Dawn opacity={glowOpacity} scale={glowScale} />
          <HeroName text={site.name} progress={scrollYProgress} />
          <HorizonLine />
        </div>

        <motion.div
          style={{ opacity: fade }}
          className="mt-7 flex flex-col gap-7 md:mt-9 lg:flex-row lg:items-end lg:justify-between lg:gap-10"
        >
          <SplitWords text={site.pitch} delay={T.pitch} className="type-lead max-w-[34ch] text-ash" />
          <motion.div
            data-reveal=""
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: ease.outExpo, delay: T.actions }}
            className="flex flex-wrap items-center gap-4 sm:flex-nowrap"
          >
            <MagneticButton href={`mailto:${site.email}`} label="Email me" />
            <LinkButton href="#work" label="See selected work" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/**
 * The name, fitted to the full width of the column and standing on the
 * horizon line. Each letter rises from behind the line on a spring, and the
 * box clips everything below the line, so the letters appear to come up over
 * it (and sink back behind it as the page scrolls).
 */
function HeroName({ text, progress }: { text: string; progress: MotionValue<number> }) {
  const box = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const letters = Array.from(text.toUpperCase());

  useLayoutEffect(() => {
    const boxEl = box.current;
    const headingEl = heading.current;
    if (!boxEl || !headingEl) return;

    // Text width scales linearly with font size, so one measurement is enough.
    const fit = () => {
      const width = headingEl.getBoundingClientRect().width;
      if (!width) return;
      const size = parseFloat(getComputedStyle(headingEl).fontSize);
      headingEl.style.fontSize = `${(size * boxEl.clientWidth) / width}px`;
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(boxEl);
    document.fonts?.ready.then(fit);
    return () => observer.disconnect();
  }, [text]);

  return (
    <div ref={box} className="@container relative" style={{ clipPath: "inset(-60% -8% 0 -8%)" }}>
      <h1
        ref={heading}
        className="type-display flex w-max items-end whitespace-nowrap text-chalk"
        // A close first guess (Mona Sans at this width is about 0.83em per
        // capital) so the layout barely moves when the measured size lands.
        style={{ fontSize: `calc(100cqi / ${(letters.length * 0.83).toFixed(2)})` }}
      >
        <span className="sr-only">{text}</span>
        {letters.map((letter, i) => (
          <Letter key={i} letter={letter} index={i} count={letters.length} progress={progress} />
        ))}
      </h1>
    </div>
  );
}

function Letter({
  letter,
  index,
  count,
  progress,
}: {
  letter: string;
  index: number;
  count: number;
  progress: MotionValue<number>;
}) {
  const reduce = useReducedMotion();
  const start = index * 0.035;
  const sink = useTransform(progress, [start, start + 0.6], ["0%", "105%"]);

  return (
    <motion.span
      aria-hidden="true"
      className="block"
      style={{ y: reduce ? 0 : sink, marginRight: index < count - 1 ? "-0.04em" : 0 }}
    >
      <motion.span
        data-reveal=""
        className="on-baseline block"
        initial={{ y: "108%" }}
        animate={{ y: "0%" }}
        transition={{ ...riseSpring, delay: T.name + index * 0.07 }}
      >
        {letter}
      </motion.span>
    </motion.span>
  );
}

/** A hairline that draws outward from the centre, warmest where the light is. */
function HorizonLine() {
  return (
    <div aria-hidden="true" className="relative h-px">
      <motion.div
        data-reveal=""
        className="absolute inset-0 origin-center bg-[linear-gradient(90deg,transparent,rgb(236_236_238/0.26)_16%,rgb(247_224_204/0.9)_50%,rgb(236_236_238/0.26)_84%,transparent)]"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{
          scaleX: { duration: 1.6, ease: ease.outExpo, delay: T.line },
          opacity: { duration: 0.5, delay: T.line },
        }}
      />
      <motion.div
        data-reveal=""
        className="absolute left-1/2 top-1/2 h-2 w-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(247_224_204/0.45),transparent)] blur-[6px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.8, ease: ease.outQuint, delay: T.line + 0.3 }}
      />
    </div>
  );
}

/**
 * Low, desaturated light coming up from behind the horizon: a wide cool haze,
 * a warmer core, and a thin hot band right at the line. The wrapper clips at
 * the line, so the ground below stays dark.
 */
function Dawn({ opacity, scale }: { opacity: MotionValue<number>; scale: MotionValue<number> }) {
  return (
    <motion.div
      aria-hidden="true"
      style={{ opacity, scaleY: scale }}
      className="pointer-events-none absolute inset-x-[-25%] bottom-0 -z-10 h-[480%] origin-bottom overflow-hidden sm:h-[320%] lg:h-[230%]"
    >
      <motion.div
        data-reveal=""
        className="absolute inset-0 origin-bottom"
        initial={{ opacity: 0, scaleY: 0.35 }}
        animate={{ opacity: 1, scaleY: 1 }}
        transition={{ duration: 2.6, ease: ease.outExpo, delay: T.glow }}
      >
        <div className="absolute bottom-0 left-1/2 h-[125%] w-[80%] -translate-x-1/2 translate-y-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(125_140_178/0.2),transparent)] blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-[80%] w-[55%] -translate-x-1/2 translate-y-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(211_162_122/0.3),transparent)] blur-2xl" />
        <div className="absolute bottom-0 left-1/2 h-28 w-[42%] -translate-x-1/2 translate-y-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(255_226_200/0.32),transparent)] blur-xl" />
      </motion.div>
    </motion.div>
  );
}

/** Words that rise out of their own line masks, one after another. */
function SplitWords({ text, delay, className }: { text: string; delay: number; className?: string }) {
  const words = text.split(" ");

  return (
    <p className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, i) => (
          <span key={i}>
            <span className="-mb-[0.14em] inline-flex overflow-hidden pb-[0.14em] align-bottom">
              <motion.span
                data-reveal=""
                className="inline-block"
                initial={{ y: "115%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 1.1, ease: ease.outExpo, delay: delay + i * 0.04 }}
              >
                {word}
              </motion.span>
            </span>{" "}
          </span>
        ))}
      </span>
    </p>
  );
}
