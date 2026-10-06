/* =============================================================================
   MONTCIEL · Kairos — main
   -----------------------------------------------------------------------------
   One number drives the whole film: v, the scroll position in vh (0 → 1,400).

     wheel / touch ──▶ Lenis (inertia) ──▶ ScrollTrigger (progress 0 → 1)
                                                │
                       every frame (gsap.ticker)│
            ┌───────────────┬───────────────┬───┴──────────┬────────────────┐
            ▼               ▼               ▼              ▼                ▼
       film frame       the finale     interface        sound          copy timeline
       (renderer.js)    (finale.js)    (gauge, chapter) (sound.js)     (GSAP, scrubbed)

   Because everything reads the same v, picture, words and sound stay in step,
   scrolling backwards included.
   ============================================================================= */
(function () {
  "use strict";

  const MC = window.MC;
  const C = MC.config;
  const { clamp, lerp, smoothstep, envelope, colourAt, ease } = MC.util;
  const TOTAL = C.TOTAL;

  const root = document.documentElement;
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => [...document.querySelectorAll(sel)];
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  /* --------------------------------------------------------- environment */
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lite = window.matchMedia(C.liteQuery).matches; // phones and touch: the lighter film
  root.classList.toggle("is-lite", lite);
  root.classList.toggle("is-reduced", reduceMotion);
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);

  // GSAP plugins and the house curves, by name: "cine", "cineIn", "cineInOut".
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  for (const [name, c] of Object.entries(MC.util.CURVES)) CustomEase.create(name, c.join(","));
  ScrollTrigger.config({ ignoreMobileResize: true });

  /* ------------------------------------------------------------ elements */
  const el = {
    track: $("#track"),
    film: $("#film"),
    sky: $("#sky"),
    watch: $("#watch"),
    scrimLow: $(".scrim--low"),
    scrimMid: $(".scrim--mid"),
    loader: $("#loader"),
    loaderRing: $("#loader-ring"),
    loaderPct: $("#loader-pct"),
    chapterNum: $(".chapter__num"),
    chapterName: $(".chapter__name"),
    gauge: $(".gauge"),
    gaugeMarker: $(".gauge__marker"),
    gaugeRead: $(".gauge__read"),
    gaugeLabel: $(".gauge__label"),
    cue: $(".scroll-cue"),
    sound: $("#sound-toggle"),
    soundState: $("#sound-state"),
    navViewing: $("#nav-viewing"),
    ctaViewing: $("#cta-viewing"),
    windBack: $("#wind-back"),
    home: $("#home"),
    dialog: $("#viewing"),
    signoff: $('[data-cue="12"]'),
  };

  /* ------------------------------------------------------------ the film */
  const frames = new MC.Frames(window.FILM || null, { step: lite ? 2 : 1, parallel: lite ? 4 : 6 });
  let film = MC.render.createRenderer(el.film, frames, { lite });
  const curve = frames.available ? filmCurve() : null;

  /* Scroll position (vh) → film position (fractional frame index).
     A monotone cubic curve through every keyframe: it eases to a stop at the
     keyframes marked `brake` or `hold`, flows through the others, and never
     runs backwards, so the camera always moves like a real dolly. */
  function filmCurve() {
    const pts = [];
    for (const k of C.keys) {
      const f = frames.keyIndex(k.id);
      pts.push({ v: k.at, f, stop: !!(k.brake || k.hold) });
      if (k.hold) pts.push({ v: k.hold, f, stop: true });
    }
    const n = pts.length;
    const d = [];
    for (let i = 0; i < n - 1; i++) d.push((pts[i + 1].f - pts[i].f) / (pts[i + 1].v - pts[i].v));
    const m = new Array(n).fill(0);
    m[0] = d[0] * 0.6; // already moving on the very first scroll
    for (let i = 1; i < n - 1; i++) m[i] = pts[i].stop || d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
    // Fritsch–Carlson: limit the tangents so the curve cannot overshoot.
    for (let i = 0; i < n - 1; i++) {
      if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
      const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
      if (s > 9) {
        const t = 3 / Math.sqrt(s);
        m[i] = t * a * d[i];
        m[i + 1] = t * b * d[i];
      }
    }
    return (v) => {
      if (v <= pts[0].v) return pts[0].f;
      if (v >= pts[n - 1].v) return pts[n - 1].f;
      let i = 0;
      while (v > pts[i + 1].v) i++;
      const p = pts[i], q = pts[i + 1], h = q.v - p.v, t = (v - p.v) / h;
      const t2 = t * t, t3 = t2 * t;
      return (2 * t3 - 3 * t2 + 1) * p.f + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * q.f + (t3 - t2) * h * m[i + 1];
    };
  }

  /* With reduced motion the film becomes a sequence of stills: one keyframe
     per beat, with a short crossfade halfway between them. */
  function stillPair(v) {
    const ks = C.keys;
    let i = 0;
    while (i < ks.length - 1 && v >= ks[i + 1].at) i++;
    const a = ks[i], b = ks[i + 1];
    const ia = frames.keyIndex(a.id);
    if (!b) return frames.pair(ia);
    const start = a.hold || a.at;
    const t = smoothstep(0.42, 0.58, (v - start) / (b.at - start));
    const ib = frames.keyIndex(b.id);
    if (!frames.images[ia] || !frames.images[ib]) return frames.pair(t < 0.5 ? ia : ib);
    return { a: ia, b: ib, mix: t };
  }

  /* Until the frames exist, label each moment with the shot that goes there. */
  function placeholderState(v, fade) {
    const ks = C.keys;
    let i = 0;
    while (i < ks.length - 1 && v >= ks[i + 1].at) i++;
    const a = ks[i], b = ks[i + 1];
    const settled = !b || v - (a.hold || a.at) < 10;
    const near = settled ? a : b.at - v < 10 ? b : null;
    return {
      light: colourAt(C.light, v),
      label: near ? near.id : `${a.id} → ${b.id}`,
      note: near ? near.note : "",
      fade,
    };
  }

  function filmState(v) {
    const fade = smoothstep(C.finale.nightFrom, C.finale.nightFull, v);
    if (!frames.available) return placeholderState(v, fade);
    const pair = reduceMotion ? stillPair(v) : frames.pair(curve(v));
    if (!pair) return null;
    return { ...pair, fade, focusX: 0.5, focusY: 0.5 };
  }

  let lastDraw = "";
  function drawFilm(v, time) {
    const s = filmState(v);
    if (!s) return;
    // WebGL redraws every frame for its moving grain; the others only on change.
    if (film.kind !== "webgl") {
      const sig = film.kind === "placeholder"
        ? `${s.label}|${s.light}|${s.fade.toFixed(3)}`
        : `${s.a}|${s.b}|${s.mix.toFixed(3)}|${s.fade.toFixed(3)}`;
      if (sig === lastDraw) return;
      lastDraw = sig;
    }
    try {
      film.renderer.draw(s, time);
    } catch (err) {
      if (film.kind !== "webgl") throw err;
      fallbackTo2D(); // e.g. images opened from disk cannot be uploaded to the GPU
      film.renderer.draw(s, time);
    }
  }

  function fallbackTo2D() {
    const fresh = document.createElement("canvas");
    fresh.id = el.film.id;
    fresh.className = el.film.className;
    el.film.replaceWith(fresh);
    el.film = fresh;
    film = { kind: "2d", renderer: new MC.render.CanvasRenderer(fresh, frames) };
    resize();
  }

  /* ------------------------------------------------------- finale, sound */
  const finale = new MC.Finale({
    canvas: el.sky,
    watch: el.watch,
    liveEls: { duration: $('[data-live="duration"]'), turns: $('[data-live="turns"]'), beats: $('[data-live="beats"]') },
    config: C,
    lite,
  });

  const sound = new MC.Sound(C);
  function setSoundButton(on) {
    el.sound.setAttribute("aria-pressed", String(on));
    el.soundState.textContent = on ? "on" : "off";
  }
  el.sound.addEventListener("click", async () => {
    if (sound.on) {
      sound.disable();
      setSoundButton(false);
    } else {
      setSoundButton(await sound.enable());
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (!sound.ctx) return;
    if (document.hidden) sound.ctx.suspend();
    else if (sound.on) sound.ctx.resume();
  });

  /* ----------------------------------------------------------- the scroll */
  let lenis = null;
  if (!reduceMotion) {
    lenis = new Lenis({ lerp: lite ? 0.12 : 0.075, wheelMultiplier: 0.8, smoothWheel: true, autoRaf: false });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    lenis.stop(); // until the loader has finished
  }
  gsap.ticker.lagSmoothing(0);

  const master = ScrollTrigger.create({ trigger: el.track, start: "top top", end: "bottom bottom" });
  const vNow = () => master.progress * TOTAL;
  const scrollFor = (v) => (v / TOTAL) * (lenis ? lenis.limit : document.documentElement.scrollHeight - window.innerHeight);

  /* The words, as one timeline scrubbed by the scroll (1 unit = 1 vh).
     Lines rise in one after another; the whole cue sinks away together. */
  function buildCopy() {
    const tl = gsap.timeline({
      defaults: { ease: "cine" },
      scrollTrigger: { trigger: el.track, start: "top top", end: "bottom bottom", scrub: true },
    });
    const lift = reduceMotion ? 0 : 22;
    for (const cue of C.cues) {
      const node = document.querySelector(`[data-cue="${cue.id}"]`);
      if (!node) continue;
      const lines = [...node.querySelectorAll("[data-line]")];
      const span = Math.min(cue.to, TOTAL) - cue.from;
      const dIn = Math.min(24, span * 0.38);
      const dOut = Math.min(18, span * 0.26);
      const step = Math.min(7, span * 0.09);
      if (cue.from > 0) {
        lines.forEach((line, i) => {
          const at = cue.from + i * step;
          tl.fromTo(line, { opacity: 0, y: lift }, { opacity: 1, y: 0, duration: Math.max(3, Math.min(dIn, TOTAL - at)) }, at);
        });
      }
      if (cue.to <= TOTAL) {
        tl.to(node, { opacity: 0, y: reduceMotion ? 0 : -14, duration: dOut, ease: "cineIn" }, cue.to - dOut);
      }
      const scrim = node.dataset.scrim === "low" ? el.scrimLow : node.dataset.scrim === "mid" ? el.scrimMid : null;
      if (scrim) {
        tl.to(scrim, { opacity: 1, duration: dIn }, cue.from);
        if (cue.to <= TOTAL) tl.to(scrim, { opacity: 0, duration: dOut, ease: "cineIn" }, cue.to - dOut);
      }
    }
    tl.set({}, {}, TOTAL); // the timeline spans exactly the film
    return tl;
  }
  buildCopy();

  /* Snap: when the visitor lets go near a resting point, glide onto it. */
  let lastInput = 0;
  let snapping = false;
  let rewinding = false;
  let dialogOpen = false;
  let started = false;
  let awaitingJourney = true;

  function onInput() {
    lastInput = performance.now();
    snapping = false;
    // The counter in the finale measures from the first scroll of the journey.
    if (awaitingJourney && started && !rewinding) {
      awaitingJourney = false;
      finale.journeyStart = performance.now();
    }
  }
  for (const type of ["wheel", "touchstart", "keydown", "pointerdown"]) {
    window.addEventListener(type, onInput, { passive: true });
  }

  function maybeSnap(v, now) {
    if (!lenis || !started || snapping || rewinding || dialogOpen) return;
    if (lenis.isScrolling || now - lastInput < 240) return;
    let best = null;
    for (const r of C.rests) {
      const d = Math.abs(r - v);
      if (d <= C.snapRange && d > 0.5 && (best === null || d < Math.abs(best - v))) best = r;
    }
    if (best === null) return;
    snapping = true;
    lenis.scrollTo(scrollFor(best), {
      duration: clamp(0.9 + Math.abs(best - v) / 50, 0.9, 1.8),
      easing: ease.cineInOut,
      onComplete: () => { snapping = false; },
    });
  }

  /* "Wind back": the whole film plays in reverse to the clouds, like winding
     a mechanical watch. */
  function windBack() {
    if (rewinding) return;
    sound.whoosh(6.2);
    awaitingJourney = true;
    finale.journeyStart = null;
    if (lenis) {
      rewinding = true;
      lenis.scrollTo(0, {
        duration: 6,
        easing: ease.cineInOut,
        lock: true,
        force: true,
        onComplete: () => { rewinding = false; },
      });
    } else {
      window.scrollTo(0, 0);
    }
  }
  el.windBack.addEventListener("click", windBack);
  el.home.addEventListener("click", (e) => {
    e.preventDefault();
    windBack();
  });

  /* Private viewing: a quiet panel over the film. */
  function openViewing() {
    if (el.dialog.open) return;
    el.dialog.showModal();
    dialogOpen = true;
    if (lenis) lenis.stop();
    gsap.fromTo(el.dialog, { opacity: 0, y: reduceMotion ? 0 : 16 }, { opacity: 1, y: 0, duration: 0.9, ease: "cine" });
  }
  el.dialog.addEventListener("close", () => {
    dialogOpen = false;
    if (lenis && started) lenis.start();
  });
  el.navViewing.addEventListener("click", openViewing);
  el.ctaViewing.addEventListener("click", openViewing);

  /* ------------------------------------------------------------ interface */
  let chapterIdx = -1;
  let gaugeH = 0;
  let gaugeTime = null;
  let gaugeText = "";
  let signoffLive = null;

  function formatScale(L) {
    const m = Math.pow(10, L);
    if (m >= 1000) {
      const km = m / 1000;
      return (km >= 9.95 ? Math.round(km) : km.toFixed(1)) + " km";
    }
    if (m >= 0.995) return Math.round(m) + " m";
    if (m >= 0.0995) return Math.round(m * 100) + " cm";
    const mm = m * 1000;
    if (mm >= 9.95) return Math.round(mm) + " mm";
    if (mm >= 0.995) return mm.toFixed(1) + " mm";
    return mm.toFixed(2).replace(/0$/, "") + " mm";
  }

  const clock = (sec) => `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;

  function setChapter(c, animate) {
    const parts = [el.chapterNum, el.chapterName];
    if (!animate) {
      el.chapterNum.textContent = c.num;
      el.chapterName.textContent = c.name;
      return;
    }
    gsap.to(parts, {
      opacity: 0,
      y: reduceMotion ? 0 : -6,
      duration: 0.35,
      ease: "cineIn",
      overwrite: true,
      onComplete: () => {
        el.chapterNum.textContent = c.num;
        el.chapterName.textContent = c.name;
        gsap.fromTo(parts, { opacity: 0, y: reduceMotion ? 0 : 8 }, { opacity: 1, y: 0, duration: 1.1, ease: "cine", stagger: 0.08 });
      },
    });
  }

  function updateInterface(v, now) {
    const i = C.chapters.findIndex((c) => v >= c.from && v < c.to);
    if (i >= 0 && i !== chapterIdx) {
      setChapter(C.chapters[i], chapterIdx !== -1);
      chapterIdx = i;
    }

    // The gauge: field of view on a log scale; in the finale, the visitor's time.
    const L = envelope(C.scale, v);
    el.gaugeMarker.style.transform = `translate3d(0, ${(((4 - L) / 8) * gaugeH).toFixed(1)}px, 0)`;
    const timeMode = v >= C.finale.ringClose;
    if (timeMode !== gaugeTime) {
      gaugeTime = timeMode;
      el.gauge.classList.toggle("is-time", timeMode);
      el.gaugeLabel.textContent = timeMode ? "your time with us" : "field of view";
    }
    const text = timeMode ? clock(finale.elapsed(now)) : formatScale(L);
    if (text !== gaugeText) {
      gaugeText = text;
      el.gaugeRead.textContent = text;
    }

    el.cue.classList.toggle("is-hidden", v > 4);

    // The sign-off's buttons only take clicks and focus once they are visible.
    const live = v > TOTAL - 16;
    if (live !== signoffLive) {
      signoffLive = live;
      el.signoff.classList.toggle("is-live", live);
      el.signoff.inert = !live;
    }
  }

  /* ----------------------------------------------------------------- size */
  function resize() {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, lite ? 1.5 : 2);
    // The frames are 1600 px wide; a larger backing store adds cost, not detail.
    const scale = Math.min(dpr, Math.sqrt((lite ? 2.2e6 : 4.2e6) / (W * H)));
    film.renderer.resize(Math.round(W * scale), Math.round(H * scale));
    finale.resize(W, H, Math.min(window.devicePixelRatio || 1, 2));
    gaugeH = el.gauge.getBoundingClientRect().height;
    lastDraw = "";
  }
  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      ScrollTrigger.refresh();
    }, 120);
  });

  /* ----------------------------------------------------------- every frame */
  let lastV = 0;
  let speed = 0;
  let ticks = 0;
  gsap.ticker.add((time, delta) => {
    const now = performance.now();
    const v = vNow();
    speed = lerp(speed, Math.abs(v - lastV) / (Math.max(delta, 1) / 1000), 0.2); // vh per second
    lastV = v;
    drawFilm(v, time);
    finale.update(v, now, time);
    updateInterface(v, now);
    sound.update(v, speed);
    if (curve && ++ticks % 12 === 0) frames.focus(Math.round(curve(v)));
    maybeSnap(v, now);
  });

  /* ------------------------------------------------------------------ boot */
  function setLoader(p) {
    el.loaderRing.style.strokeDashoffset = String(1 - p);
    el.loaderPct.textContent = String(Math.round(p * 100)).padStart(2, "0");
  }

  function intro() {
    const lines = $$('[data-cue="1"] [data-line]');
    gsap.fromTo(lines, { opacity: 0, y: reduceMotion ? 0 : 28 }, {
      opacity: 1, y: 0, duration: reduceMotion ? 0.6 : 2.4, ease: "cine", stagger: 0.3, delay: 0.2,
    });
    const frame = [".chrome", ".chapter", ".gauge", ".scroll-cue"].map((s) => $(s));
    gsap.fromTo(frame, { opacity: 0 }, {
      opacity: 1, duration: 1.6, ease: "cine", delay: 0.9, stagger: 0.1,
      onComplete: () => gsap.set(frame, { clearProps: "opacity" }),
    });
  }

  async function boot() {
    root.classList.add("is-loading");
    resize();
    setLoader(0);

    const fonts = document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, wait(2500)]) : Promise.resolve();
    let opening = Promise.resolve();
    if (frames.available) {
      // The loader waits for the first chapter; the rest streams in behind it.
      const firstUntil = frames.keyIndex("K03");
      const firstCount = frames.wanted.filter((i) => i <= firstUntil).length;
      opening = frames.start(firstUntil, () => setLoader(Math.min(1, frames.loadedCount / firstCount)));
    } else {
      gsap.to({ p: 0 }, { p: 1, duration: 0.8, ease: "cine", onUpdate() { setLoader(this.targets()[0].p); } });
      opening = wait(850);
    }
    await Promise.all([fonts, opening]);
    setLoader(1);
    await wait(reduceMotion ? 50 : 600);

    resize();
    ScrollTrigger.refresh();
    root.classList.remove("is-loading");
    gsap.to(el.loader, {
      opacity: 0, duration: reduceMotion ? 0.3 : 1.4, ease: "cineInOut",
      onComplete: () => el.loader.remove(),
    });
    started = true;
    finale.pageStart = performance.now();
    if (lenis) lenis.start();
    intro();
  }

  MC.sound = sound; // exposed for testing the mix from the console

  /* Jump to a point of the film (in vh), e.g. MC.goTo(1180) for the blue hour. */
  MC.goTo = (v, immediate = true) => {
    const y = scrollFor(clamp(v, 0, TOTAL));
    if (lenis) lenis.scrollTo(y, { immediate, force: true });
    else window.scrollTo(0, y);
  };

  boot();
})();
