/**
 * Every image slot on the page, in one list.
 *
 * To replace a placeholder:
 *   1. Put your file in public/media/ (e.g. public/media/ocean-port.jpg)
 *   2. Change `src` below to '/media/ocean-port.jpg'
 *   3. Update `alt` to describe what your photo actually shows
 *
 * `src` may be a full Unsplash photo URL (served resized via query params)
 * or a local path starting with '/'.
 *
 * Open the site with ?media in the URL to see each slot's id on the page.
 */
export type MediaSlot = {
  /** Shown in the ?media overlay; matches the key in `media`. */
  id: string;
  src: string;
  alt: string;
  /** Recommended export size for your replacement asset. */
  size: string;
  /** What the shot should show, for briefing a photographer or an image model. */
  brief: string;
};

const unsplash = (photo: string) => `https://images.unsplash.com/photo-${photo}`;

export const media = {
  // Ocean
  oceanVessel: {
    id: 'ocean.vessel',
    src: unsplash('1578575437130-527eed3abbec'),
    alt: 'Container ship seen from directly above, crossing open water',
    size: '2400×1600, landscape',
    brief: 'Top-down drone shot of a loaded container ship at sea, wake visible.',
  },
  oceanTerminal: {
    id: 'ocean.terminal',
    src: unsplash('1605745341112-85968b19335b'),
    alt: 'Container terminal with gantry cranes loading a ship at the quay',
    size: '1600×2000, portrait',
    brief: 'High aerial of a container terminal: cranes, quay, stacked boxes.',
  },
  oceanStacks: {
    id: 'ocean.stacks',
    src: unsplash('1494412574643-ff11b0a5c1c3'),
    alt: 'Rows of stacked shipping containers seen from above',
    size: '1600×1200, landscape',
    brief: 'Overhead grid of stacked containers in a yard, strong pattern.',
  },
  oceanQuay: {
    id: 'ocean.quay',
    src: unsplash('1559297434-fae8a1916a79'),
    alt: 'Cargo ship moored alongside the quay at dusk',
    size: '1600×1200, landscape',
    brief: 'Ship alongside a quay at blue hour, trucks waiting on the apron.',
  },

  // Slots for later sections (not on the page yet)
  aboutFleet: {
    id: 'about.fleet',
    src: unsplash('1586528116311-ad8dd3c8310d'),
    alt: 'Low-angle view of a large logistics hub',
    size: '2400×1600, landscape',
    brief: 'Low-angle, looking up at a hangar or warehouse façade; scale and strength.',
  },
  airFreighter: {
    id: 'air.freighter',
    src: unsplash('1436491865332-7a61a109cc05'),
    alt: 'Cargo aircraft flying above the clouds',
    size: 'Transparent PNG, 2400 wide, side profile',
    brief: 'Side profile of a freighter aircraft, cut out, for the slide-in shot.',
  },
  landRoad: {
    id: 'land.road',
    src: unsplash('1519003722824-194d4455a60c'),
    alt: 'Truck on an open highway at dawn',
    size: '2400×1600, landscape',
    brief: 'Driver’s-eye view down a straight highway, trucks ahead.',
  },
} satisfies Record<string, MediaSlot>;

export type MediaKey = keyof typeof media;
