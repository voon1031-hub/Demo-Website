"use client";

import { Check, Copy } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { site } from "@/content/site";
import { ease } from "@/lib/motion";
import { Reveal } from "./reveal";
import { buttonStyles, MagneticButton } from "./ui/button";

/**
 * The page ends where it began: on a horizon. Light gathers behind the
 * question as you reach the bottom, and the footer below sits on the dark side
 * of the line.
 */
export function Contact() {
  const section = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: section, offset: ["start end", "end end"] });
  const glow = useTransform(scrollYProgress, [0.2, 1], [0, 1]);
  const rise = useTransform(scrollYProgress, [0.2, 1], [reduce ? 1 : 0.45, 1]);

  return (
    <section
      ref={section}
      id="contact"
      aria-labelledby="contact-title"
      className="relative isolate overflow-hidden pt-28 pb-28 md:pt-44 md:pb-44"
    >
      <motion.div
        aria-hidden="true"
        data-reveal=""
        style={{ opacity: glow, scaleY: rise }}
        className="pointer-events-none absolute inset-x-[-20%] bottom-0 -z-10 h-[75%] origin-bottom"
      >
        <div className="absolute bottom-0 left-1/2 h-[110%] w-[78%] -translate-x-1/2 translate-y-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(125_140_178/0.16),transparent)] blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-[64%] w-[50%] -translate-x-1/2 translate-y-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(211_162_122/0.24),transparent)] blur-2xl" />
      </motion.div>

      <div className="shell">
        <Reveal>
          <h2
            id="contact-title"
            className="max-w-[12ch] text-[clamp(3rem,1.4rem+6.6vw,8.5rem)] leading-[0.92] font-bold tracking-[-0.045em] text-balance [font-stretch:120%]"
          >
            {site.contact.heading}
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="type-lead mt-7 max-w-[44ch] text-ash md:mt-9">{site.contact.body}</p>
        </Reveal>
        <Reveal delay={0.16} className="mt-9 flex flex-wrap items-center gap-4 md:mt-11">
          <MagneticButton href={`mailto:${site.email}`} label="Email me" />
          <CopyEmail email={site.email} />
        </Reveal>
      </div>
    </section>
  );
}

/** Copies the address; the label swaps to a confirmation in place, without the button changing size. */
function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2200);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  }

  const swap = { duration: 0.5, ease: ease.outExpo };

  return (
    <button type="button" onClick={copy} className={buttonStyles.glass} aria-label={`Copy email address, ${email}`}>
      <span aria-hidden="true" className="grid overflow-hidden">
        <motion.span
          className="col-start-1 row-start-1 inline-flex items-center gap-2"
          initial={false}
          animate={{ y: copied ? "-130%" : "0%", opacity: copied ? 0 : 1 }}
          transition={swap}
        >
          <Copy className="size-4 text-ash" strokeWidth={1.75} />
          {email}
        </motion.span>
        <motion.span
          className="col-start-1 row-start-1 inline-flex items-center justify-center gap-2"
          initial={false}
          animate={{ y: copied ? "0%" : "130%", opacity: copied ? 1 : 0 }}
          transition={swap}
        >
          <Check className="size-4 text-dusk" strokeWidth={2} />
          Copied
        </motion.span>
      </span>
      <span role="status" className="sr-only">
        {copied ? "Email address copied" : ""}
      </span>
    </button>
  );
}
