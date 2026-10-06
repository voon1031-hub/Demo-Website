/* =============================================================================
   MONTCIEL · Kairos — frame loader
   -----------------------------------------------------------------------------
   The film is a sequence of still frames (assets/film/000.webp …) cut from the
   generated video segments by tools/fetch-media.sh, which also writes
   assets/film/film.js:

     window.FILM = { count, ext, width, height,
                     segments: [{ name: "film-01", start, count }, …] }

   Segment n runs from keyframe K(n) to K(n+1) and shares its first frame with
   the previous segment's last one, so keyframe K(n+1) is the last frame of
   segment n. If film.js is missing (frames not generated yet) the loader
   reports `available = false` and the renderer draws placeholder frames.
   ============================================================================= */
(function () {
  "use strict";

  class Frames {
    /**
     * @param {object|null} manifest  window.FILM, or null
     * @param {object} opts
     * @param {string} opts.base      folder holding the frames
     * @param {number} opts.step      1 = every frame, 2 = every second frame (phones)
     * @param {number} opts.parallel  how many images download at once
     */
    constructor(manifest, { base = "assets/film/", step = 1, parallel = 6 } = {}) {
      this.manifest = manifest && manifest.count > 0 ? manifest : null;
      this.available = !!this.manifest;
      this.base = base;
      this.step = Math.max(1, step | 0);
      this.parallel = parallel;
      this.count = this.available ? this.manifest.count : 0;
      this.width = this.available ? this.manifest.width : 1600;
      this.height = this.available ? this.manifest.height : 900;
      this.images = new Array(this.count).fill(null); // decoded <img> per frame, or null
      this.loadedCount = 0;
      this.queue = [];
      this.inFlight = 0;
      this.waiters = [];
      this.failed = new Set();

      if (!this.available) return;

      // Which frames to fetch: every `step`-th frame, plus every keyframe so the
      // camera always rests on an exact keyframe, plus the very last frame.
      const want = new Set();
      for (let i = 0; i < this.count; i += this.step) want.add(i);
      for (const s of this.manifest.segments) want.add(s.start + s.count - 1);
      want.add(0);
      want.add(this.count - 1);
      this.wanted = [...want].sort((a, b) => a - b);
      this.wantedSet = want;
      this.queue = this.wanted.slice();
    }

    /** Frame index of keyframe "K01" … "K11" (clamped if a segment is missing). */
    keyIndex(id) {
      if (!this.available) return 0;
      const n = parseInt(id.slice(1), 10);
      if (n <= 1) return 0;
      const seg = this.manifest.segments[Math.min(n - 2, this.manifest.segments.length - 1)];
      return seg.start + seg.count - 1;
    }

    url(i) {
      return `${this.base}${String(i).padStart(3, "0")}.${this.manifest.ext}`;
    }

    /** Start downloading. Resolves once frames 0…firstUntil are decoded. */
    start(firstUntil, onProgress) {
      if (!this.available) return Promise.resolve();
      this.onProgress = onProgress;
      const first = this.wanted.filter((i) => i <= firstUntil);
      const ready = new Promise((resolve) => this.waiters.push({ need: first, resolve }));
      this.pump();
      return ready;
    }

    /** Move the frames around `centre` to the front of the queue, so a visitor
        who scrolls ahead of the download sees real frames sooner. */
    focus(centre) {
      if (!this.available || this.queue.length === 0) return;
      const near = [];
      const rest = [];
      for (const i of this.queue) (Math.abs(i - centre) <= 24 ? near : rest).push(i);
      if (near.length === 0 || this.queue[0] === near[0]) return;
      near.sort((a, b) => Math.abs(a - centre) - Math.abs(b - centre));
      this.queue = near.concat(rest);
    }

    pump() {
      while (this.inFlight < this.parallel && this.queue.length) {
        const i = this.queue.shift();
        if (this.images[i]) continue;
        this.inFlight++;
        this.fetch(i).finally(() => {
          this.inFlight--;
          this.pump();
        });
      }
    }

    fetch(i) {
      const img = new Image();
      img.decoding = "async";
      img.src = this.url(i);
      return img
        .decode()
        .then(() => {
          this.images[i] = img;
          this.loadedCount++;
          if (this.onProgress) this.onProgress(this.loadedCount / this.wanted.length);
          this.checkWaiters();
        })
        .catch(() => {
          // A missing frame is skipped; the renderer shows the nearest loaded one.
          this.failed.add(i);
          this.checkWaiters();
        });
    }

    checkWaiters() {
      this.waiters = this.waiters.filter((w) => {
        const done = w.need.every((i) => this.images[i] || this.failed.has(i));
        if (done) w.resolve();
        return !done;
      });
    }

    /** The loaded frames either side of a fractional frame position:
        { a, b, mix } where the picture is a crossfade from a to b. */
    pair(f) {
      if (!this.available) return null;
      const max = this.count - 1;
      f = Math.min(Math.max(f, 0), max);
      let lo = Math.floor(f);
      let hi = Math.min(lo + 1, max);
      while (lo > 0 && !this.images[lo]) lo--;
      while (hi < max && !this.images[hi]) hi++;
      if (!this.images[lo] && !this.images[hi]) {
        // Nothing near is loaded yet: show the nearest frame that is.
        const near = this.nearest(Math.round(f));
        return near < 0 ? null : { a: near, b: near, mix: 0 };
      }
      if (!this.images[lo]) return { a: hi, b: hi, mix: 0 };
      if (!this.images[hi] || hi === lo) return { a: lo, b: lo, mix: 0 };
      return { a: lo, b: hi, mix: (f - lo) / (hi - lo) };
    }

    nearest(i) {
      for (let d = 0; d < this.count; d++) {
        if (this.images[i - d]) return i - d;
        if (this.images[i + d]) return i + d;
      }
      return -1;
    }
  }

  window.MC = window.MC || {};
  window.MC.Frames = Frames;
})();
