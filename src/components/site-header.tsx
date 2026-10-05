"use client";

import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";
import { site } from "@/content/site";
import { cn } from "@/lib/cn";
import { ease, settleSpring } from "@/lib/motion";
import { RollText } from "./ui/roll-text";

const nav = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

/**
 * Clear over the hero, glass once the page moves. It slides away while you
 * read downward and comes back the moment you scroll up.
 */
export function SiteHeader() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const previous = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    setHidden(y > previous && y > 480);
  });

  return (
    <motion.header
      data-reveal=""
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, y: hidden ? "-100%" : "0%" }}
      transition={{ opacity: { duration: 1, ease: ease.outQuint, delay: 1.2 }, y: settleSpring }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 border-b backdrop-blur-md transition-[background-color,border-color,opacity] duration-700 ease-out-expo",
          scrolled ? "border-white/[0.06] bg-night/60 opacity-100" : "border-transparent bg-transparent opacity-0",
        )}
      />
      <div className="shell relative flex h-16 items-center justify-between">
        <a
          href="#top"
          className="group text-[1.0625rem] font-bold tracking-[-0.02em] [font-stretch:125%]"
          aria-label={`${site.name}, back to top`}
        >
          <RollText text={site.name} />
        </a>
        <nav aria-label="Sections">
          <ul className="flex items-center gap-6 text-[0.9375rem] text-ash md:gap-8">
            {nav.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="group transition-colors duration-500 ease-out-expo hover:text-chalk">
                  <RollText text={item.label} />
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </motion.header>
  );
}
