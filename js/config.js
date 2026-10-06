/* =============================================================================
   MONTCIEL · Kairos — configuration
   -----------------------------------------------------------------------------
   Everything that describes the film lives here, so the other modules contain
   behaviour only. Positions are given in "vh": 100 vh is one screen of
   scrolling, and the whole film runs from 0 to TOTAL (1,400 vh, 14 screens).

   To rename the brand, change BRAND (the page text in index.html says
   MONTCIEL as well; search for it there).
   ============================================================================= */
(function () {
  "use strict";

  const TOTAL = 1400;

  window.MC = window.MC || {};

  window.MC.config = {
    BRAND: "MONTCIEL",
    MODEL: "KAIROS",
    TOTAL,

    /* Chapters: the numeral and name shown bottom-left. The fourth chapter is
       written IIII, the way watch and clock dials have always written four. */
    chapters: [
      { num: "I", name: "The Sky", from: 0, to: 280 },
      { num: "II", name: "The Tower", from: 280, to: 560 },
      { num: "III", name: "The Dial", from: 560, to: 720 },
      { num: "IIII", name: "The Movement", from: 720, to: 960 },
      { num: "V", name: "Kairos", from: 960, to: TOTAL + 1 },
    ],

    /* Keyframes K01–K12 and where the camera reaches each one. The film is a
       chain of video segments (film-01 = K01→K02 … film-11 = K11→K12), so
       keyframe n sits on the last frame of segment n-1. `brake` makes the camera
       ease to a stop there while the visitor keeps scrolling; `hold` keeps it
       still for a stretch of scrolling so the copy can be read. */
    keys: [
      { id: "K01", at: 0, note: "Above the clouds, the spire of Merdeka 118" },
      { id: "K02", at: 170, note: "Beneath the clouds: the tower over Kuala Lumpur" },
      { id: "K03", at: 280, note: "The crown of the tower at golden hour" },
      { id: "K04", at: 400, note: "The private salon inside the crown" },
      { id: "K05", at: 520, hold: 560, note: "On the desk, the watch" },
      { id: "K06", at: 690, hold: 720, note: "The aventurine dial and the tourbillon" },
      { id: "K07", at: 790, note: "Through the aperture" },
      { id: "K08", at: 870, brake: true, note: "Inside the movement" },
      { id: "K09", at: 960, note: "The tourbillon's axis" },
      { id: "K10", at: 1040, note: "The whirlwind of dusk clouds" },
      { id: "K11", at: 1110, note: "The tower rises from the eye of the whirlwind" },
      { id: "K12", at: 1180, brake: true, note: "Blue hour above the clouds" },
    ],

    /* Where a released scroll settles: the points where a line of copy is
       fully in. When the visitor lets go within `snapRange` vh of one of
       these, the page glides to it. */
    rests: [0, 110, 350, 530, 700, 870, 1180, 1300, TOTAL],
    snapRange: 40,

    /* The copy. Each cue is visible between `from` and `to` (vh) and is
       matched to an element in index.html by data-cue. Lines take about
       25 vh to rise in, so a cue starts at least that long before the
       resting point where it should be read in full. */
    cues: [
      { id: 1, from: 0, to: 55 },
      { id: 2, from: 62, to: 150 },
      { id: 4, from: 300, to: 400 },
      { id: 5, from: 460, to: 560 },
      { id: 6, from: 640, to: 720 },
      { id: 7, from: 830, to: 930 },
      { id: 8, from: 972, to: 1035 },
      { id: 9, from: 1130, to: 1200 },
      { id: 10, from: 1270, to: 1325 },
      { id: 11, from: 1325, to: 1386 },
      { id: 12, from: 1386, to: TOTAL + 200 }, // the sign-off never fades out
    ],

    /* The finale (chapter V, beat 5.3), drawn in code over the last frame. */
    finale: {
      starsFrom: 1110, // first stars appear over the blue-hour sky
      starsFull: 1190,
      nightFrom: 1180, // the sky sinks into midnight
      nightFull: 1245,
      ringFrom: 1190, // sixty stars become the sixty seconds of a ring
      ringClose: 1262, // the ring closes, the chime sounds, the watch appears
      watchFull: 1285,
      // Where the watch sits in assets/media/packshot.jpg, as fractions of the
      // image: the centre of the dial (cx, cy) and the diameter of the drawn
      // ring (d), which circles just outside the case.
      packshot: { cx: 0.478, cy: 0.425, d: 0.7 },
    },

    /* The field-of-view gauge on the right edge: log10 of the width of the
       picture in metres at each point (10 km … 0.1 mm), then back to the sky. */
    scale: [
      [0, 4], [170, 3], [280, 2], [400, 1], [520, 0], [560, 0],
      [690, -1.387], [720, -1.387], [790, -2], [870, -3], [960, -4],
      [1040, 1], [1110, 3], [1180, 4], [TOTAL, 4],
    ],

    /* Colour of the light through the film. Used for the placeholder frames
       (before the real frames are in place) and for the loader tint. */
    light: [
      [0, "#cfe0f2"], [150, "#dce3ea"], [240, "#e8d6b4"], [330, "#e3a65e"], [470, "#c98a4e"],
      [560, "#8c6a4a"], [640, "#26375f"], [720, "#22314f"], [800, "#56647a"], [900, "#6e3243"],
      [960, "#7a4a55"], [1010, "#d59b85"], [1090, "#b9786e"], [1150, "#3a5590"], [1240, "#17223f"],
      [TOTAL, "#070b15"],
    ],

    /* Sound: how loud each layer is (0–1) along the film. The engine in
       sound.js synthesises every layer live; nothing here is a recording. */
    sound: {
      wind: [[0, 0.55], [60, 0.75], [140, 0.95], [200, 0.5], [280, 0.15], [320, 0]],
      city: [[130, 0], [200, 0.45], [280, 0.6], [330, 0.35], [400, 0.05], [430, 0]],
      room: [[300, 0], [380, 0.4], [560, 0.35], [650, 0.12], [720, 0]],
      tick: [[440, 0], [520, 0.2], [560, 0.3], [690, 0.6], [720, 0.7], [800, 0.95], [940, 1], [990, 0.55], [1040, 0]],
      deep: [[690, 0], [760, 0.6], [800, 1], [940, 1], [990, 0.4], [1040, 0]],
      air: [[975, 0], [1040, 0.7], [1110, 0.8], [1180, 0.55], [1240, 0.2], [1275, 0]],
      pad: [[1110, 0], [1180, 0.8], [1240, 0.5], [1290, 0]],
      // The escapement beats 21,600 times an hour: six beats a second. It slows
      // to a stop as the tourbillon becomes the whirlwind (960 → 1040 vh).
      tickRate: 6,
      tickStopFrom: 960,
      tickStopAt: 1040,
    },

    /* The balance beats six times a second (21,600 vibrations an hour) and the
       tourbillon turns once a minute. Used for the live counter in the finale. */
    beatsPerSecond: 6,
    secondsPerTurn: 60,

    /* The lighter version for phones and touch screens (decision C: desktop
       first). It loads every second frame and skips the WebGL effects. */
    liteQuery: "(max-width: 760px), (pointer: coarse)",
  };
})();
