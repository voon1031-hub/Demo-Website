/* =============================================================================
   MONTCIEL · Kairos — the finale (chapter V)
   -----------------------------------------------------------------------------
   Drawn in code over the last film frame:

     5.2  stars come out over the blue-hour sky; a few carry a faint red, the
          ruby bearings of the movement that followed us out.
     5.3  the sky sinks into midnight; sixty of the stars travel, one after
          another, to the sixty seconds of a ring and become its tick marks; the
          ring draws itself closed; the watch appears inside it.

   Also keeps the live counter in cue 10 ("4 minutes and 7 seconds since you
   set out from the clouds…"), measured from the visitor's first scroll.
   ============================================================================= */
(function () {
  "use strict";

  const { clamp, lerp, smoothstep, ease, seeded } = window.MC.util;

  const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];

  /* "4 minutes and 7 seconds", "47 seconds", "1 minute" */
  function formatDuration(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const parts = [];
    if (m > 0) parts.push(`${m} minute${m === 1 ? "" : "s"}`);
    if (s > 0 || m === 0) parts.push(`${s} second${s === 1 ? "" : "s"}`);
    return parts.join(" and ");
  }

  function formatTurns(sec, secondsPerTurn) {
    const n = Math.floor(sec / secondsPerTurn);
    if (n === 0) return "The tourbillon is still on its first turn for you.";
    if (n === 1) return "The tourbillon has turned once for you.";
    if (n === 2) return "The tourbillon has turned twice for you.";
    return `The tourbillon has turned ${WORDS[n] || n.toLocaleString("en-GB")} times for you.`;
  }

  class Finale {
    constructor({ canvas, watch, liveEls, config, lite }) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.watch = watch;
      this.live = liveEls; // { duration, turns, beats }
      this.cfg = config.finale;
      this.config = config;
      this.lite = lite;
      this.journeyStart = null; // set by main.js on the visitor's first scroll
      this.pageStart = performance.now(); // fallback: when the film opened
      this.lastLive = 0;
      this.cleared = true;

      // The star field is seeded, so it is the same sky on every visit.
      const rnd = seeded(1851);
      const n = lite ? 140 : 260;
      this.stars = [];
      for (let i = 0; i < n; i++) {
        this.stars.push({
          x: rnd(),
          y: Math.pow(rnd(), 1.35) * 0.62, // denser towards the top of the sky
          r: 0.35 + Math.pow(rnd(), 3) * 1.4,
          phase: rnd() * Math.PI * 2,
          speed: 0.6 + rnd() * 1.8,
          ruby: i % 33 === 7,
          second: -1,
        });
      }
      // Sixty of them will become the seconds of the ring.
      const pool = this.stars.filter((s) => !s.ruby);
      for (let k = 0; k < 60; k++) pool[Math.floor((k * pool.length) / 60)].second = k;
    }

    resize(w, h, dpr) {
      this.w = w;
      this.h = h;
      this.dpr = dpr;
      this.canvas.width = Math.round(w * dpr);
      this.canvas.height = Math.round(h * dpr);
      // The ring: centred, a little above the middle to leave room for the words.
      this.cx = w / 2;
      this.cy = h * (this.lite ? 0.34 : 0.4);
      this.R = Math.min(h * (this.lite ? 0.2 : 0.235), w * (this.lite ? 0.36 : 0.2));
      this.layoutWatch();
      this.cleared = false;
    }

    /* Size and place the packshot so the drawn ring encircles the watch. */
    layoutWatch() {
      if (!this.watch) return;
      const p = this.cfg.packshot;
      const size = (2 * this.R) / p.d;
      const left = this.cx - p.cx * size;
      const top = this.cy - p.cy * size;
      const st = this.watch.style;
      st.width = `${size}px`;
      st.height = `${size}px`;
      st.left = `${left}px`;
      st.top = `${top}px`;
      const inner = this.R * 0.86;
      const outer = this.R * 1.32;
      const mask = `radial-gradient(circle at ${p.cx * 100}% ${p.cy * 100}%, #000 ${inner}px, transparent ${outer}px)`;
      st.webkitMaskImage = mask;
      st.maskImage = mask;
    }

    elapsed(now) {
      const from = this.journeyStart == null ? this.pageStart : this.journeyStart;
      return Math.max(0, (now - from) / 1000);
    }

    update(v, now, time) {
      const f = this.cfg;
      const ctx = this.ctx;

      // Nothing to draw before the stars come out.
      if (v < f.starsFrom - 5) {
        if (!this.cleared) {
          ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
          this.cleared = true;
        }
        this.watch.style.opacity = "0";
        return;
      }
      this.cleared = false;

      const dpr = this.dpr;
      const W = this.w, H = this.h;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      const starsIn = smoothstep(f.starsFrom, f.starsFull, v);
      const pRing = clamp((v - f.ringFrom) / (f.ringClose - f.ringFrom), 0, 1);

      // ---- stars
      for (const s of this.stars) {
        const tw = 0.62 + 0.38 * Math.sin(time * s.speed + s.phase);
        let x = s.x * W;
        let y = s.y * H;
        let alpha = starsIn * tw;
        let r = s.r;

        if (s.second >= 0 && pRing > 0) {
          // Each second-star sets off a little after the one before it.
          const own = ease.cineInOut(clamp((pRing - (s.second / 60) * 0.45) / 0.55, 0, 1));
          const a = -Math.PI / 2 + (s.second / 60) * Math.PI * 2;
          const tx = this.cx + Math.cos(a) * this.R;
          const ty = this.cy + Math.sin(a) * this.R;
          x = lerp(x, tx, own);
          y = lerp(y, ty, own);
          alpha = lerp(alpha, 1, own);
          if (own > 0.7) {
            // Arriving: the star stretches into a tick mark pointing at the centre.
            const grow = (own - 0.7) / 0.3;
            const len = (s.second % 5 === 0 ? 0.075 : 0.035) * this.R * grow;
            ctx.strokeStyle = `rgba(222,227,234,${0.9 * alpha})`;
            ctx.lineWidth = s.second % 5 === 0 ? 1.3 : 0.9;
            ctx.beginPath();
            ctx.moveTo(tx - Math.cos(a) * len, ty - Math.sin(a) * len);
            ctx.lineTo(tx, ty);
            ctx.stroke();
            continue;
          }
          r = lerp(r, 1.1, own);
        } else if (pRing > 0) {
          alpha *= 1 - 0.72 * pRing; // the rest of the sky steps back
        }

        if (alpha < 0.01) continue;
        ctx.fillStyle = s.ruby ? `rgba(255,120,140,${alpha * 0.9})` : `rgba(236,240,248,${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // ---- the ring draws itself once the first seconds are in place
      const arc = ease.cine(clamp((pRing - 0.18) / 0.82, 0, 1));
      if (arc > 0) {
        const glint = v > f.ringClose ? Math.max(0, 1 - (v - f.ringClose) / 22) : 0;
        ctx.strokeStyle = `rgba(222,227,234,${0.55 + 0.4 * glint})`;
        ctx.lineWidth = 1 + 1.2 * glint;
        ctx.beginPath();
        ctx.arc(this.cx, this.cy, this.R, -Math.PI / 2, -Math.PI / 2 + arc * Math.PI * 2);
        ctx.stroke();
      }

      // ---- the watch
      const w = smoothstep(f.ringClose - 4, f.watchFull, v);
      this.watch.style.opacity = w.toFixed(3);
      this.watch.style.transform = `scale(${(0.965 + 0.035 * ease.cine(w)).toFixed(4)})`;

      // ---- the live counter (cue 10), refreshed a few times a second
      if (v > f.ringClose - 10 && v < 1345 && now - this.lastLive > 160) {
        this.lastLive = now;
        const sec = this.elapsed(now);
        const c = this.config;
        if (this.live.duration) this.live.duration.textContent = formatDuration(sec);
        if (this.live.turns) this.live.turns.textContent = formatTurns(sec, c.secondsPerTurn);
        if (this.live.beats) this.live.beats.textContent = Math.floor(sec * c.beatsPerSecond).toLocaleString("en-GB");
      }
    }
  }

  window.MC = window.MC || {};
  window.MC.Finale = Finale;
  window.MC.time = { formatDuration, formatTurns };
})();
