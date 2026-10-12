/* The Little Store — builds both pages from content.js and runs the small
   pieces of behaviour: the open/closed line, the section bar and the
   structured data search engines read. Content edits belong in content.js. */
(function () {
  "use strict";

  var S = window.STORE || {};
  var page = document.body.getAttribute("data-page");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var WEEK = [1, 2, 3, 4, 5, 6, 0];   // Monday first, for "Wednesday to Sunday"

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    for (var k in attrs || {}) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    [].concat(kids).forEach(function (c) {
      if (c == null) return;
      n.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return n;
  }
  function money(n) { return n % 1 ? n.toFixed(2) : String(n); }
  function slug(t) { return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

  // Every dish and extra by id ("all-day:burrito", "salads:extra:avocado"),
  // in menu order; the list and the search in picks.js read it.
  var catalog = {};

  var SVG = "http://www.w3.org/2000/svg";
  function bloom(cls) {
    var svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("class", "bloom " + (cls || ""));
    svg.setAttribute("viewBox", "-50 -50 100 100");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    [["bloom-outer", "#ring-o"], ["bloom-inner", "#ring-i"]].forEach(function (r) {
      var g = document.createElementNS(SVG, "g"), u = document.createElementNS(SVG, "use");
      g.setAttribute("class", r[0]);
      u.setAttribute("href", r[1]);
      g.appendChild(u);
      svg.appendChild(g);
    });
    var c = document.createElementNS(SVG, "circle");
    c.setAttribute("class", "bloom-heart");
    c.setAttribute("r", "8");
    svg.appendChild(c);
    return svg;
  }
  function toMin(t) { var p = t.split(":"); return +p[0] * 60 + +p[1]; }
  function clock(m) {
    var h = Math.floor(m / 60), mm = m % 60;
    return (h % 12 || 12) + (mm ? ":" + (mm < 10 ? "0" : "") + mm : "") + (h < 12 ? " am" : " pm");
  }

  /* ── Hours ── */
  function daysText(days) {
    if (days.length === 7) return "Every day";
    var on = WEEK.filter(function (d) { return days.indexOf(d) > -1; });
    var run = on.every(function (d, i) { return !i || WEEK.indexOf(d) === WEEK.indexOf(on[i - 1]) + 1; });
    if (run && on.length > 2) return DAYS[on[0]] + " to " + DAYS[on[on.length - 1]];
    return on.map(function (d) { return DAYS[d]; }).join(", ");
  }
  function hoursText() {
    var h = S.hours;
    return daysText(h.days) + ", " + clock(toMin(h.open)) + " to " + clock(toMin(h.close));
  }
  function shopNow() {
    var parts = {};
    new Intl.DateTimeFormat("en-US", {
      timeZone: S.timeZone, weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23"
    }).formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
    return {
      day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(parts.weekday),
      min: (+parts.hour % 24) * 60 + +parts.minute
    };
  }
  function openState() {
    var h = S.hours, now = shopNow(), open = toMin(h.open), close = toMin(h.close);
    var today = h.days.indexOf(now.day) > -1;
    if (today && now.min >= open && now.min < close) return { open: true, text: "Open now, until " + clock(close) };
    if (today && now.min < open) return { open: false, text: "Closed now, opens at " + clock(open) };
    for (var i = 1; i <= 7; i++) {
      var d = (now.day + i) % 7;
      if (h.days.indexOf(d) > -1) {
        return { open: false, text: "Closed now, opens " + (i === 1 ? "tomorrow" : DAYS[d]) + " at " + clock(open) };
      }
    }
    return { open: false, text: "Closed for now" };
  }
  function showStatus() {
    var st = openState();
    document.querySelectorAll("[data-status]").forEach(function (n) {
      n.querySelector("[data-status-text]").textContent = st.text;
      var bloom = n.querySelector(".bloom");
      if (!bloom) return;
      if (st.open) {
        // the marigold opens once the page has painted; a bud when closed
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { bloom.classList.remove("is-bud"); });
        });
      } else {
        bloom.classList.add("is-bud");
      }
    });
  }

  /* ── Shop details into the page ── */
  function fillStore() {
    var hrefs = {
      map: S.mapLink,
      phone: "tel:" + S.phoneLink,
      email: "mailto:" + S.email,
      flowersEmail: "mailto:" + S.flowersEmail,
      instagram: "https://www.instagram.com/" + S.instagram + "/",
      orderFood: S.orderFood,
      orderFlowers: S.orderFlowers
    };
    var texts = {
      street: S.street,
      streetCity: S.street + ", " + S.city,
      cityRegion: S.city + ", " + S.region,
      phone: S.phone,
      email: S.email,
      flowersEmail: S.flowersEmail,
      instagram: "@" + S.instagram,
      hours: hoursText(),
      days: daysText(S.hours.days),
      times: clock(toMin(S.hours.open)) + " to " + clock(toMin(S.hours.close)),
      year: String(new Date().getFullYear())
    };
    document.querySelectorAll("[data-href]").forEach(function (a) {
      var v = hrefs[a.getAttribute("data-href")];
      if (v) a.href = v;
    });
    document.querySelectorAll("[data-text]").forEach(function (n) {
      var v = texts[n.getAttribute("data-text")];
      if (v) n.textContent = v;
    });
  }

  /* ── Café menu ── */
  function dish(it, sec) {
    var id = sec.id + ":" + slug(it.name);
    catalog[id] = { name: it.name, price: it.price, section: sec.title };
    var head = el("p", { class: "dish-head" }, [el("span", { class: "dish-name" }, it.name)]);
    (it.tags || []).forEach(function (t) {
      if (t === "gf") head.appendChild(el("span", { class: "tag" }, "gluten-free"));
    });
    head.appendChild(el("span", { class: "dish-leader", "aria-hidden": "true" }));
    head.appendChild(el("span", { class: "dish-price" }, [el("span", { class: "sr" }, "$"), money(it.price)]));
    var li = el("li", { class: it.desc ? "dish has-desc" : "dish", "data-id": id }, head);
    if (it.desc) li.appendChild(el("p", { class: "dish-desc" }, it.desc));
    return li;
  }

  function title(sec) {
    return el("h2", { class: "course-title", id: sec.id + "-title" }, [
      el("span", { class: "title-text" }, sec.title),
      bloom("title-bloom")
    ]);
  }

  function course(sec) {
    var s = el("section", { class: "course", id: sec.id, "aria-labelledby": sec.id + "-title" }, [
      title(sec)
    ]);
    sec.groups.forEach(function (g) {
      var group = el("div", { class: "group" });
      if (g.title) group.appendChild(el("h3", { class: "group-title" }, g.title));
      group.appendChild(el("ul", { class: "dishes" }, g.items.map(function (it) { return dish(it, sec); })));
      s.appendChild(group);
    });
    if (sec.extras && sec.extras.length) {
      s.appendChild(el("ul", { class: "extras", "aria-label": sec.title + " extras" }, sec.extras.map(function (x) {
        var id = sec.id + ":extra:" + slug(x.name);
        catalog[id] = { name: x.name, price: x.price, section: sec.title, extra: true };
        return el("li", { "data-id": id }, [
          el("span", { class: "extras-name" }, x.name),
          el("span", { class: "extras-price" }, [el("span", { class: "sr" }, "$"), money(x.price)])
        ]);
      })));
    }
    return s;
  }

  function renderMenu() {
    var host = document.querySelector("[data-menu]");
    var chips = document.querySelector("[data-chips]");
    var rail = document.querySelector("[data-rail]");
    (window.MENU || []).forEach(function (sec) {
      chips.appendChild(el("li", null, el("a", { class: "chip", href: "#" + sec.id }, sec.title)));
      rail.appendChild(el("li", null, el("a", { href: "#" + sec.id }, sec.title)));
      host.appendChild(course(sec));
    });
  }

  // Marks the section being read in the bar and the rail, and keeps the
  // marked button visible when the bar scrolls sideways.
  function followSections() {
    var secs = [].slice.call(document.querySelectorAll(".course"));
    var links = [].slice.call(document.querySelectorAll("[data-chips] a, [data-rail] a"));
    var chips = document.querySelector("[data-chips]");
    var current = null, queued = false;
    if (!secs.length) return;

    function update() {
      queued = false;
      var line = Math.min(window.innerHeight * .3, 240);
      var shown = secs.filter(function (s) { return !s.hidden; });
      if (!shown.length) return;
      var active = shown[0];
      shown.forEach(function (s) { if (s.getBoundingClientRect().top <= line) active = s; });
      var doc = document.documentElement;
      if (window.innerHeight + window.scrollY >= doc.scrollHeight - 4) active = shown[shown.length - 1];
      if (active === current) return;
      current = active;
      links.forEach(function (a) {
        if (a.hash === "#" + active.id) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
      var chip = chips.querySelector("a[aria-current]");
      if (chip && chips.scrollWidth > chips.clientWidth) {
        var left = chip.parentNode.offsetLeft - (chips.clientWidth - chip.offsetWidth) / 2;
        chips.scrollTo({ left: Math.max(0, left), behavior: reduceMotion ? "auto" : "smooth" });
      }
    }
    window.addEventListener("scroll", function () {
      if (!queued) { queued = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener("resize", update);
    document.addEventListener("menu:filtered", function () { current = null; update(); });
    update();
  }

  // The bar's own order button shows only once the header has scrolled away.
  function watchBar() {
    var bar = document.querySelector(".sectionbar");
    var sentinel = document.querySelector(".bar-sentinel");
    if (!bar || !sentinel || !("IntersectionObserver" in window)) return;
    new IntersectionObserver(function (entries) {
      var e = entries[0];
      bar.classList.toggle("is-stuck", !e.isIntersecting && e.boundingClientRect.top < 0);
    }).observe(sentinel);
  }

  /* ── Flowers ── */
  function priceText(it) {
    return (it.from ? "From " : "") + "$" + money(it.price) + (it.per ? " a " + it.per : "");
  }
  function photo(it, lazy) {
    return el("figure", { class: "photo" }, el("img", {
      src: it.img, alt: it.alt || "", width: "428", height: "428",
      loading: lazy ? "lazy" : null, decoding: "async"
    }));
  }

  // One tappable card per size or plan.
  function product(it, sec) {
    return el("li", null, el("a", { class: "product", href: S.orderFlowers }, [
      photo(it, true),
      el("span", { class: "product-text" }, [
        // read aloud as "Order a Small vase arrangement, From $150"
        el("span", { class: "product-name" }, [
          el("span", { class: "sr" }, "Order a "),
          it.name,
          sec.kind ? el("span", { class: "sr" }, " " + sec.kind + ",") : null
        ]),
        el("span", { class: "product-price" }, priceText(it)),
        it.cta ? el("span", { class: "pill", "aria-hidden": "true" }, it.cta) : null
      ])
    ]));
  }

  // A single product: the section title names it, so the photo sits beside
  // the price and an order button instead of under a repeated name.
  function feature(sec) {
    var it = sec.items[0];
    return el("section", { class: "f-section f-feature", id: sec.id, "aria-labelledby": sec.id + "-title" }, [
      title(sec),
      photo(it, false),
      el("div", { class: "feature-body" }, [
        el("p", { class: "feature-price" }, priceText(it)),
        el("a", { class: "btn", href: S.orderFlowers }, it.cta || "Order")
      ])
    ]);
  }

  function renderFlowers() {
    var F = window.FLOWERS || { sections: [] };
    var intro = document.querySelector("[data-flowers-intro]");
    if (intro && F.intro) intro.textContent = F.intro;
    var host = document.querySelector("[data-flowers]");
    F.sections.forEach(function (sec) {
      if (sec.layout === "feature") return host.appendChild(feature(sec));
      host.appendChild(el("section", { class: "f-section", id: sec.id, "aria-labelledby": sec.id + "-title" }, [
        title(sec),
        el("ul", { class: "products products--" + sec.layout }, sec.items.map(function (it) { return product(it, sec); }))
      ]));
    });
  }

  /* ── Things open up as they scroll in ──
     Section titles rise and their marigold opens; flower photos bloom in.
     Nothing is hidden unless motion is allowed and the observer exists. */
  function reveal(nodes) {
    if (reduceMotion || !("IntersectionObserver" in window) || !nodes.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-revealed");
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: .1 });
    nodes.forEach(function (n) {
      n.classList.add("will-reveal");
      io.observe(n);
    });
  }

  /* ── Structured data for search engines ── */
  function structuredData() {
    var data = {
      "@context": "https://schema.org",
      "@type": page === "flowers" ? "Florist" : "CafeOrCoffeeShop",
      name: S.name,
      telephone: S.phone,
      email: S.email,
      address: {
        "@type": "PostalAddress",
        streetAddress: S.street,
        addressLocality: S.city,
        addressRegion: S.region,
        addressCountry: "US"
      },
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: S.hours.days.map(function (d) { return DAYS[d]; }),
        opens: S.hours.open,
        closes: S.hours.close
      }
    };
    if (page === "menu") {
      data.hasMenu = {
        "@type": "Menu",
        hasMenuSection: (window.MENU || []).map(function (sec) {
          return {
            "@type": "MenuSection",
            name: sec.title,
            hasMenuItem: [].concat.apply([], sec.groups.map(function (g) { return g.items; })).map(function (it) {
              var item = { "@type": "MenuItem", name: it.name, offers: { "@type": "Offer", price: money(it.price), priceCurrency: "USD" } };
              if (it.desc) item.description = it.desc;
              if ((it.tags || []).indexOf("gf") > -1) item.suitableForDiet = "https://schema.org/GlutenFreeDiet";
              return item;
            })
          };
        })
      };
    }
    var tag = el("script", { type: "application/ld+json" });
    tag.textContent = JSON.stringify(data);
    document.head.appendChild(tag);
  }

  fillStore();
  showStatus();
  setInterval(showStatus, 60000);
  if (page === "menu") {
    renderMenu();
    followSections();
    watchBar();
    // content is built after load, so a link like index.html#coffee needs this nudge
    if (location.hash) {
      var target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (target) {
        try { target.scrollIntoView({ behavior: "instant" }); } catch (e) { target.scrollIntoView(); }
      }
    }
  }
  if (page === "flowers") {
    renderFlowers();
    // photos in a row come in one after another
    [].forEach.call(document.querySelectorAll(".products"), function (list) {
      [].forEach.call(list.querySelectorAll(".photo"), function (p, i) { p.style.setProperty("--i", i); });
    });
  }
  reveal([].slice.call(document.querySelectorAll(".course-title, .photo")));
  structuredData();

  window.LittleStore = { el: el, money: money, catalog: catalog, store: S, reduceMotion: reduceMotion, bloom: bloom };
})();
