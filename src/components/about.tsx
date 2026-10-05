"use client";

import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { site } from "@/content/site";
import { ease } from "@/lib/motion";
import { Reveal } from "./reveal";

export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="relative pt-24 pb-12 md:pt-40 md:pb-16">
      <div className="shell grid gap-y-8 md:grid-cols-12 md:gap-x-5">
        <Reveal className="md:col-span-3">
          <h2 id="about-title" className="type-meta pt-2 text-ash md:pt-3">
            About
          </h2>
        </Reveal>

        <div className="md:col-span-9">
          <Reveal>
            <LitStatement text={site.about.statement} />
          </Reveal>

          <ul className="mt-16 grid gap-10 sm:grid-cols-3 sm:gap-6 md:mt-24 md:gap-8">
            {site.about.capabilities.map((item, i) => (
              <li key={item.title}>
                <motion.div
                  aria-hidden="true"
                  data-reveal=""
                  className="h-px origin-left bg-white/15"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                  transition={{ duration: 1.4, ease: ease.outExpo, delay: i * 0.1 }}
                />
                <Reveal delay={0.12 + i * 0.1} distance={18}>
                  <h3 className="mt-5 text-lg font-semibold tracking-[-0.01em] [font-stretch:110%]">{item.title}</h3>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-ash">{item.body}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/**
 * The statement lights up word by word as it moves up the screen, so it
 * reads at the pace you scroll.
 */
function LitStatement({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "end 0.55"] });
  const words = text.split(" ");

  return (
    <p ref={ref} className="type-statement max-w-[30ch] text-chalk">
      {words.map((word, i) => (
        <LitWord
          key={i}
          progress={scrollYProgress}
          range={[i / words.length, (i + 1) / words.length]}
          dim={reduce ? 1 : 0.16}
        >
          {word}
        </LitWord>
      ))}
    </p>
  );
}

function LitWord({
  children,
  progress,
  range,
  dim,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
  dim: number;
}) {
  const opacity = useTransform(progress, range, [dim, 1]);
  return (
    <>
      <motion.span style={{ opacity }}>{children}</motion.span>{" "}
    </>
  );
}
