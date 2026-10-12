/* The Little Store — the café menu's two tools, added on top of the menu
   that site.js builds:
   - Your list: a + beside every dish and extra keeps it on a list with a
     running total. The list lives only in this browser (localStorage).
   - Search: type a dish or an ingredient and only matching lines stay.
   Nothing here changes prices or dishes; those come from content.js. */
(function () {
  "use strict";

  var LS = window.LittleStore;
  if (!LS || document.body.getAttribute("data-page") !== "menu") return;

  var el = LS.el, money = LS.money, catalog = LS.catalog, S = LS.store, reduce = LS.reduceMotion;
  var KEY = "littlestore.picks.v1";
  var SVGNS = "http://www.w3.org/2000/svg";
  var picks = load();

  function dollars(n) { return "$" + money(Math.round(n * 100) / 100); }
  function cap(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
  function each(sel, fn, root) { [].forEach.call((root || document).querySelectorAll(sel), fn); }

  var PATHS = {
    plus: "M12 5v14M5 12h14",
    minus: "M5 12h14",
    close: "M6 6l12 12M18 6 6 18",
    search: "M10.5 17a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13zM15.5 15.5 20 20",
    up: "M6 15l6-6 6 6"
  };
  function icon(name) {
    var svg = document.createElementNS(SVGNS, "svg"), p = document.createElementNS(SVGNS, "path");
    svg.setAttribute("class", "icon");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    p.setAttribute("d", PATHS[name]);
    svg.appendChild(p);
    return svg;
  }
  function replay(node, cls) {
    node.classList.remove(cls);
    void node.offsetWidth;          // restart the CSS animation
    node.classList.add(cls);
  }

  /* ── The saved list ── */
  function load() {
    try {
      var raw = JSON.parse(localStorage.getItem(KEY) || "{}"), out = {};
      Object.keys(raw).forEach(function (id) {
        var q = Math.floor(+raw[id]);
        if (catalog[id] && q > 0) out[id] = Math.min(q, 99);   // dishes taken off the menu drop out
      });
      return out;
    } catch (e) { return {}; }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(picks)); } catch (e) { /* private mode: list lasts for this visit */ } }
  function ids() { return Object.keys(catalog).filter(function (id) { return picks[id]; }); }   // menu order
  function count() { return ids().reduce(function (n, id) { return n + picks[id]; }, 0); }
  function total() { return ids().reduce(function (t, id) { return t + picks[id] * catalog[id].price; }, 0); }
  function spoken(id) { var it = catalog[id]; return it.extra ? it.name + " extra" : it.name; }

  function setQty(id, q) {
    q = Math.max(0, Math.min(99, q));
    if (q) picks[id] = q; else delete picks[id];
    save();
    each('[data-add="' + id + '"]', paintButton);
    paintTray();
    if (sheet.open) paintSheet();
  }
  function repaintAll() {
    each("[data-add]", paintButton);
    paintTray();
    if (sheet.open) paintSheet();
  }

  /* ── + buttons on dishes and extras ── */
  function addButtons() {
    each(".dish[data-id]", function (li) {
      var b = el("button", { type: "button", class: "add", "data-add": li.getAttribute("data-id") }, [
        icon("plus"), el("span", { class: "add-qty", "aria-hidden": "true" })
      ]);
      li.querySelector(".dish-head").appendChild(b);
      paintButton(b);
    });
    each(".extras li[data-id]", function (li) {
      var kids = [].slice.call(li.childNodes);
      var b = el("button", { type: "button", class: "extra-add", "data-add": li.getAttribute("data-id") },
        kids.concat([el("span", { class: "extra-qty", "aria-hidden": "true" }), el("span", { class: "sr extra-state" })]));
      li.appendChild(b);
      paintButton(b);
    });
  }
  function paintButton(b) {
    var id = b.getAttribute("data-add"), q = picks[id] || 0;
    b.classList.toggle("is-picked", q > 0);
    if (b.classList.contains("add")) {
      b.querySelector(".add-qty").textContent = q || "";
      b.setAttribute("aria-label", q ? "Add another " + spoken(id) + ", " + q + " on your list" : "Add " + spoken(id) + " to your list");
    } else {
      b.querySelector(".extra-qty").textContent = q ? "×" + q : "";
      b.querySelector(".extra-state").textContent = q ? ", " + q + " on your list, add another" : ", add to your list";
    }
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-add]");
    if (!b) return;
    var id = b.getAttribute("data-add");
    setQty(id, (picks[id] || 0) + 1);
    replay(b, "pop");
    petals(b);
    toast(cap(catalog[id].name) + " added", function () { setQty(id, (picks[id] || 0) - 1); });
  });

  /* ── Tray at the bottom, toast above it ── */
  var trayCount = el("span", { class: "tray-count", "aria-hidden": "true" });
  var trayTotal = el("span", { class: "tray-total", "aria-hidden": "true" });
  var tray = el("button", { type: "button", class: "tray", "aria-haspopup": "dialog" }, [
    trayCount,
    el("span", { class: "tray-label", "aria-hidden": "true" }, "Your list"),
    trayTotal,
    icon("up")
  ]);
  var toastText = el("span", { class: "toast-text" });
  var toastUndo = el("button", { type: "button", class: "toast-undo" }, "Undo");
  var toastBox = el("div", { class: "toast", role: "status", "aria-live": "polite" }, [toastText, toastUndo]);
  var layer = el("div", { class: "petal-layer", "aria-hidden": "true" });
  document.body.appendChild(el("div", { class: "dock" }, [toastBox, tray]));
  document.body.appendChild(layer);

  function paintTray() {
    var n = count(), t = total();
    trayCount.textContent = n;
    trayTotal.textContent = dollars(t);
    tray.setAttribute("aria-label", "Your list, " + n + (n === 1 ? " item, " : " items, ") + dollars(t));
    tray.classList.toggle("is-shown", n > 0);
    document.body.classList.toggle("has-picks", n > 0);
  }

  var toastTimer, toastUndoFn;
  function toast(text, undo) {
    toastBox.classList.add("is-shown");
    toastText.textContent = text;
    toastUndoFn = undo;
    toastUndo.hidden = !undo;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, 4000);
  }
  function hideToast() { toastBox.classList.remove("is-shown"); toastUndoFn = null; }
  toastUndo.addEventListener("click", function () {
    if (toastUndoFn) toastUndoFn();
    hideToast();
  });

  /* ── Petals fly from the + into the tray ── */
  function petals(from) {
    if (reduce || !layer.animate) return;
    var a = from.getBoundingClientRect(), t = trayCount.getBoundingClientRect();
    // the tray may still be sliding in: aim for where it will stop
    var m = window.getComputedStyle(tray).transform, dy = 0;
    if (m && m !== "none" && window.DOMMatrixReadOnly) dy = new DOMMatrixReadOnly(m).m42;
    var fx = a.left + a.width / 2, fy = a.top + a.height / 2;
    var tx = t.left + t.width / 2, ty = t.top + t.height / 2 - dy;
    function at(x, y, r, s) { return "translate(" + (x - 7) + "px," + (y - 11) + "px) rotate(" + r + "deg) scale(" + s + ")"; }
    for (var i = 0; i < 6; i++) {
      var p = document.createElementNS(SVGNS, "svg"), u = document.createElementNS(SVGNS, "use");
      p.setAttribute("class", "petal" + (i % 2 ? " petal--deep" : ""));
      p.setAttribute("viewBox", "-14 -50 28 44");
      u.setAttribute("href", "#petal-o");
      p.appendChild(u);
      layer.appendChild(p);
      var r = Math.random() * 360, spread = (i - 2.5) * 15 + (Math.random() * 10 - 5), lift = 50 + Math.random() * 60;
      var mx = fx + (tx - fx) * .45 + spread, my = Math.min(fy, ty) - lift;
      p.animate([
        { transform: at(fx, fy, r, .2), opacity: 0 },
        { transform: at(fx + spread * 1.5, fy - lift * .55, r + 90, 1), opacity: 1, offset: .25 },
        { transform: at(mx, my, r + 210, .85), opacity: 1, offset: .6 },
        { transform: at(tx, ty, r + 330, .3), opacity: .3 }
      ], { duration: 780 + i * 45, delay: i * 28, easing: "cubic-bezier(.45,0,.25,1)", fill: "both" })
        .onfinish = (function (node) { return function () { node.remove(); }; })(p);
    }
    setTimeout(function () { replay(trayCount, "bump"); }, 820);
  }

  /* ── The list itself ── */
  var list = el("ul", { class: "sheet-list" });
  var empty = el("p", { class: "sheet-empty" }, "Your list is empty. Tap + next to a dish to add it.");
  var sheetTotal = el("strong");
  var closeBtn = el("button", { type: "button", class: "icon-btn", "aria-label": "Close your list" }, icon("close"));
  var clearBtn = el("button", { type: "button", class: "btn btn--ghost" }, "Clear list");
  var foot = el("div", { class: "sheet-foot" }, [
    el("p", { class: "sheet-total" }, [el("span", null, "Menu total"), sheetTotal]),
    el("p", { class: "sheet-note" }, "Your list stays on this device. Toast opens in a new tab, so you can keep the list open while you order."),
    el("div", { class: "sheet-actions" }, [
      el("a", { class: "btn", href: S.orderFood, target: "_blank", rel: "noopener" }, "Order online"),
      clearBtn
    ])
  ]);
  var sheet = el("dialog", { class: "sheet", "aria-labelledby": "sheet-title" }, el("div", { class: "sheet-card" }, [
    el("div", { class: "sheet-head" }, [el("h2", { id: "sheet-title" }, "Your list"), closeBtn]),
    list, empty, foot
  ]));
  document.body.appendChild(sheet);

  function paintSheet() {
    var all = ids();
    list.textContent = "";
    empty.hidden = all.length > 0;
    foot.hidden = !all.length;
    all.forEach(function (id) {
      var it = catalog[id], q = picks[id];
      list.appendChild(el("li", { class: "pick" }, [
        el("p", { class: "pick-main" }, [
          el("span", { class: "pick-name" }, it.extra ? "+ " + it.name : it.name),
          el("span", { class: "pick-each" }, (it.extra ? "Extra, " : "") + dollars(it.price) + " each")
        ]),
        el("div", { class: "stepper" }, [
          el("button", { type: "button", class: "step", "data-id": id, "data-step": "-1", "aria-label": "One less " + spoken(id) }, icon("minus")),
          el("span", { class: "step-qty", "aria-label": q + " " + spoken(id) }, String(q)),
          el("button", { type: "button", class: "step", "data-id": id, "data-step": "1", "aria-label": "One more " + spoken(id) }, icon("plus"))
        ]),
        el("span", { class: "pick-sum" }, dollars(q * it.price))
      ]));
    });
    sheetTotal.textContent = dollars(total());
  }

  list.addEventListener("click", function (e) {
    var b = e.target.closest("[data-step]");
    if (!b) return;
    var id = b.getAttribute("data-id"), step = +b.getAttribute("data-step");
    setQty(id, (picks[id] || 0) + step);
    // keep the keyboard where it was, or on the next line if this one went
    var again = list.querySelector('[data-id="' + id + '"][data-step="' + step + '"]') || list.querySelector("[data-step]") || closeBtn;
    again.focus();
  });

  function openSheet() {
    paintSheet();
    if (sheet.showModal) sheet.showModal(); else sheet.setAttribute("open", "");
    document.documentElement.classList.add("sheet-open");
    requestAnimationFrame(function () { sheet.classList.add("is-open"); });
  }
  function closeSheet() {
    sheet.classList.remove("is-open");
    document.documentElement.classList.remove("sheet-open");
    var done = function () { if (sheet.open) { if (sheet.close) sheet.close(); else sheet.removeAttribute("open"); } };
    if (reduce) done(); else setTimeout(done, 260);
  }
  tray.addEventListener("click", openSheet);
  closeBtn.addEventListener("click", closeSheet);
  sheet.addEventListener("cancel", function (e) { e.preventDefault(); closeSheet(); });
  sheet.addEventListener("click", function (e) { if (e.target === sheet) closeSheet(); });   // tap outside the card
  clearBtn.addEventListener("click", function () {
    var before = picks;
    picks = {};
    save();
    repaintAll();
    closeSheet();
    toast("List cleared", function () { picks = before; save(); repaintAll(); });
  });

  /* ── Search ── */
  function norm(t) { return t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); }

  var rows = [];
  function buildIndex() {
    each(".course", function (sec) {
      var secTitle = sec.querySelector(".title-text").textContent;
      each(".group", function (g) {
        var gt = g.querySelector(".group-title");
        each(".dish", function (li) {
          var name = li.querySelector(".dish-name"), desc = li.querySelector(".dish-desc"), tag = li.querySelector(".tag");
          var parts = [[name, name.textContent]];
          if (desc) parts.push([desc, desc.textContent]);
          rows.push({
            li: li, parts: parts,
            hay: norm([secTitle, gt ? gt.textContent : "", name.textContent, desc ? desc.textContent : "", tag ? tag.textContent : ""].join(" "))
          });
        }, g);
      }, sec);
      each(".extras li", function (li) {
        var name = li.querySelector(".extras-name");
        rows.push({ li: li, parts: [[name, name.textContent]], hay: norm([secTitle, "extra extras add-on", name.textContent].join(" ")) });
      }, sec);
    });
  }

  // Wraps the matched letters in <mark>; accents are ignored, so
  // "gruyere" finds "Gruyère".
  function highlight(node, text, tokens) {
    if (!tokens.length) { if (node.childNodes.length !== 1 || node.firstChild.nodeType !== 3) node.textContent = text; return; }
    var low = "";
    for (var i = 0; i < text.length; i++) {
      var c = norm(text.charAt(i));
      if (c.length !== 1) { node.textContent = text; return; }
      low += c;
    }
    var marks = [];
    tokens.forEach(function (t) {
      for (var k = low.indexOf(t); k > -1; k = low.indexOf(t, k + t.length)) marks.push([k, k + t.length]);
    });
    node.textContent = "";
    if (!marks.length) { node.textContent = text; return; }
    marks.sort(function (x, y) { return x[0] - y[0]; });
    var pos = 0;
    marks.forEach(function (m) {
      if (m[1] <= pos) return;
      var from = Math.max(m[0], pos);
      if (from > pos) node.appendChild(document.createTextNode(text.slice(pos, from)));
      node.appendChild(el("mark", null, text.slice(from, m[1])));
      pos = m[1];
    });
    if (pos < text.length) node.appendChild(document.createTextNode(text.slice(pos)));
  }

  var SUGGEST = ["avocado", "bacon", "chicken", "matcha", "gluten-free"];
  var menuEl = document.querySelector("[data-menu]");
  var statusEl = el("div", { class: "search-status", role: "status", "aria-live": "polite" });
  menuEl.insertBefore(statusEl, menuEl.firstChild);

  var input = el("input", {
    id: "menu-q", type: "search", placeholder: "Search dishes or ingredients",
    autocomplete: "off", autocapitalize: "none", spellcheck: "false", enterkeyhint: "search"
  });
  var searchClose = el("button", { type: "button", class: "icon-btn search-close", "aria-label": "Close search" }, icon("close"));
  var form = el("form", { class: "search", role: "search" }, [
    el("label", { class: "sr", for: "menu-q" }, "Search the menu"),
    icon("search"),
    input,
    searchClose
  ]);
  var toggle = el("button", { type: "button", class: "icon-btn search-toggle", "aria-label": "Search the menu", "aria-expanded": "false", "aria-controls": "menu-q" }, icon("search"));
  var bar = document.querySelector(".sectionbar");
  var barInner = document.querySelector(".sectionbar-inner");
  var rail = document.querySelector(".rail");
  barInner.insertBefore(toggle, barInner.firstChild);

  var wide = window.matchMedia("(min-width: 1024px)");
  function placeSearch() {
    if (wide.matches) {
      rail.insertBefore(form, rail.firstChild);
      bar.classList.remove("is-searching");
      toggle.setAttribute("aria-expanded", "false");
      input.placeholder = "Search the menu";
    } else {
      barInner.insertBefore(form, toggle.nextSibling);
      input.placeholder = "Search dishes or ingredients";
    }
  }
  if (wide.addEventListener) wide.addEventListener("change", placeSearch); else if (wide.addListener) wide.addListener(placeSearch);
  placeSearch();

  function isActive() { return wide.matches ? document.activeElement === input || !!input.value.trim() : bar.classList.contains("is-searching"); }

  function suggestions() {
    return el("p", { class: "suggest" }, [el("span", null, "Try")].concat(SUGGEST.map(function (w) {
      return el("button", { type: "button", class: "chip chip--small", "data-suggest": w }, w);
    })));
  }

  function showStatus(q, n) {
    statusEl.textContent = "";
    if (!q) {
      statusEl.classList.toggle("is-shown", isActive());
      if (isActive()) statusEl.appendChild(suggestions());
      return;
    }
    statusEl.classList.add("is-shown");
    if (n) {
      statusEl.appendChild(el("p", { class: "search-count" }, [el("strong", null, String(n)), (n === 1 ? " match for “" : " matches for “") + q + "”"]));
    } else {
      statusEl.appendChild(el("p", { class: "search-count" }, "Nothing on the menu matches “" + q + "”."));
      statusEl.appendChild(suggestions());
    }
  }

  var lastQuery = "";
  function applyQuery() {
    var q = input.value.trim(), tokens = norm(q).split(/\s+/).filter(Boolean), n = 0;
    rows.forEach(function (r) {
      var ok = tokens.every(function (t) { return r.hay.indexOf(t) > -1; });
      r.li.hidden = !ok;
      if (ok) n++;
      r.parts.forEach(function (p) { highlight(p[0], p[1], ok ? tokens : []); });
    });
    each(".group", function (g) { g.hidden = !g.querySelector(".dish:not([hidden])"); });
    each(".extras", function (x) { x.hidden = !x.querySelector("li:not([hidden])"); });
    each(".course", function (s) { s.hidden = !s.querySelector(".dish:not([hidden]), .extras li:not([hidden])"); });
    each("[data-rail] a, [data-chips] a", function (a) {
      var target = document.getElementById(a.hash.slice(1));
      a.classList.toggle("is-empty", !!(target && target.hidden));
    });
    form.classList.toggle("has-query", !!q);
    showStatus(q, n);
    if (q !== lastQuery) {
      if (!reduce && q) replay(menuEl, "is-filtering");
      if (q) keepResultsInView();
    }
    lastQuery = q;
    document.dispatchEvent(new CustomEvent("menu:filtered"));
  }

  // Results start at the top of the menu; bring that into view under the bar.
  function keepResultsInView() {
    var barH = wide.matches ? 0 : bar.offsetHeight;
    var top = menuEl.getBoundingClientRect().top + window.pageYOffset - barH - 12;
    var view = menuEl.getBoundingClientRect().top;
    if (view < barH || view > window.innerHeight * .6) window.scrollTo({ top: top, behavior: reduce ? "auto" : "smooth" });
  }

  function openSearch() {
    if (!wide.matches) {
      bar.classList.add("is-searching");
      toggle.setAttribute("aria-expanded", "true");
    }
    input.focus();
    applyQuery();
    if (!wide.matches) keepResultsInView();
  }
  function closeSearch() {
    input.value = "";
    applyQuery();
    if (!wide.matches) {
      bar.classList.remove("is-searching");
      toggle.setAttribute("aria-expanded", "false");
      toggle.focus();
    } else {
      input.focus();
    }
    showStatus("", 0);
  }

  toggle.addEventListener("click", openSearch);
  searchClose.addEventListener("click", closeSearch);
  input.addEventListener("input", applyQuery);
  input.addEventListener("focus", function () { if (!input.value.trim()) showStatus("", 0); });
  input.addEventListener("blur", function () {
    // leave the suggestions up while one of them is being tapped
    setTimeout(function () { if (!input.value.trim() && !statusEl.contains(document.activeElement)) showStatus("", 0); }, 150);
  });
  input.addEventListener("keydown", function (e) { if (e.key === "Escape") { e.preventDefault(); closeSearch(); } });
  form.addEventListener("submit", function (e) { e.preventDefault(); input.blur(); });   // hides a phone keyboard
  statusEl.addEventListener("click", function (e) {
    var s = e.target.closest("[data-suggest]");
    if (!s) return;
    input.value = s.getAttribute("data-suggest");
    if (!wide.matches) bar.classList.add("is-searching");
    applyQuery();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target.closest && e.target.closest("input, textarea, select, [contenteditable]")) return;
    if (sheet.open) return;
    e.preventDefault();
    openSearch();
  });

  addButtons();
  buildIndex();
  paintTray();
})();
