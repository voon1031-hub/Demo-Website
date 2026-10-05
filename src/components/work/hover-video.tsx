"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * A muted clip layered over a cover still. Nothing downloads until the card is
 * first hovered or focused; it fades in once frames are actually playing, so
 * the still never flashes to black.
 */
export function HoverVideo({ src, playing }: { src: string; playing: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  const [ready, setReady] = useState(false);
  const shouldPlay = playing && !reduce;

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    if (shouldPlay) {
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [shouldPlay]);

  return (
    <video
      ref={video}
      src={src}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      tabIndex={-1}
      onPlaying={() => setReady(true)}
      className={cn(
        "absolute inset-0 size-full object-cover transition-opacity duration-700 ease-out-quint",
        shouldPlay && ready ? "opacity-100" : "opacity-0",
      )}
    />
  );
}
