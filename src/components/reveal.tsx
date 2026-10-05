"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { ease, settleSpring } from "@/lib/motion";

type RevealProps = HTMLMotionProps<"div"> & {
  delay?: number;
  /** How far below its resting place the block starts, in px. */
  distance?: number;
};

/**
 * Fades a block in and lifts it into place the first time it scrolls into view.
 * The blur clears a beat after the opacity, which reads as the block coming
 * into focus rather than just appearing.
 */
export function Reveal({ delay = 0, distance = 28, children, ...rest }: RevealProps) {
  return (
    <motion.div
      data-reveal=""
      initial={{ opacity: 0, y: distance, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{
        y: { ...settleSpring, delay },
        opacity: { duration: 0.7, ease: ease.outQuint, delay },
        filter: { duration: 0.9, ease: ease.outQuint, delay },
      }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
