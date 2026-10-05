"use client";

import { ArrowUpRight } from "lucide-react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import Image from "next/image";
import { useId, useRef, useState, type PointerEvent, type ReactNode } from "react";
import type { Project } from "@/content/site";
import { tiltSpring } from "@/lib/motion";
import { withBase } from "@/lib/paths";
import { HoverVideo } from "./hover-video";
import { SpringStudy } from "./studies/spring-study";
import { TypeStudy } from "./studies/type-study";

/** Degrees the card leans toward the pointer at its edges. */
const MAX_TILT = 5;

/**
 * A glass card around a piece of work. Under the pointer it leans toward the
 * cursor, lifts a few pixels, and carries a soft light that also runs along
 * its border. The cover inside zooms slowly and drifts against the scroll.
 */
export function ProjectCard({ project, preload = false }: { project: Project; preload?: boolean }) {
  const area = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const summaryId = useId();
  const reduce = useReducedMotion();
  const [active, setActive] = useState(false);
  const isPhoto = project.cover.kind === "image";

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const tiltX = useSpring(0, tiltSpring);
  const tiltY = useSpring(0, tiltSpring);
  const lift = useSpring(0, tiltSpring);
  const y = useTransform(lift, [0, 1], [0, -6]);
  const scale = useTransform(lift, [0, 1], [1, 1.012]);

  const light = useMotionTemplate`radial-gradient(520px circle at ${pointerX}px ${pointerY}px, rgb(255 255 255 / 0.075), transparent 55%)`;
  const edge = useMotionTemplate`radial-gradient(300px circle at ${pointerX}px ${pointerY}px, rgb(255 255 255 / 0.55), transparent 65%)`;

  const { scrollYProgress } = useScroll({ target: area, offset: ["start end", "end start"] });
  const drift = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-4%", "4%"]);

  // Measured on the outer wrapper, which never moves, so the tilt can't feed back into itself.
  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - box.left;
    const y = event.clientY - box.top;
    pointerX.set(x);
    pointerY.set(y);
    if (reduce || event.pointerType !== "mouse") return;
    tiltY.set((x / box.width - 0.5) * 2 * MAX_TILT);
    tiltX.set(-(y / box.height - 0.5) * 2 * MAX_TILT);
  }

  function onPointerEnter(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse") return;
    setActive(true);
    if (!reduce) lift.set(1);
  }

  function onPointerLeave(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse") return;
    setActive(false);
    tiltX.set(0);
    tiltY.set(0);
    lift.set(0);
  }

  // On touch screens there is no hover, so a tap switches a study instead.
  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" && !project.href) setActive((on) => !on);
  }

  const frame =
    "group relative flex h-full flex-col rounded-[28px] border border-white/[0.08] bg-white/[0.03] p-2 backdrop-blur-md transition-[border-color,background-color] duration-700 ease-out-expo hover:border-white/[0.16] hover:bg-white/[0.05]";

  const body: ReactNode = (
    <>
      {/* Light that follows the pointer across the glass, and along the border. */}
      <motion.div
        aria-hidden="true"
        style={{ background: light }}
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-700 ease-out-expo group-hover:opacity-100"
      />
      <motion.div
        aria-hidden="true"
        style={{ background: edge }}
        className="ring-mask pointer-events-none absolute -inset-px rounded-[29px] opacity-0 transition-opacity duration-700 ease-out-expo group-hover:opacity-100"
      />

      <div className="relative isolate min-h-0 flex-1 overflow-hidden rounded-[20px] bg-white/[0.02]">
        {/* Only photos drift (they have bleed to spare); the studies stay put so their readouts never crop. */}
        <motion.div
          style={{ y: isPhoto ? drift : 0 }}
          className={isPhoto ? "absolute inset-x-0 -inset-y-[6%]" : "absolute inset-0"}
        >
          <div className="relative size-full transition-transform duration-[1800ms] ease-out-expo group-hover:scale-[1.06]">
            <Cover project={project} active={active} preload={preload} />
          </div>
        </motion.div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-white/[0.06] ring-inset"
        />
      </div>

      <div className="relative flex items-start justify-between gap-6 px-3 pt-4 pb-2">
        <div className="min-w-0">
          <h3 id={titleId} className="flex items-center gap-1.5 text-[1.0625rem] leading-snug font-semibold tracking-[-0.012em] [font-stretch:110%]">
            {project.title}
            {project.href ? (
              <ArrowUpRight
                aria-hidden="true"
                strokeWidth={1.75}
                className="size-4 shrink-0 text-smoke transition-[translate,color] duration-500 ease-out-expo group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-chalk"
              />
            ) : null}
          </h3>
          <p id={summaryId} className="mt-1 max-w-[46ch] text-sm leading-relaxed text-pretty text-ash">
            {project.summary}
          </p>
        </div>
        <p className="type-meta shrink-0 text-right text-smoke">
          {project.year}
          <br />
          {project.type}
        </p>
      </div>
    </>
  );

  return (
    <div
      ref={area}
      onPointerMove={onPointerMove}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onPointerUp={onPointerUp}
      className="h-full"
    >
      <motion.div
        style={{ rotateX: tiltX, rotateY: tiltY, y, scale, transformPerspective: 1200 }}
        className="h-full"
      >
        {project.href ? (
          // Named by the title and described by the summary, rather than by everything inside the card.
          <a
            href={withBase(project.href)}
            aria-labelledby={titleId}
            aria-describedby={summaryId}
            className={frame}
            onFocus={() => setActive(true)}
            onBlur={() => setActive(false)}
          >
            {body}
          </a>
        ) : (
          <article aria-labelledby={titleId} className={frame}>
            {body}
          </article>
        )}
      </motion.div>
    </div>
  );
}

function Cover({ project, active, preload }: { project: Project; active: boolean; preload: boolean }) {
  const { cover } = project;

  switch (cover.kind) {
    case "image":
      return (
        <>
          <Image
            src={cover.src}
            alt={cover.alt}
            fill
            preload={preload}
            placeholder="blur"
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="object-cover"
            style={{ objectPosition: cover.position }}
          />
          {cover.video ? <HoverVideo src={withBase(cover.video)} playing={active} /> : null}
        </>
      );
    case "spring-study":
      return <SpringStudy active={active} />;
    case "type-study":
      return <TypeStudy active={active} />;
  }
}
