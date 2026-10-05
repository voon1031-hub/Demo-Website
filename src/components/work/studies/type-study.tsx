"use client";

import {
  animate,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { useEffect, useRef } from "react";
import { ease } from "@/lib/motion";

/** Where the specimen rests between hovers: light and fairly narrow. */
const REST = 0.18;

/**
 * Mona Sans driven along both of its axes at once: weight 200–900 and width
 * 75–125. It sweeps the whole range once when it scrolls into view, then
 * rests light and narrow until it is hovered.
 */
export function TypeStudy({ active }: { active: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const inView = useInView(root, { once: true, margin: "0px 0px -15% 0px" });
  const reduce = useReducedMotion();

  // 0 = light and narrow, 1 = black and wide.
  const amount = useMotionValue(1);

  useEffect(() => {
    if (!inView) return;
    const target = active ? 1 : REST;
    if (reduce) {
      amount.set(target);
      return;
    }
    const run = animate(amount, target, { duration: 1.4, ease: ease.inOutQuart });
    return () => run.stop();
  }, [active, inView, reduce, amount]);

  const weight = useTransform(amount, [0, 1], [200, 900]);
  const width = useTransform(amount, [0, 1], [75, 125]);
  const axes = useMotionTemplate`'wght' ${weight}, 'wdth' ${width}`;
  const weightLabel = useTransform(weight, (v) => Math.round(v).toString());
  const widthLabel = useTransform(width, (v) => Math.round(v).toString());
  const knob = useTransform(amount, (v) => `${v * 100}%`);

  return (
    <div ref={root} className="@container absolute inset-0 flex items-center justify-center">
      <motion.span
        aria-hidden="true"
        style={{ fontVariationSettings: axes }}
        className="text-[24cqi] leading-none tracking-[-0.03em] text-chalk"
      >
        Mona
      </motion.span>

      <p aria-hidden="true" className="type-meta absolute top-4 left-5 flex gap-3 text-smoke">
        <span>
          Weight <motion.span className="inline-block min-w-[3ch] text-chalk">{weightLabel}</motion.span>
        </span>
        <span>
          Width <motion.span className="inline-block min-w-[3ch] text-chalk">{widthLabel}</motion.span>
        </span>
      </p>

      <div aria-hidden="true" className="absolute inset-x-5 bottom-4 flex items-center gap-3 text-smoke">
        <span className="text-sm [font-variation-settings:'wght'_200,'wdth'_75]">Aa</span>
        <div className="relative h-px flex-1 bg-white/12">
          <motion.span
            style={{ left: knob }}
            className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-chalk shadow-[0_0_10px_2px_rgb(211_162_122/0.5)]"
          />
        </div>
        <span className="text-sm [font-variation-settings:'wght'_900,'wdth'_125]">Aa</span>
      </div>
    </div>
  );
}
