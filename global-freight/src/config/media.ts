/**
 * Every media slot on the page, in one list.
 *
 * Each slot is a short looping video with a poster image (the first frame).
 * The current files were generated with Higgsfield in the "night light trails"
 * style; the prompts that made them are in media/manifest.txt history.
 *
 * To replace one:
 *   1. Put your files in public/media/ (e.g. ocean-port.mp4 + ocean-port.jpg)
 *   2. Point `video` and `poster` below at them (via clip('name') or asset('media/file'))
 *   3. Update `alt` to describe what your footage actually shows
 * A slot without `video` shows its poster as a still photo.
 *
 * Open the site with ?media in the URL to see each slot's id on the page.
 */
export type MediaSlot = {
  /** Shown in the ?media overlay. */
  id: string;
  /** Looping clip: H.264 MP4, muted, a few seconds long. Optional. */
  video?: string;
  /** Still image: shown before the video loads, with reduced motion, and on data saver. */
  poster: string;
  alt: string;
  /** Recommended export size for a replacement asset. */
  size: string;
  /** What the shot shows, for briefing a photographer or an image model. */
  brief: string;
};

/** Resolves a file in public/ against the site's base URL. */
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

const clip = (name: string) => ({ video: asset(`media/${name}.mp4`), poster: asset(`media/${name}.jpg`) });

export const media = {
  // Ocean
  oceanVessel: {
    id: 'ocean.vessel',
    ...clip('ocean-vessel'),
    alt: 'Container ship at night seen from directly above, its wake glowing orange behind it',
    size: '1280×720 video, landscape',
    brief: 'Top-down drone shot of a loaded container ship at sea, wake visible.',
  },
  oceanTerminal: {
    id: 'ocean.terminal',
    ...clip('ocean-terminal'),
    alt: 'Container terminal at night from above, cranes over a moored ship and light trails through the yard',
    size: '720×1280 video, portrait',
    brief: 'High aerial of a container terminal: cranes, quay, stacked boxes.',
  },
  oceanStacks: {
    id: 'ocean.stacks',
    ...clip('ocean-stacks'),
    alt: 'Rows of stacked containers from above at night, with light trails along the aisles',
    size: '1280×720 video, landscape',
    brief: 'Overhead grid of stacked containers in a yard, strong pattern.',
  },
  oceanQuay: {
    id: 'ocean.quay',
    ...clip('ocean-quay'),
    alt: 'Container ship moored at a lit quay at night, trucks leaving light trails along the quay road',
    size: '1280×720 video, landscape',
    brief: 'Ship alongside a quay at night, trucks moving on the apron.',
  },

  // Footage for sections built next (shown in their placeholders for now)
  aboutCrane: {
    id: 'about.crane',
    ...clip('about-crane'),
    alt: 'Looking up at a towering gantry crane at night as it lifts a container',
    size: '1280×720 video, landscape',
    brief: 'Low-angle shot looking up at a crane or hangar; scale and strength.',
  },
  airFreighter: {
    id: 'air.freighter',
    ...clip('air-freighter'),
    alt: 'Cargo jet flying above the clouds at night, seen from the side',
    size: '1280×720 video, landscape',
    brief: 'Side-on tracking shot of a freighter aircraft above the clouds.',
  },
  landRoad: {
    id: 'land.road',
    ...clip('land-road'),
    alt: 'Driver’s view down a highway at night, tail lights stretched into light trails',
    size: '1280×720 video, landscape',
    brief: 'Driver’s-eye view down a straight highway, trucks ahead.',
  },
} satisfies Record<string, MediaSlot>;

export type MediaKey = keyof typeof media;
