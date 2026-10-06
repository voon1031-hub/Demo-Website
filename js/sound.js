/* =============================================================================
   MONTCIEL · Kairos — sound
   -----------------------------------------------------------------------------
   Every sound is synthesised live with the Web Audio API; the site ships no
   audio files. Each layer follows the scroll position through the envelopes in
   config.sound, so the mix is always in step with the picture, forwards or
   backwards:

     wind   the high air above the clouds (filtered noise with slow gusts)
     city   the low hum of Kuala Lumpur rising from below
     room   the warm hush of the salon behind the glass
     tick   the escapement: six beats a second, "tick" and "tock" voiced apart;
            inside the movement it turns low, large and reverberant
     air    the whirlwind as the tourbillon becomes the sky again
     pad    a quiet open chord when the stars appear
     chime  one soft "ding-dong", like a minute repeater, when the ring closes

   Browsers only allow audio after a click, so nothing is created until the
   visitor turns the sound on.
   ============================================================================= */
(function () {
  "use strict";

  const { clamp, envelope } = window.MC.util;

  /* Two seconds of stereo noise. Pink and brown noise sound softer and more
     natural than white noise for wind and room tone. */
  function noiseBuffer(ctx, seconds, colour) {
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        if (colour === "pink") { // Paul Kellet's filter
          b0 = 0.99886 * b0 + w * 0.0555179;
          b1 = 0.99332 * b1 + w * 0.0750759;
          b2 = 0.969 * b2 + w * 0.153852;
          b3 = 0.8665 * b3 + w * 0.3104856;
          b4 = 0.55 * b4 + w * 0.5329522;
          b5 = -0.7616 * b5 - w * 0.016898;
          d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
          b6 = w * 0.115926;
        } else if (colour === "brown") {
          last = (last + 0.02 * w) / 1.02;
          d[i] = last * 3.5;
        } else {
          d[i] = w;
        }
      }
    }
    return buf;
  }

  /* A synthetic concert-hall tail for the reverb. */
  function impulse(ctx, seconds, decay) {
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }

  class Sound {
    constructor(config) {
      this.cfg = config.sound;
      this.finale = config.finale;
      this.ctx = null;
      this.on = false;
      this.levels = { wind: 0, city: 0, room: 0, tick: 0, deep: 0, air: 0, pad: 0 };
      this.v = 0;
      this.prevV = 0;
      this.nextTick = 0;
      this.tock = false;
    }

    get supported() {
      return !!(window.AudioContext || window.webkitAudioContext);
    }

    async enable() {
      if (!this.supported) return false;
      if (!this.ctx) this.build();
      try { await this.ctx.resume(); } catch (e) { return false; }
      this.on = true;
      const t = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(t);
      this.master.gain.setTargetAtTime(0.85, t, 0.5); // a slow, soft fade in
      this.nextTick = t + 0.1;
      clearInterval(this.timer);
      this.timer = setInterval(() => this.schedule(), 25);
      clearTimeout(this.sleepTimer);
      return true;
    }

    disable() {
      if (!this.ctx) return;
      this.on = false;
      const t = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(t);
      this.master.gain.setTargetAtTime(0, t, 0.2);
      clearTimeout(this.sleepTimer);
      this.sleepTimer = setTimeout(() => {
        if (this.on) return;
        clearInterval(this.timer);
        this.ctx.suspend();
      }, 1400);
    }

    /* ----------------------------------------------------------- the graph */
    build() {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const ctx = (this.ctx = new Ctx());
      const gain = (v = 0) => { const g = ctx.createGain(); g.gain.value = v; return g; };
      const filter = (type, freq, q = 0.7) => { const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q; return f; };
      const loop = (buf) => { const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true; s.start(0, Math.random() * buf.duration); return s; };
      const lfo = (freq, depth, target) => { const o = ctx.createOscillator(); o.frequency.value = freq; const g = gain(depth); o.connect(g).connect(target); o.start(); return o; };

      // Master bus with a gentle compressor so nothing ever spikes.
      this.master = gain(0);
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -16;
      comp.knee.value = 14;
      comp.ratio.value = 3.5;
      comp.attack.value = 0.006;
      comp.release.value = 0.35;
      this.master.connect(comp).connect(ctx.destination);

      // A shared reverb for the ticks inside the movement, the whirlwind and the chime.
      const verb = ctx.createConvolver();
      verb.buffer = impulse(ctx, 3.4, 2.4);
      this.verbIn = gain(1);
      const verbOut = gain(0.5);
      this.verbIn.connect(verb).connect(verbOut).connect(this.master);

      const white = noiseBuffer(ctx, 2, "white");
      const pink = noiseBuffer(ctx, 4, "pink");
      const brown = noiseBuffer(ctx, 4, "brown");
      this.white = white;
      this.pink = pink;

      // Wind: pink noise through a wandering band-pass, with slow gusts.
      this.windBand = filter("bandpass", 480, 0.55);
      this.windLow = filter("lowpass", 1500, 0.3);
      const gust = gain(0.8);
      this.wind = gain(0);
      loop(pink).connect(this.windBand).connect(this.windLow).connect(gust).connect(this.wind).connect(this.master);
      lfo(0.07, 240, this.windBand.frequency);
      lfo(0.11, 0.22, gust.gain);
      const hiss = gain(0.12); // the thin, high edge of the air
      loop(white).connect(filter("highpass", 4200, 0.5)).connect(hiss).connect(this.wind);

      // City: a deep brown-noise rumble plus a faint, distant traffic band.
      this.city = gain(0);
      loop(brown).connect(filter("lowpass", 210, 0.5)).connect(this.city).connect(this.master);
      const traffic = gain(0.25);
      loop(pink).connect(filter("bandpass", 760, 0.9)).connect(traffic).connect(this.city);
      lfo(0.045, 0.12, traffic.gain);

      // Room: the hush of a quiet room high above the city.
      this.room = gain(0);
      loop(brown).connect(filter("lowpass", 150, 0.4)).connect(this.room).connect(this.master);
      const air = gain(0.18);
      loop(white).connect(filter("bandpass", 5200, 0.8)).connect(air).connect(this.room);

      // The whirlwind: noise through a band-pass that sweeps upward with the spin.
      this.whirlBand = filter("bandpass", 320, 1.4);
      this.air = gain(0);
      loop(pink).connect(this.whirlBand).connect(this.air);
      this.air.connect(this.master);
      const airSend = gain(0.35);
      this.air.connect(airSend).connect(this.verbIn);
      lfo(0.16, 90, this.whirlBand.frequency);

      // Pad: an open D–A–E chord on soft sine pairs, slightly detuned so it breathes.
      this.pad = gain(0);
      const padTone = filter("lowpass", 1100, 0.4);
      padTone.connect(this.pad).connect(this.master);
      const padSend = gain(0.6);
      this.pad.connect(padSend).connect(this.verbIn);
      for (const f of [146.83, 220.0, 329.63]) {
        for (const detune of [-5, 5]) {
          const o = ctx.createOscillator();
          o.type = "sine";
          o.frequency.value = f;
          o.detune.value = detune;
          const g = gain(f > 300 ? 0.12 : 0.18);
          o.connect(g).connect(padTone);
          o.start();
        }
      }
      lfo(0.05, 260, padTone.frequency);

      // Ticks are short events; they share a bus and a reverb send.
      this.tickBus = gain(1);
      this.tickBus.connect(this.master);
      this.tickSend = gain(0);
      this.tickBus.connect(this.tickSend).connect(this.verbIn);
    }

    /* ------------------------------------------------- one escapement beat */
    playTick(t, tock) {
      const ctx = this.ctx;
      const lvl = this.levels.tick;
      const deep = this.levels.deep;
      if (lvl < 0.002) return;

      // The click: a few milliseconds of noise through a narrow band-pass.
      const src = ctx.createBufferSource();
      src.buffer = this.white;
      const band = ctx.createBiquadFilter();
      band.type = "bandpass";
      band.frequency.value = tock ? 2300 : 3150;
      band.Q.value = 7;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.9 * lvl * (1 - 0.45 * deep), t + 0.0015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
      src.connect(band).connect(g).connect(this.tickBus);
      src.start(t, Math.random() * 1.5, 0.06);

      // A tiny metallic ring after the click.
      const ping = ctx.createOscillator();
      ping.frequency.value = tock ? 4100 : 4750;
      const pg = ctx.createGain();
      pg.gain.setValueAtTime(0.0001, t);
      pg.gain.exponentialRampToValueAtTime(0.1 * lvl + 0.0001, t + 0.002);
      pg.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
      ping.connect(pg).connect(this.tickBus);
      ping.start(t);
      ping.stop(t + 0.09);

      // Inside the movement the beat becomes a deep, slow thud.
      if (deep > 0.01) {
        const thud = ctx.createOscillator();
        thud.frequency.setValueAtTime(tock ? 96 : 118, t);
        thud.frequency.exponentialRampToValueAtTime(46, t + 0.2);
        const tg = ctx.createGain();
        tg.gain.setValueAtTime(0.0001, t);
        tg.gain.exponentialRampToValueAtTime(0.2 * deep * lvl + 0.0001, t + 0.004);
        tg.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
        thud.connect(tg).connect(this.tickBus);
        thud.start(t);
        thud.stop(t + 0.36);
      }
    }

    /* Beats per second at this point of the film: six, slowing to a stop as
       the tourbillon dissolves into the whirlwind. */
    tickRate() {
      const c = this.cfg;
      const p = clamp((this.v - c.tickStopFrom) / (c.tickStopAt - c.tickStopFrom), 0, 1);
      return c.tickRate * Math.pow(1 - p, 1.6);
    }

    schedule() {
      if (!this.on || !this.ctx) return;
      const now = this.ctx.currentTime;
      const rate = this.tickRate();
      if (rate < 0.2 || this.levels.tick < 0.002) {
        this.nextTick = Math.max(this.nextTick, now + 0.05);
        return;
      }
      if (this.nextTick < now - 0.2) this.nextTick = now + 0.02; // tab was asleep
      while (this.nextTick < now + 0.12) {
        this.tock = !this.tock;
        this.playTick(this.nextTick, this.tock);
        this.nextTick += 1 / rate;
      }
    }

    /* ----------------------------------------------------- the ring closes */
    chime() {
      if (!this.on || !this.ctx) return;
      const ctx = this.ctx;
      const t0 = ctx.currentTime + 0.02;
      const bus = ctx.createGain();
      bus.gain.value = 0.16;
      bus.connect(this.master);
      const send = ctx.createGain();
      send.gain.value = 0.6;
      bus.connect(send).connect(this.verbIn);
      // A bell: inharmonic partials with long, staggered decays.
      const partials = [[0.5, 0.2, 4.2], [1, 1, 3.6], [2, 0.42, 2.2], [2.76, 0.3, 1.6], [4.07, 0.16, 1.0], [5.4, 0.1, 0.7]];
      for (const [freq, at] of [[1046.5, 0], [783.99, 0.62]]) {
        for (const [ratio, amp, decay] of partials) {
          const o = ctx.createOscillator();
          o.frequency.value = freq * ratio;
          const g = ctx.createGain();
          const t = t0 + at;
          g.gain.setValueAtTime(0.0001, t);
          g.gain.exponentialRampToValueAtTime(amp, t + 0.005);
          g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
          o.connect(g).connect(bus);
          o.start(t);
          o.stop(t + decay + 0.05);
        }
      }
    }

    /* A long falling rush of air for "Wind back". */
    whoosh(seconds) {
      if (!this.on || !this.ctx) return;
      const ctx = this.ctx;
      const t = ctx.currentTime;
      const src = ctx.createBufferSource();
      src.buffer = this.pink;
      src.loop = true;
      const band = ctx.createBiquadFilter();
      band.type = "bandpass";
      band.Q.value = 1.1;
      band.frequency.setValueAtTime(2600, t);
      band.frequency.exponentialRampToValueAtTime(260, t + seconds);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.5, t + seconds * 0.25);
      g.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
      src.connect(band).connect(g).connect(this.master);
      g.connect(this.verbIn);
      src.start(t);
      src.stop(t + seconds + 0.1);
    }

    /* ------------------------------------------------- called every frame */
    update(v, speed) {
      this.prevV = this.v;
      this.v = v;
      const c = this.cfg;
      for (const k in this.levels) this.levels[k] = clamp(envelope(c[k], v), 0, 1);
      if (!this.on || !this.ctx) return;
      const t = this.ctx.currentTime;
      const k = 0.12; // smoothing time constant (s)
      const rush = clamp(speed / 120, 0, 1); // faster scrolling, brighter wind
      this.wind.gain.setTargetAtTime(this.levels.wind * (0.46 + 0.16 * rush), t, k);
      this.windLow.frequency.setTargetAtTime(1100 + 2600 * rush, t, 0.2);
      this.city.gain.setTargetAtTime(this.levels.city * 0.36, t, k);
      this.room.gain.setTargetAtTime(this.levels.room * 0.3, t, k);
      this.tickSend.gain.setTargetAtTime(this.levels.deep * 0.45, t, k);
      const whirl = clamp((v - 985) / (1180 - 985), 0, 1);
      this.whirlBand.frequency.setTargetAtTime(300 + 2100 * whirl, t, 0.2);
      this.air.gain.setTargetAtTime(this.levels.air * 0.6, t, k);
      this.pad.gain.setTargetAtTime(this.levels.pad * 0.09, t, 0.4);

      // The chime rings once each time the ring closes going forwards.
      const close = this.finale.ringClose;
      if (this.prevV < close && v >= close && !this.chimed) {
        this.chimed = true;
        this.chime();
      }
      if (v < close - 30) this.chimed = false;
    }
  }

  window.MC = window.MC || {};
  window.MC.Sound = Sound;
})();
