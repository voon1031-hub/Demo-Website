"use client";

import { motion } from "motion/react";
import { useSyncExternalStore } from "react";
import { site } from "@/content/site";
import { ease } from "@/lib/motion";
import { RollText } from "./ui/roll-text";

export function SiteFooter({ year }: { year: number }) {
  return (
    <footer className="shell pb-10">
      {/* The second horizon: it draws outward when the bottom of the page arrives. */}
      <motion.div
        aria-hidden="true"
        data-reveal=""
        className="h-px origin-center bg-[linear-gradient(90deg,transparent,rgb(236_236_238/0.2)_16%,rgb(247_224_204/0.75)_50%,rgb(236_236_238/0.2)_84%,transparent)]"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.6, ease: ease.outExpo }}
      />
      <div className="flex flex-col gap-4 pt-8 text-sm text-smoke md:flex-row md:items-center md:justify-between">
        <p>
          © {year} {site.name}
        </p>
        <ul className="flex gap-6">
          {site.links.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="group transition-colors duration-500 ease-out-expo hover:text-chalk">
                <RollText text={link.label} />
              </a>
            </li>
          ))}
        </ul>
        <LocalTime zone={site.timeZone} />
      </div>
    </footer>
  );
}

// The clock is read on the client only, so the static HTML never disagrees with it.
function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, 10_000);
  return () => window.clearInterval(id);
}
const currentMinute = () => Math.floor(Date.now() / 60_000);
const noMinute = () => null;

function LocalTime({ zone }: { zone: { id: string; label: string } }) {
  const minute = useSyncExternalStore(subscribe, currentMinute, noMinute);
  const time =
    minute === null
      ? "--:--"
      : new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: zone.id }).format(
          minute * 60_000,
        );

  return (
    <p>
      Local time <time className="text-ash">{time}</time> {zone.label}
    </p>
  );
}
