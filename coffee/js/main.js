/* 叻山咖啡 Lat Hill Coffee Roasters — shared script
   Each block checks for its own markup, so one file serves all four pages.
   Text the script writes comes from the JSON in #site-i18n (built from
   tools/content.py), so both languages stay in one place. */
(function () {
  "use strict";

  var root = document.documentElement;
  var I18N = {};
  try { I18N = JSON.parse(document.getElementById("site-i18n").textContent); } catch (e) {}

  function lang() { return root.getAttribute("data-lang") === "en" ? "en" : "zh"; }
  function tr(x) { return x ? x[lang()] : ""; }
  function fill(s, vars) {
    return vars ? s.replace(/\{(\w+)\}/g, function (m, k) { return k in vars ? vars[k] : m; }) : s;
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  /* Live text in both languages, so switching language needs no re-render */
  function both(x, vars) {
    vars = vars || {};
    return '<span lang="zh-Hans">' + fill(x.zh, vars.zh) + '</span><span lang="en">' + fill(x.en, vars.en) + "</span>";
  }

  /* ---------- Language ---------- */
  var ATTRS = ["text", "aria-label", "placeholder", "title", "content", "href", "src"];

  function applyLang(l, save) {
    root.setAttribute("data-lang", l);
    root.lang = l === "zh" ? "zh-Hans" : "en";
    document.querySelectorAll("[data-set-lang]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-set-lang") === l));
    });
    ATTRS.forEach(function (name) {
      document.querySelectorAll("[data-en-" + name + "]").forEach(function (el) {
        var zhKey = "data-zh-" + name;
        if (!el.hasAttribute(zhKey)) el.setAttribute(zhKey, name === "text" ? el.textContent : el.getAttribute(name) || "");
        var value = el.getAttribute(l === "en" ? "data-en-" + name : zhKey);
        if (name === "text") { if (el.textContent !== value) el.textContent = value; }
        else if (el.getAttribute(name) !== value) el.setAttribute(name, value);
      });
    });
    if (save) { try { localStorage.setItem("lathill-lang", l); } catch (e) {} }
    document.dispatchEvent(new CustomEvent("langchange"));
  }

  document.querySelectorAll("[data-set-lang]").forEach(function (b) {
    b.addEventListener("click", function () { applyLang(b.getAttribute("data-set-lang"), true); });
  });
  applyLang(lang(), false);

  /* ---------- Header: menu + solid background once scrolled ---------- */
  var header = document.querySelector("[data-header]");
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");

  function menuOpen() { return !!nav && nav.classList.contains("is-open"); }
  function updateHeader() {
    if (header) header.classList.toggle("is-solid", window.scrollY > 8 || menuOpen());
  }
  function setMenu(open) {
    if (!toggle || !nav) return;
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", tr(open ? I18N.menuClose : I18N.menuOpen));
    updateHeader();
  }
  if (toggle && nav) {
    toggle.addEventListener("click", function () { setMenu(!menuOpen()); });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menuOpen()) { setMenu(false); toggle.focus(); }
    });
    window.matchMedia("(min-width: 961px)").addEventListener("change", function (mq) { if (mq.matches) setMenu(false); });
    document.addEventListener("langchange", function () { setMenu(menuOpen()); });
  }
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Videos: load when on screen, one pause switch for all ---------- */
  var videos = [].slice.call(document.querySelectorAll("video[data-src]"));
  var toggles = [].slice.call(document.querySelectorAll("[data-video-toggle]"));
  var stored = null;
  try { stored = localStorage.getItem("lathill-video"); } catch (e) {}
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    !!(navigator.connection && navigator.connection.saveData);
  // Reduced motion or data saver: show the still frame until the visitor presses play
  var paused = stored ? stored === "paused" : calm;
  var small = window.matchMedia("(max-width: 720px)");

  function play(v) {
    if (paused || !v._onScreen) { if (!v.paused) v.pause(); return; }
    if (!v.getAttribute("src")) {
      var sm = v.getAttribute("data-src-sm");
      v.src = sm && small.matches ? sm : v.getAttribute("data-src");
    }
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  }
  function syncToggles() {
    var label = tr(paused ? I18N.videoPlay : I18N.videoPause);
    toggles.forEach(function (b) {
      b.setAttribute("data-paused", String(paused));
      b.setAttribute("aria-label", label);
      var text = b.querySelector("[data-video-toggle-text]");
      if (text) text.textContent = label;
    });
  }
  toggles.forEach(function (b) {
    b.addEventListener("click", function () {
      paused = !paused;
      try { localStorage.setItem("lathill-video", paused ? "paused" : "playing"); } catch (e) {}
      syncToggles();
      videos.forEach(play);
    });
  });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { en.target._onScreen = en.isIntersecting; play(en.target); });
    }, { rootMargin: "120px 0px", threshold: 0.15 });
    videos.forEach(function (v) { io.observe(v); });
  } else {
    videos.forEach(function (v) { v._onScreen = true; play(v); });
  }
  syncToggles();
  document.addEventListener("langchange", syncToggles);

  /* ---------- Next roast date (Kuala Lumpur time) ---------- */
  var WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var WEEK_ZH = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

  function nowInKL() {
    var parts = {};
    new Intl.DateTimeFormat("en-US", {
      timeZone: I18N.tz || "Asia/Kuala_Lumpur", year: "numeric", month: "numeric", day: "numeric",
      weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
    }).formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
    return {
      y: +parts.year, m: +parts.month, d: +parts.day, day: WEEK.indexOf(parts.weekday),
      minutes: +parts.hour * 60 + +parts.minute
    };
  }
  function nextRoast() {
    var n = nowInKL();
    for (var k = 1; k <= 7; k++) {
      var date = new Date(Date.UTC(n.y, n.m - 1, n.d + k));
      if ((I18N.roastDays || []).indexOf(date.getUTCDay()) !== -1) return date;
    }
    return null;
  }
  function dayLabel(date, l) {
    if (l === "zh") return (date.getUTCMonth() + 1) + "月" + date.getUTCDate() + "日（" + WEEK_ZH[date.getUTCDay()] + "）";
    return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(date);
  }
  var roastDate = I18N.roastDays ? nextRoast() : null;
  if (roastDate) {
    var dayBefore = new Date(roastDate.getTime() - 86400000);
    var vars = {
      zh: { date: dayLabel(roastDate, "zh"), cutoff: dayLabel(dayBefore, "zh") + " 23:59" },
      en: { date: dayLabel(roastDate, "en"), cutoff: "11:59 pm, " + dayLabel(dayBefore, "en") }
    };
    var templates = { pill: I18N.nextRoast, cta: I18N.ctaNext, schedule: I18N.scheduleNext };
    document.querySelectorAll("[data-next-roast]").forEach(function (el) {
      var tpl = templates[el.getAttribute("data-next-roast")];
      if (tpl) el.innerHTML = both(tpl, vars);
    });
  }

  /* ---------- Home: interactive roast curve (js/roast-curve.js) ---------- */
  var chart = document.querySelector("[data-roast-chart]");
  if (chart && I18N.roast && window.LatHillRoastCurve) window.LatHillRoastCurve.init(chart, I18N.roast, lang);

  /* ---------- Services: filter the coffee list ---------- */
  var filterBar = document.querySelector("[data-filters]");
  if (filterBar) {
    var items = document.querySelectorAll("[data-category]");
    var status = document.querySelector("[data-filter-status]");
    var applyFilter = function (key, announce) {
      var shown = 0;
      filterBar.querySelectorAll("button[data-filter]").forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.getAttribute("data-filter") === key));
      });
      items.forEach(function (p) {
        var match = key === "all" || p.getAttribute("data-category") === key;
        p.hidden = !match;
        if (match) shown++;
      });
      if (status && announce) status.innerHTML = both(I18N.filterStatus, { zh: { n: shown }, en: { n: shown } });
    };
    filterBar.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-filter]");
      if (btn) applyFilter(btn.getAttribute("data-filter"), true);
    });
    var wanted = new URLSearchParams(location.search).get("filter");
    if (wanted && filterBar.querySelector('[data-filter="' + wanted + '"]')) applyFilter(wanted, false);
  }

  /* ---------- Contact: customer care hours (Kuala Lumpur time) ---------- */
  var hoursTable = document.querySelector("[data-hours]");
  if (hoursTable && I18N.hours) {
    var now = nowInKL();
    var row = hoursTable.querySelector('[data-days~="' + now.day + '"]');
    var badge = document.querySelector("[data-open-status]");
    var toMinutes = function (hhmm) { var p = hhmm.split(":"); return +p[0] * 60 + +p[1]; };
    if (row && badge) {
      row.classList.add("is-today");
      var open = row.getAttribute("data-open"), close = row.getAttribute("data-close");
      var tpl = I18N.hours.offline, isOpen = false;
      if (open && close) {
        if (now.minutes >= toMinutes(open) && now.minutes < toMinutes(close)) { tpl = I18N.hours.online; isOpen = true; }
        else if (now.minutes < toMinutes(open)) tpl = I18N.hours.later;
      }
      var times = { open: open, close: close };
      badge.classList.toggle("is-open", isOpen);
      badge.innerHTML = both(tpl, { zh: times, en: times });
    }
  }

  /* ---------- Contact: form (WPForms placeholder) ---------- */
  var form = document.querySelector("[data-contact-form]");
  if (form && I18N.form) {
    // Links such as contact.html?type=wholesale pick the matching topic
    var type = new URLSearchParams(location.search).get("type");
    if (type) {
      var radio = form.querySelector('input[name="wpforms[fields][3]"][value="' + type + '"]');
      if (radio) radio.checked = true;
    }

    var rules = {
      name: function (v) { return v.trim() ? null : I18N.form.err_name; },
      contact: function (v) {
        v = v.trim();
        if (!v) return I18N.form.err_contact_empty;
        var phone = /^(\+?60|0)1\d{8,9}$/.test(v.replace(/[\s()-]/g, ""));
        var email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        return phone || email ? null : I18N.form.err_contact;
      },
      message: function (v) { return v.trim().length >= 5 ? null : I18N.form.err_message; }
    };
    var check = function (input) {
      var msg = rules[input.getAttribute("data-rule")](input.value);
      var field = input.closest(".wpforms-field");
      field.classList.toggle("has-error", !!msg);
      input.setAttribute("aria-invalid", msg ? "true" : "false");
      field.querySelector(".wpforms-error").innerHTML = msg ? both(msg) : "";
      return !msg;
    };
    form.querySelectorAll("[data-rule]").forEach(function (input) {
      input.addEventListener("blur", function () { if (input.value) check(input); });
      input.addEventListener("input", function () {
        if (input.closest(".wpforms-field").classList.contains("has-error")) check(input);
      });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstBad = null;
      form.querySelectorAll("[data-rule]").forEach(function (input) { if (!check(input) && !firstBad) firstBad = input; });
      if (firstBad) { firstBad.focus(); return; }
      // Static prototype: nothing is sent. On WordPress, WPForms handles the submission.
      var name = escapeHtml(form.querySelector('[data-rule="name"]').value.trim());
      var success = document.querySelector("[data-form-success]");
      success.querySelector("[data-success-text]").innerHTML = both(I18N.form.success, { zh: { name: name }, en: { name: name } });
      success.classList.add("is-visible");
      success.focus();
      form.reset();
    });
  }
})();
