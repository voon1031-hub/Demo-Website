import type { StaticImageData } from "next/image";
import fornelloCover from "@/assets/work/fornello.webp";
import kaidoCover from "@/assets/work/kaido-house.webp";

/**
 * Everything the page says lives here. Edit this file to make the site yours;
 * the components only handle layout and motion.
 */

export type ProjectCover =
  /** A still, optionally with a clip that plays while the card is hovered. */
  | { kind: "image"; src: StaticImageData; alt: string; video?: string; position?: string }
  /** Live studies drawn in code (see components/work/studies). */
  | { kind: "spring-study" }
  | { kind: "type-study" };

export type Project = {
  title: string;
  summary: string;
  year: string;
  type: string;
  /** When set, the whole card links here. Paths starting with "/" are files in public/. */
  href?: string;
  cover: ProjectCover;
  /** Card size in the bento grid. */
  size: "feature" | "tall" | "small";
};

const projects: Project[] = [
  {
    title: "Kaido House × Mini GT",
    summary: "Launch site for five 1:64 street cars, each parked in its own night scene.",
    year: "2026",
    type: "Launch site",
    href: "/projects/kaido-house/index.html",
    size: "feature",
    cover: {
      kind: "image",
      src: kaidoCover,
      alt: "Five Kaido House × Mini GT model cars lined up on a wet street at night",
      video: "/projects/kaido-house/assets/scenes/cover.mp4",
    },
  },
  {
    title: "Fornello",
    summary: "One-page site for a wood-fired pizzeria, from the dough to the door.",
    year: "2026",
    type: "Restaurant site",
    href: "/projects/fornello/index.html",
    size: "tall",
    cover: {
      kind: "image",
      src: fornelloCover,
      alt: "Three wood-fired pizzas on a pale wooden table, seen from above",
      position: "50% 40%",
    },
  },
  {
    title: "Spring study",
    summary: "The same spring, bouncy or calm. Hover or tap to switch.",
    year: "2026",
    type: "Motion study",
    size: "small",
    cover: { kind: "spring-study" },
  },
  {
    title: "Type study",
    summary: "Mona Sans, the typeface on this page, from light and narrow to black and wide.",
    year: "2026",
    type: "Type study",
    size: "small",
    cover: { kind: "type-study" },
  },
];

export const site = {
  name: "Voon",
  role: "Designer and front-end developer",
  availability: "Booking projects from January 2027",
  pitch: "I design and build motion-led websites for brands with something to show.",
  // Replace with your address. It is used by both "Email me" buttons and "Copy address".
  email: "hello@example.com",
  timeZone: { id: "Etc/GMT-8", label: "GMT+8" },
  links: [{ label: "GitHub", href: "https://github.com/voon1031-hub" }],

  work: {
    intro: "Two sites you can open and click through, and two small studies you can play with right here.",
    projects,
  },

  about: {
    statement:
      "Most of my work happens in the first ten seconds of a visit: what moves, what waits, and what you notice second. Lately that has meant 1:64 toy cars and wood\u2011fired pizza.",
    capabilities: [
      {
        title: "Design",
        body: "Art direction, layout and type for launch pages and small brand sites, designed in the browser early.",
      },
      {
        title: "Build",
        body: "Next.js and React front ends that load fast, read well on a phone, and stay easy for your team to edit.",
      },
      {
        title: "Motion",
        body: "Springs, scroll and page-load choreography, tuned until it feels physical rather than decorative.",
      },
    ],
  },

  contact: {
    heading: "Have a launch coming up?",
    body: "Send a few lines about the project and the date it needs to go live. I reply within two working days.",
  },
};
