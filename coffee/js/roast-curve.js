/* 叻山咖啡 Lat Hill — interactive roast curve
   Used by the static home page, and inlined into the Elementor HTML widget.

   LatHillRoastCurve.init(chartElement, data, getLang)
     data     { markers, turning, stages } from tools/content.py. Each text is
              either a plain string, or { zh, en } to write both languages
              (the static site's CSS shows the active one).
     getLang  optional function returning "zh" or "en", used for the value
              screen readers announce. */
(function () {
  "use strict";
  if (window.LatHillRoastCurve) return;

  var NS = "http://www.w3.org/2000/svg";
  var T_MIN = 50, T_MAX = 250, DURATION = 12; // °C, minutes

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function html(x) {
    return typeof x === "string" ? esc(x) : '<span lang="zh-Hans">' + x.zh + '</span><span lang="en">' + x.en + "</span>";
  }
  function pick(x, l) { return typeof x === "string" ? x : x[l]; }

  // Bean temperature over a 12-minute roast: drop after charging, turning
  // point at 1:30, then a rise that slows down towards the end.
  function temp(t) {
    if (t < 1.5) return 200 - 110 * Math.sin((t / 1.5) * Math.PI / 2);
    var k = 6;
    return 90 + 138 * (1 - Math.exp(-(t - 1.5) / k)) / (1 - Math.exp(-10.5 / k));
  }
  function timeAt(T) { // first moment after the turning point the bean reaches T
    var lo = 1.5, hi = DURATION;
    for (var i = 0; i < 40; i++) { var mid = (lo + hi) / 2; if (temp(mid) < T) lo = mid; else hi = mid; }
    return (lo + hi) / 2;
  }
  var colorStops = [
    [90, [143, 149, 102]], [150, [195, 168, 94]], [175, [176, 122, 62]],
    [196, [147, 88, 47]], [210, [116, 67, 42]], [222, [85, 50, 32]], [230, [53, 32, 26]]
  ];
  function beanColor(T) {
    var c = colorStops[colorStops.length - 1][1];
    if (T <= colorStops[0][0]) c = colorStops[0][1];
    else for (var i = 1; i < colorStops.length; i++) {
      if (T <= colorStops[i][0]) {
        var a = colorStops[i - 1], b = colorStops[i], p = (T - a[0]) / (b[0] - a[0]);
        c = a[1].map(function (v, j) { return Math.round(v + (b[1][j] - v) * p); });
        break;
      }
    }
    return "rgb(" + c.join(",") + ")";
  }
  function clock(sec) { var s = Math.round(sec); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }

  function init(chart, data, getLang) {
    var card = chart.closest(".roast-card") || chart.parentNode;
    var svg = chart.querySelector("svg");
    var range = chart.querySelector(".roast-range");
    var lang = getLang || function () { return "zh"; };
    // Plot box in SVG units; phones get a narrower viewBox so the labels stay legible
    var W, H, X0, X1, Y0, Y1, compact = null, cLine, cDot;
    function x(t) { return X0 + (t / DURATION) * (X1 - X0); }
    function y(T) { return Y1 - ((T - T_MIN) / (T_MAX - T_MIN)) * (Y1 - Y0); }
    function el(name, attrs, parent) {
      var n = document.createElementNS(NS, name);
      for (var k in attrs) n.setAttribute(k, attrs[k]);
      (parent || svg).appendChild(n);
      return n;
    }

    function draw() {
      var isCompact = svg.getBoundingClientRect().width < 460;
      if (isCompact === compact) return false;
      compact = isCompact;
      W = compact ? 380 : 560; H = compact ? 270 : 300;
      X0 = compact ? 36 : 44; X1 = W - 16; Y0 = 20; Y1 = H - 36;
      svg.innerHTML = "";
      svg.setAttribute("viewBox", "0 0 " + W + " " + H);

      var defs = el("defs", {});
      var cg = el("linearGradient", { id: "curveGrad", x1: "0", x2: "1", y1: "0", y2: "0" }, defs);
      [["0%", "#8f9566"], ["45%", "#c3a85e"], ["75%", "#d9a86c"], ["100%", "#b8643a"]].forEach(function (s) {
        el("stop", { offset: s[0], "stop-color": s[1] }, cg);
      });
      var ag = el("linearGradient", { id: "areaGrad", x1: "0", x2: "0", y1: "0", y2: "1" }, defs);
      el("stop", { offset: "0%", "stop-color": "#d9a86c", "stop-opacity": "0.22" }, ag);
      el("stop", { offset: "100%", "stop-color": "#d9a86c", "stop-opacity": "0" }, ag);

      var grid = el("g", { class: "grid" }), axis = el("g", { class: "axis" });
      for (var T = 50; T <= 250; T += 50) {
        el("line", { x1: X0, x2: X1, y1: y(T), y2: y(T) }, grid);
        el("text", { x: X0 - 8, y: y(T) + 4, "text-anchor": "end" }, axis).textContent = T + "°";
      }
      for (var m = 0; m <= DURATION; m += 2) {
        el("text", { x: x(m), y: H - 12, "text-anchor": "middle" }, axis).textContent = m + "′";
      }

      // Roast events (labelled in both languages when given both)
      var markers = el("g", { class: "marker" });
      [[160, "yellow"], [196, "first"], [224, "second"]].forEach(function (mk) {
        var mx = x(timeAt(mk[0])), label = data.markers[mk[1]];
        el("line", { x1: mx, x2: mx, y1: Y0 + 14, y2: Y1 }, markers);
        if (typeof label === "string") {
          el("text", { x: mx, y: Y0 + 4, "text-anchor": "middle" }, markers).textContent = label;
        } else {
          el("text", { x: mx, y: Y0 + 4, "text-anchor": "middle", lang: "zh-Hans" }, markers).textContent = label.zh;
          el("text", { x: mx, y: Y0 + 4, "text-anchor": "middle", lang: "en" }, markers).textContent = label.en;
        }
      });

      var pts = [];
      for (var i = 0; i <= 240; i++) {
        var t = (i / 240) * DURATION;
        pts.push(x(t).toFixed(1) + "," + y(temp(t)).toFixed(1));
      }
      el("path", { class: "curve-area", d: "M" + pts.join(" L") + " L" + X1 + "," + Y1 + " L" + X0 + "," + Y1 + " Z" });
      var curve = el("path", { class: "curve", d: "M" + pts.join(" L") });
      chart.style.setProperty("--len", Math.ceil(curve.getTotalLength()));

      var cursor = el("g", { class: "cursor" });
      cLine = el("line", { class: "cursor-line", y1: Y0 + 14, y2: Y1 }, cursor);
      cDot = el("circle", { class: "cursor-dot", r: 8 }, cursor);
      return true;
    }
    draw();

    var swatch = card.querySelector("[data-bean]");
    var out = {
      time: card.querySelector("[data-out-time]"), temp: card.querySelector("[data-out-temp]"),
      stage: card.querySelector("[data-out-stage]"), use: card.querySelector("[data-out-use]"),
      notes: card.querySelector("[data-out-notes]")
    };
    var lastStage = null, current = 0;
    function stageAt(t, T) {
      if (t < 1.5) return data.turning;
      for (var i = 0; i < data.stages.length; i++) if (T < data.stages[i].max) return data.stages[i];
      return data.stages[data.stages.length - 1];
    }
    function valueText() {
      var t = current / 60, T = temp(t), stage = stageAt(t, T), l = lang();
      range.setAttribute("aria-valuetext", l === "zh"
        ? clock(current) + "，豆温 " + Math.round(T) + " 度，" + pick(stage.name, l)
        : clock(current) + ", bean " + Math.round(T) + "°C, " + pick(stage.name, l));
    }
    function update(sec) {
      current = sec;
      var t = sec / 60, T = temp(t), stage = stageAt(t, T);
      var color = beanColor(t < 1.5 ? 90 : T);
      cLine.setAttribute("x1", x(t)); cLine.setAttribute("x2", x(t));
      cDot.setAttribute("cx", x(t)); cDot.setAttribute("cy", y(T)); cDot.setAttribute("fill", color);
      if (swatch) swatch.setAttribute("fill", color);
      if (out.time) out.time.textContent = clock(sec);
      if (out.temp) out.temp.textContent = Math.round(T) + "°C";
      if (stage !== lastStage) {
        lastStage = stage;
        if (out.stage) out.stage.innerHTML = html(stage.name);
        if (out.use) out.use.innerHTML = html(stage.use);
        if (out.notes) out.notes.innerHTML = stage.notes.map(function (n) { return "<li>" + html(n) + "</li>"; }).join("");
      }
      valueText();
    }

    range.addEventListener("input", function () { update(+range.value); });
    document.addEventListener("langchange", valueText);

    var dragging = false;
    function fromPointer(e) {
      var rect = svg.getBoundingClientRect();
      var px = ((e.clientX - rect.left) / rect.width) * W;
      var t = Math.min(Math.max((px - X0) / (X1 - X0), 0), 1) * DURATION;
      var sec = Math.round((t * 60) / 5) * 5;
      range.value = sec;
      update(sec);
    }
    svg.addEventListener("pointerdown", function (e) { dragging = true; svg.setPointerCapture(e.pointerId); fromPointer(e); });
    svg.addEventListener("pointermove", function (e) { if (dragging || e.pointerType === "mouse") fromPointer(e); });
    ["pointerup", "pointercancel"].forEach(function (ev) { svg.addEventListener(ev, function () { dragging = false; }); });

    // Start on the house pour-over roast (208°C)
    var start = Math.round((timeAt(208) * 60) / 5) * 5;
    range.value = start;
    update(start);
    // Draw the curve in once; later redraws (resizes) appear without animation
    chart.classList.add("is-drawing");
    setTimeout(function () { chart.classList.remove("is-drawing"); }, 2400);

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { if (draw()) { lastStage = null; update(current); } }, 150);
    });
  }

  window.LatHillRoastCurve = { init: init };
})();
