"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { site, type Project } from "@/content/site";
import { cn } from "@/lib/cn";
import { ease, settleSpring } from "@/lib/motion";
import { Reveal } from "../reveal";
import { ProjectCard } from "./project-card";

/**
 * Bento placement. Phones get one column of fixed-ratio cards; tablets two
 * columns; desktop a 12-column grid where the feature card spans 8×2 and the
 * tall card runs the full height of the right column.
 */
const sizes: Record<Project["size"], string> = {
  feature: "aspect-square sm:aspect-[16/11] md:col-span-2 md:aspect-auto lg:col-span-8 lg:row-span-2",
  tall: "aspect-[4/5] sm:aspect-[16/13] md:row-span-2 md:aspect-auto lg:col-span-4 lg:row-span-3",
  small: "aspect-square sm:aspect-[16/11] md:aspect-auto lg:col-span-4",
};

export function Work() {
  const section = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: section, offset: ["start end", "end start"] });
  // Two pools of light behind the glass, drifting slower than the page.
  const warmY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-18%", "22%"]);
  const coolY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["12%", "-16%"]);

  return (
    <section ref={section} id="work" aria-labelledby="work-title" className="relative isolate py-24 md:py-36">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          style={{ y: warmY }}
          className="absolute top-[14%] left-[2%] h-[42rem] w-[52rem] max-w-[90vw] rounded-[50%] bg-[radial-gradient(closest-side,rgb(211_162_122/0.09),transparent)] blur-3xl"
        />
        <motion.div
          style={{ y: coolY }}
          className="absolute top-[34%] right-[-6%] h-[48rem] w-[40rem] max-w-[80vw] rounded-[50%] bg-[radial-gradient(closest-side,rgb(125_140_178/0.11),transparent)] blur-3xl"
        />
      </div>

      <div className="shell">
        <div className="mb-10 flex flex-col gap-5 md:mb-14 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <Reveal>
            <h2 id="work-title" className="type-title">
              Selected work
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="max-w-[38ch] text-ash">{site.work.intro}</p>
          </Reveal>
        </div>

        <ul className="grid grid-cols-1 gap-4 md:auto-rows-[22rem] md:grid-cols-2 md:gap-5 lg:auto-rows-[clamp(16rem,22vw,20rem)] lg:grid-cols-12">
          {site.work.projects.map((project, i) => (
            <motion.li
              key={project.title}
              data-reveal=""
              className={cn("min-h-0", sizes[project.size])}
              initial={{ opacity: 0, y: 56 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -8% 0px" }}
              transition={{
                y: { ...settleSpring, delay: (i % 2) * 0.09 },
                opacity: { duration: 0.8, ease: ease.outQuint, delay: (i % 2) * 0.09 },
              }}
            >
              <ProjectCard project={project} preload={i === 0} />
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
