/* =============================================================================
   MONTCIEL · Kairos — small shared helpers
   ============================================================================= */
(function () {
  "use strict";

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  /* 0 → 1 between edge0 and edge1, with soft shoulders (works reversed too). */
  const smoothstep = (edge0, edge1, x) => {
    const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  };

  /* Piecewise-linear lookup in [[x, y], …] (x ascending), held flat at both ends. */
  const envelope = (points, x) => {
    if (x <= points[0][0]) return points[0][1];
    for (let i = 1; i < points.length; i++) {
      if (x <= points[i][0]) {
        const [x0, y0] = points[i - 1];
        const [x1, y1] = points[i];
        return lerp(y0, y1, (x - x0) / (x1 - x0 || 1));
      }
    }
    return points[points.length - 1][1];
  };

  /* A CSS cubic-bezier() as a JS function, so the film, the copy, the sound
     and the CSS transitions all share the same motion curves. */
  const bezier = (p1x, p1y, p2x, p2y) => {
    const cx = 3 * p1x, bx = 3 * (p2x - p1x) - cx, ax = 1 - cx - bx;
    const cy = 3 * p1y, by = 3 * (p2y - p1y) - cy, ay = 1 - cy - by;
    const sx = (t) => ((ax * t + bx) * t + cx) * t;
    const sy = (t) => ((ay * t + by) * t + cy) * t;
    const dsx = (t) => (3 * ax * t + 2 * bx) * t + cx;
    return (x) => {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      let t = x;
      for (let i = 0; i < 8; i++) { // Newton–Raphson
        const e = sx(t) - x, d = dsx(t);
        if (Math.abs(e) < 1e-6 || Math.abs(d) < 1e-6) break;
        t -= e / d;
      }
      if (t < 0 || t > 1 || Math.abs(sx(t) - x) > 1e-4) { // bisection fallback
        let lo = 0, hi = 1;
        t = x;
        for (let i = 0; i < 40; i++) {
          const val = sx(t);
          if (Math.abs(val - x) < 1e-6) break;
          if (val < x) lo = t; else hi = t;
          t = (lo + hi) / 2;
        }
      }
      return sy(t);
    };
  };

  /* The house curves. "cine" is the brief's cubic-bezier(0.25, 1, 0.5, 1): a
     quick, confident start that settles slowly, like a camera on a fluid head. */
  const CURVES = {
    cine: [0.25, 1, 0.5, 1],
    cineIn: [0.55, 0, 0.75, 0.06],
    cineInOut: [0.7, 0, 0.2, 1],
  };
  const ease = {};
  for (const k in CURVES) ease[k] = bezier(...CURVES[k]);

  /* #rrggbb → [r, g, b] */
  const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

  /* Colour lookup in [[x, "#rrggbb"], …]. */
  const colourAt = (stops, x) => {
    if (x <= stops[0][0]) return hexToRgb(stops[0][1]);
    for (let i = 1; i < stops.length; i++) {
      if (x <= stops[i][0]) {
        const t = (x - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0]);
        const a = hexToRgb(stops[i - 1][1]);
        const b = hexToRgb(stops[i][1]);
        return a.map((c, k) => Math.round(lerp(c, b[k], t)));
      }
    }
    return hexToRgb(stops[stops.length - 1][1]);
  };

  /* Small deterministic random generator, so the star field is the same on
     every visit. */
  const seeded = (seed) => () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  window.MC = window.MC || {};
  window.MC.util = { clamp, lerp, smoothstep, envelope, bezier, CURVES, ease, hexToRgb, colourAt, seeded };
})();
