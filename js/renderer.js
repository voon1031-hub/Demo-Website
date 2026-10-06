/* =============================================================================
   MONTCIEL · Kairos — film renderer
   -----------------------------------------------------------------------------
   Draws the current film frame on a full-screen canvas, cropped like
   `object-fit: cover`, so the picture always fills the screen edge to edge.

   Three implementations behind one interface, draw(state):
     · WebGL   blends the two frames either side of the scroll position (so
               ~400 frames still read as continuous motion), adds a soft
               vignette and moving film grain, and fades to midnight.
     · 2D      the same picture with canvas 2D (phones, or wherever WebGL is
               unavailable, e.g. when index.html is opened from disk and the
               browser refuses to upload local images to the GPU).
     · Placeholder  used until the frames exist: a colour field in the light
               of that moment, labelled with the shot that will go there.

   state = { a, b, mix,        frame indices and crossfade (from Frames.pair)
             fade,             0–1 fade to midnight (finale)
             light,            [r,g,b] light of this moment (placeholder)
             label, note,      placeholder caption
             focusX, focusY }  where to anchor the cover crop (0–1)
   ============================================================================= */
(function () {
  "use strict";

  const NIGHT = [7 / 255, 11 / 255, 21 / 255]; // #070b15, the page's midnight

  const VERT = `
    attribute vec2 aPos;
    varying vec2 vUv;
    void main() {
      vUv = aPos * 0.5 + 0.5;
      gl_Position = vec4(aPos, 0.0, 1.0);
    }`;

  const FRAG = `
    precision mediump float;
    uniform sampler2D uA;
    uniform sampler2D uB;
    uniform float uMix;       // crossfade a → b
    uniform vec2  uScale;     // cover crop: visible part of the image …
    uniform vec2  uOffset;    // … and where it starts
    uniform vec2  uRes;       // canvas size in px
    uniform float uTime;      // seconds, animates the grain
    uniform float uGrain;     // grain strength
    uniform float uVignette;  // edge darkening
    uniform vec3  uNight;     // midnight colour
    uniform float uFade;      // 0 → 1 fade to midnight
    varying vec2 vUv;

    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }

    void main() {
      vec2 uv = vUv * uScale + uOffset;
      vec3 c = mix(texture2D(uA, uv).rgb, texture2D(uB, uv).rgb, uMix);

      // Vignette, corrected for the screen's aspect ratio.
      vec2 q = vUv - 0.5;
      q.x *= uRes.x / uRes.y;
      float v = smoothstep(1.1, 0.28, length(q));
      c *= mix(1.0 - uVignette, 1.0, v);

      // Fine luminance grain, re-seeded every frame like real film.
      float n = hash(gl_FragCoord.xy + fract(uTime * 7.0) * 311.0) - 0.5;
      c += n * uGrain;

      c = mix(c, uNight, uFade);
      gl_FragColor = vec4(c, 1.0);
    }`;

  /* The part of an image (iw × ih) that covers a canvas (cw × ch), anchored at
     focus (fx, fy) — the same maths as CSS object-fit: cover + object-position. */
  function coverRect(iw, ih, cw, ch, fx = 0.5, fy = 0.5) {
    const ia = iw / ih;
    const ca = cw / ch;
    let w = 1, h = 1; // visible fraction of the image
    if (ca > ia) h = ia / ca; else w = ca / ia;
    return { w, h, x: (1 - w) * fx, y: (1 - h) * fy };
  }

  /* ------------------------------------------------------------------ WebGL */
  class GLRenderer {
    constructor(canvas, frames, { grain = 0.035, vignette = 0.32 } = {}) {
      this.canvas = canvas;
      this.frames = frames;
      this.grain = grain;
      this.vignette = vignette;
      const gl = canvas.getContext("webgl", { alpha: false, antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: false });
      if (!gl) throw new Error("WebGL unavailable");
      this.gl = gl;
      this.program = this.link(VERT, FRAG);
      gl.useProgram(this.program);

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(this.program, "aPos");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

      this.u = {};
      for (const name of ["uA", "uB", "uMix", "uScale", "uOffset", "uRes", "uTime", "uGrain", "uVignette", "uNight", "uFade"]) {
        this.u[name] = gl.getUniformLocation(this.program, name);
      }
      gl.uniform1i(this.u.uA, 0);
      gl.uniform1i(this.u.uB, 1);
      gl.uniform3fv(this.u.uNight, NIGHT);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

      // Small cache of uploaded frames: scrolling forward reuses frame b as the
      // next frame a, so most steps upload a single new image.
      this.cache = new Map(); // frame index → { tex, used }
      this.clock = 0;
    }

    link(vs, fs) {
      const gl = this.gl;
      const compile = (type, src) => {
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
        return s;
      };
      const p = gl.createProgram();
      gl.attachShader(p, compile(gl.VERTEX_SHADER, vs));
      gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
      return p;
    }

    texture(i) {
      const gl = this.gl;
      const hit = this.cache.get(i);
      if (hit) {
        hit.used = ++this.clock;
        return hit.tex;
      }
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      // Throws a SecurityError for file:// images in some browsers; main.js
      // catches it and falls back to the 2D renderer.
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.frames.images[i]);
      this.cache.set(i, { tex, used: ++this.clock });
      if (this.cache.size > 6) {
        let oldest = null;
        for (const [k, v] of this.cache) if (!oldest || v.used < oldest[1].used) oldest = [k, v];
        gl.deleteTexture(oldest[1].tex);
        this.cache.delete(oldest[0]);
      }
      return tex;
    }

    resize(w, h) {
      this.canvas.width = w;
      this.canvas.height = h;
      this.gl.viewport(0, 0, w, h);
    }

    draw(state, time) {
      const gl = this.gl;
      const { a, b, mix } = state;
      const ta = this.texture(a);
      const tb = b === a ? ta : this.texture(b);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, ta);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, tb);

      const w = this.canvas.width, h = this.canvas.height;
      const r = coverRect(this.frames.width, this.frames.height, w, h, state.focusX, state.focusY);
      gl.uniform1f(this.u.uMix, mix);
      gl.uniform2f(this.u.uScale, r.w, r.h);
      // Texture rows are flipped, so the vertical offset is measured from the bottom.
      gl.uniform2f(this.u.uOffset, r.x, 1 - r.h - r.y);
      gl.uniform2f(this.u.uRes, w, h);
      gl.uniform1f(this.u.uTime, time);
      gl.uniform1f(this.u.uGrain, this.grain);
      gl.uniform1f(this.u.uVignette, this.vignette);
      gl.uniform1f(this.u.uFade, state.fade || 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
  }

  /* --------------------------------------------------------------------- 2D */
  class CanvasRenderer {
    constructor(canvas, frames, { vignette = 0.3 } = {}) {
      this.canvas = canvas;
      this.frames = frames;
      this.ctx = canvas.getContext("2d", { alpha: false });
      this.vignette = vignette;
    }

    resize(w, h) {
      this.canvas.width = w;
      this.canvas.height = h;
      const g = this.ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.25, w / 2, h / 2, Math.hypot(w, h) * 0.6);
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(1, `rgba(0,0,0,${this.vignette})`);
      this.vignetteFill = g;
    }

    cover(img, alpha, fx, fy) {
      const { width: w, height: h } = this.canvas;
      const r = coverRect(img.naturalWidth, img.naturalHeight, w, h, fx, fy);
      this.ctx.globalAlpha = alpha;
      this.ctx.drawImage(img, r.x * img.naturalWidth, r.y * img.naturalHeight, r.w * img.naturalWidth, r.h * img.naturalHeight, 0, 0, w, h);
    }

    draw(state) {
      const ctx = this.ctx;
      const { width: w, height: h } = this.canvas;
      const imgs = this.frames.images;
      this.cover(imgs[state.a], 1, state.focusX, state.focusY);
      if (state.b !== state.a && state.mix > 0.004) this.cover(imgs[state.b], state.mix, state.focusX, state.focusY);
      ctx.globalAlpha = 1;
      ctx.fillStyle = this.vignetteFill;
      ctx.fillRect(0, 0, w, h);
      if (state.fade > 0.001) {
        ctx.globalAlpha = state.fade;
        ctx.fillStyle = "#070b15";
        ctx.fillRect(0, 0, w, h);
        ctx.globalAlpha = 1;
      }
    }
  }

  /* ------------------------------------------------------------ placeholder */
  class PlaceholderRenderer {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d", { alpha: false });
    }

    resize(w, h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }

    draw(state) {
      const ctx = this.ctx;
      const { width: w, height: h } = this.canvas;
      const [r, g, b] = state.light || [20, 26, 40];
      const dim = (k) => `rgb(${Math.round(r * k)},${Math.round(g * k)},${Math.round(b * k)})`;
      const grad = ctx.createRadialGradient(w * 0.5, h * 0.42, 0, w * 0.5, h * 0.5, Math.hypot(w, h) * 0.62);
      grad.addColorStop(0, dim(0.95));
      grad.addColorStop(0.55, dim(0.62));
      grad.addColorStop(1, dim(0.28));
      ctx.globalAlpha = 1;
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      if (state.label) {
        const s = Math.max(1, w / 1600);
        ctx.fillStyle = "rgba(255,255,255,0.42)";
        ctx.textAlign = "center";
        ctx.font = `${Math.round(13 * s)}px Montserrat, "Helvetica Neue", Arial, sans-serif`;
        ctx.fillText(state.label, w / 2, h * 0.5 - 14 * s);
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.font = `italic ${Math.round(15 * s)}px "Playfair Display", Georgia, serif`;
        ctx.fillText(state.note || "", w / 2, h * 0.5 + 14 * s);
      }
      if (state.fade > 0.001) {
        ctx.globalAlpha = state.fade;
        ctx.fillStyle = "#070b15";
        ctx.fillRect(0, 0, w, h);
        ctx.globalAlpha = 1;
      }
    }
  }

  /* Pick the best renderer for this device. */
  function createRenderer(canvas, frames, { lite }) {
    if (!frames.available) return { kind: "placeholder", renderer: new PlaceholderRenderer(canvas) };
    if (!lite) {
      try {
        return { kind: "webgl", renderer: new GLRenderer(canvas, frames) };
      } catch (e) {
        /* fall through to 2D */
      }
    }
    return { kind: "2d", renderer: new CanvasRenderer(canvas, frames) };
  }

  window.MC = window.MC || {};
  window.MC.render = { createRenderer, GLRenderer, CanvasRenderer, PlaceholderRenderer, coverRect };
})();
