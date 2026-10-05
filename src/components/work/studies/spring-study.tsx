"use client";

import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useEffect, useRef } from "react";

const STIFFNESS = 170;
const BOUNCY = 7;
const CALM = 20;
/** Seconds shown on the graph. The ball moves in real time, like the real spring would. */
const SECONDS = 1.6;

// Graph geometry, in viewBox units (400 × 240).
const X0 = 28;
const X1 = 332;
const REST_Y = 196;
const TARGET_Y = 100;
const BALL_X = 368;

/** Position of a unit-mass spring released at 0 and pulled toward 1, after `t` seconds. */
function position(t: number, damping: number) {
  const w0 = Math.sqrt(STIFFNESS);
  const zeta = damping / (2 * w0);
  if (zeta >= 1) return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
  const wd = w0 * Math.sqrt(1 - zeta * zeta);
  return 1 - Math.exp(-zeta * w0 * t) * (Math.cos(wd * t) + ((zeta * w0) / wd) * Math.sin(wd * t));
}

const toX = (t: number) => X0 + (t / SECONDS) * (X1 - X0);
const toY = (value: number) => REST_Y - value * (REST_Y - TARGET_Y);

/** The spring's path from release up to `until` (0–1) of the graph. */
function trace(damping: number, until = 1) {
  const steps = Math.max(2, Math.round(120 * until));
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * until * SECONDS;
    d += `${i ? "L" : "M"}${toX(t).toFixed(2)} ${toY(position(t, damping)).toFixed(2)}`;
  }
  return d;
}

/**
 * One spring, two dampings. The ball on the right is the spring itself; the
 * line is its position over time. The other damping stays on the graph as a
 * faint ghost for comparison.
 */
export function SpringStudy({ active }: { active: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const inView = useInView(root, { once: true, margin: "0px 0px -15% 0px" });
  const reduce = useReducedMotion();

  const damping = useMotionValue(BOUNCY);
  const progress = useMotionValue(reduce ? 1 : 0);

  useEffect(() => {
    if (!inView) return;
    const target = active ? CALM : BOUNCY;
    if (reduce) {
      damping.set(target);
      progress.set(1);
      return;
    }
    const count = animate(damping, target, { duration: 0.35, ease: "easeOut" });
    progress.set(0);
    const run = animate(progress, 1, { duration: SECONDS, ease: "linear" });
    return () => {
      count.stop();
      run.stop();
    };
  }, [active, inView, reduce, damping, progress]);

  const line = useTransform(() => trace(damping.get(), progress.get()));
  const ghost = useTransform(() => trace(damping.get() < (BOUNCY + CALM) / 2 ? CALM : BOUNCY));
  const tipX = useTransform(() => toX(progress.get() * SECONDS));
  const tipY = useTransform(() => toY(position(progress.get() * SECONDS, damping.get())));
  const dampingLabel = useTransform(() => Math.round(damping.get()).toString());

  return (
    <div
      ref={root}
      className="absolute inset-0 bg-[radial-gradient(circle,rgb(255_255_255/0.07)_1px,transparent_1.25px)] bg-[length:16px_16px] bg-center"
    >
      <svg aria-hidden="true" viewBox="0 0 400 240" className="absolute inset-0 size-full">
        <line x1={X0} x2={X1} y1={REST_Y} y2={REST_Y} stroke="rgb(255 255 255 / 0.1)" />
        <line x1={X0} x2={BALL_X + 12} y1={TARGET_Y} y2={TARGET_Y} stroke="rgb(255 255 255 / 0.22)" strokeDasharray="2 5" />
        <line x1={BALL_X} x2={BALL_X} y1={44} y2={212} stroke="rgb(255 255 255 / 0.1)" strokeWidth={2} strokeLinecap="round" />

        <motion.path d={ghost} fill="none" stroke="rgb(255 255 255 / 0.16)" strokeWidth={1.25} />
        <motion.path
          d={line}
          fill="none"
          stroke="#ececee"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 0 6px rgb(211 162 122 / 0.45))" }}
        />
        <motion.line x1={tipX} x2={BALL_X} y1={tipY} y2={tipY} stroke="rgb(255 255 255 / 0.12)" strokeDasharray="2 4" />
        <motion.circle cx={tipX} cy={tipY} r={3.5} fill="#ececee" />
        <motion.circle
          cx={BALL_X}
          cy={tipY}
          r={9}
          fill="#ececee"
          style={{ filter: "drop-shadow(0 0 10px rgb(211 162 122 / 0.55))" }}
        />
      </svg>

      <p aria-hidden="true" className="type-meta absolute top-4 left-5 flex gap-3 text-smoke">
        <span>
          Stiffness <span className="text-chalk">{STIFFNESS}</span>
        </span>
        <span>
          Damping <motion.span className="inline-block min-w-[3ch] text-chalk">{dampingLabel}</motion.span>
        </span>
      </p>
    </div>
  );
}
