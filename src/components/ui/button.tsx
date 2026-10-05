"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { useRef, type ComponentProps, type PointerEvent } from "react";
import { cn } from "@/lib/cn";
import { followSpring } from "@/lib/motion";
import { RollText } from "./roll-text";

const base =
  "group relative inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full px-6 text-[0.9375rem] font-semibold tracking-[-0.005em] [font-stretch:108%] select-none";

export const buttonStyles = {
  /** The one bright object on a dark page. Hover adds light, not colour. */
  solid: cn(
    base,
    "bg-chalk text-night shadow-[inset_0_1px_0_rgb(255_255_255/0.6)]",
    "transition-[background-color,box-shadow] duration-500 ease-out-expo",
    "hover:bg-white hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.6),0_0_0_1px_rgb(255_255_255/0.35),0_12px_40px_-12px_rgb(211_162_122/0.7)]",
  ),
  /** Same glass as the project cards. */
  glass: cn(
    base,
    "border border-white/[0.08] bg-white/[0.03] text-chalk backdrop-blur-md",
    "transition-[background-color,border-color] duration-500 ease-out-expo",
    "hover:border-white/25 hover:bg-white/[0.06]",
  ),
};

type LinkButtonProps = Omit<ComponentProps<"a">, "children"> & {
  label: string;
  variant?: keyof typeof buttonStyles;
};

export function LinkButton({ label, variant = "glass", className, ...rest }: LinkButtonProps) {
  return (
    <a className={cn(buttonStyles[variant], className)} {...rest}>
      <RollText text={label} />
    </a>
  );
}

type MagneticButtonProps = {
  label: string;
  href: string;
  variant?: keyof typeof buttonStyles;
  className?: string;
  /** Share of the pointer's distance from the centre that the button follows. */
  strength?: number;
  /** The furthest the button travels, in px. The pull eases off toward it rather than stopping dead. */
  reach?: number;
};

/** Saturates smoothly toward ±limit, so the pull weakens the further the button already is from home. */
const soften = (value: number, limit: number) => limit * Math.tanh(value / limit);

/**
 * A link that leans toward the pointer once it comes within reach, then
 * springs home when the pointer leaves. The label travels a little further
 * than the pill, which gives the button a sense of depth.
 */
export function MagneticButton({
  label,
  href,
  variant = "solid",
  strength = 0.4,
  reach = 10,
  className,
}: MagneticButtonProps) {
  const area = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, followSpring);
  const springY = useSpring(y, followSpring);
  const labelX = useTransform(springX, (v) => v * 0.5);
  const labelY = useTransform(springY, (v) => v * 0.5);

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (reduce || event.pointerType !== "mouse" || !area.current) return;
    const box = area.current.getBoundingClientRect();
    x.set(soften((event.clientX - (box.left + box.width / 2)) * strength, reach));
    y.set(soften((event.clientY - (box.top + box.height / 2)) * strength, reach * 0.6));
  }

  function onPointerLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    // The padded wrapper is the magnet's field: it starts pulling ~16px before
    // the pointer touches the button. Negative margin keeps the layout unchanged.
    <div ref={area} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave} className="-m-4 inline-flex p-4">
      <motion.a href={href} style={{ x: springX, y: springY }} className={cn(buttonStyles[variant], className)}>
        <motion.span style={{ x: labelX, y: labelY }} className="inline-flex">
          <RollText text={label} />
        </motion.span>
      </motion.a>
    </div>
  );
}
