/* ============================================================
   NEON.STUDIO — 交互逻辑
   ============================================================ */
(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const videos = Array.isArray(window.VIDEOS) ? window.VIDEOS : [];

  const escapeHTML = (str = "") =>
    String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------------- Loader ---------------- */
  window.addEventListener("load", () => {
    setTimeout(() => $("#loader").classList.add("hidden"), 500);
  });

  $("#year").textContent = new Date().getFullYear();

  /* ---------------- Navigation ---------------- */
  const nav = $("#nav");
  const navToggle = $("#navToggle");
  const navLinks = $("#navLinks");

  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  navToggle.addEventListener("click", () => {
    navToggle.classList.toggle("open");
    navLinks.classList.toggle("open");
  });
  $$("a", navLinks).forEach((a) =>
    a.addEventListener("click", () => {
      navToggle.classList.remove("open");
      navLinks.classList.remove("open");
    })
  );

  // 滚动时高亮当前区块
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        $$("a", navLinks).forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${entry.target.id}`));
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  $$("main section[id]").forEach((s) => sectionObserver.observe(s));

  /* ---------------- Cursor glow ---------------- */
  const glow = $("#cursorGlow");
  if (glow && !prefersReducedMotion) {
    let gx = 0, gy = 0, tx = 0, ty = 0;
    window.addEventListener("pointermove", (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    const tick = () => {
      gx += (tx - gx) * 0.12;
      gy += (ty - gy) * 0.12;
      glow.style.transform = `translate(${gx}px, ${gy}px)`;
      requestAnimationFrame(tick);
    };
    tick();
  }

  /* ---------------- Hero particle network ---------------- */
  const canvas = $("#heroCanvas");
  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext("2d");
    const mouse = { x: -9999, y: -9999 };
    let w, h, dpr, particles = [], running = true;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(110, Math.floor((w * h) / 14000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.6 + 0.4,
        hue: Math.random() < 0.7 ? 186 : 300,
      }));
    };

    const draw = () => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      const LINK = 130;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        // 鼠标排斥
        const mdx = p.x - mouse.x, mdy = p.y - mouse.y;
        const md = Math.hypot(mdx, mdy);
        if (md < 120) {
          p.x += (mdx / md) * 1.5;
          p.y += (mdy / md) * 1.5;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 100%, 65%, 0.9)`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const d = dx * dx + dy * dy;
          if (d < LINK * LINK) {
            ctx.strokeStyle = `hsla(${p.hue}, 100%, 65%, ${0.18 * (1 - Math.sqrt(d) / LINK)})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    };

    canvas.parentElement.addEventListener("pointermove", (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    canvas.parentElement.addEventListener("pointerleave", () => { mouse.x = mouse.y = -9999; });

    // 首屏不可见时暂停动画，节省性能
    new IntersectionObserver(([entry]) => {
      const wasRunning = running;
      running = entry.isIntersecting;
      if (running && !wasRunning) draw();
    }).observe(canvas);

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    });
    resize();
    draw();
  }

  /* ---------------- Typing effect ---------------- */
  const typedEl = $("#typed");
  const phrases = ["电影级 AI 短片", "Higgsfield 视觉实验", "赛博朋克美学", "动态品牌影像"];
  if (typedEl) {
    if (prefersReducedMotion) {
      typedEl.textContent = phrases[0];
    } else {
      let pi = 0, ci = 0, deleting = false;
      const type = () => {
        const word = phrases[pi];
        typedEl.textContent = word.slice(0, ci);
        if (!deleting && ci === word.length) {
          deleting = true;
          return setTimeout(type, 1800);
        }
        if (deleting && ci === 0) {
          deleting = false;
          pi = (pi + 1) % phrases.length;
        }
        ci += deleting ? -1 : 1;
        setTimeout(type, deleting ? 45 : 110);
      };
      type();
    }
  }

  /* ---------------- Count-up stats ---------------- */
  $("#statVideos").dataset.count = videos.length;
  const countUp = (el) => {
    const target = Number(el.dataset.count) || 0;
    const suffix = el.dataset.suffix || "";
    if (prefersReducedMotion) { el.textContent = target + suffix; return; }
    const start = performance.now();
    const dur = 1600;
    const step = (now) => {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const statObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { countUp(entry.target); obs.unobserve(entry.target); }
    });
  }, { threshold: 0.6 });
  $$(".stat__num").forEach((el) => statObserver.observe(el));

  /* ---------------- Reveal on scroll ---------------- */
  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("visible"); obs.unobserve(entry.target); }
    });
  }, { threshold: 0.15 });
  $$(".reveal").forEach((el) => revealObserver.observe(el));

  /* ---------------- Video showcase ---------------- */
  const grid = $("#videoGrid");
  const filtersEl = $("#filters");
  const emptyState = $("#emptyState");
  const ALL = "全部";
  let currentFilter = ALL;
  let visibleList = [];

  const playIcon = '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>';

  const renderFilters = () => {
    const counts = videos.reduce((acc, v) => {
      const c = v.category || "未分类";
      acc[c] = (acc[c] || 0) + 1;
      return acc;
    }, {});
    const cats = [ALL, ...Object.keys(counts)];
    filtersEl.innerHTML = cats
      .map((c) => {
        const n = c === ALL ? videos.length : counts[c];
        const active = c === currentFilter;
        return `<button class="filter${active ? " active" : ""}" role="tab" aria-selected="${active}" data-filter="${escapeHTML(c)}">${escapeHTML(c)}<span class="filter__count">${n}</span></button>`;
      })
      .join("");
  };

  const cardMedia = (v) => {
    if (!v.src) {
      const px = Math.floor(Math.random() * 60 + 20);
      const py = Math.floor(Math.random() * 60 + 20);
      return `<div class="placeholder" style="--px:${px}%;--py:${py}%"><span>COMING SOON</span></div>`;
    }
    // preload="metadata" 让浏览器加载第一帧作为封面（无 poster 时）
    const poster = v.poster ? ` poster="${escapeHTML(v.poster)}"` : "";
    const src = v.poster ? escapeHTML(v.src) : `${escapeHTML(v.src)}#t=0.1`;
    return `<video src="${src}"${poster} muted loop playsinline preload="metadata"></video>`;
  };

  const renderGrid = () => {
    visibleList = videos.filter((v) => currentFilter === ALL || (v.category || "未分类") === currentFilter);
    emptyState.hidden = visibleList.length > 0;
    grid.innerHTML = visibleList
      .map(
        (v, i) => `
        <article class="video-card${v.featured ? " video-card--featured" : ""}" style="--i:${i}" tabindex="0" data-index="${i}" aria-label="播放：${escapeHTML(v.title)}">
          <div class="video-card__media">
            ${cardMedia(v)}
            <div class="video-card__overlay"></div>
            <div class="video-card__badges">
              <span class="badge badge--tool">${escapeHTML(v.tool || "Higgsfield")}</span>
              ${v.duration ? `<span class="badge">${escapeHTML(v.duration)}</span>` : ""}
            </div>
            <div class="video-card__play">${playIcon}</div>
          </div>
          <div class="video-card__body">
            <span class="video-card__cat">#${escapeHTML(v.category || "未分类")}</span>
            <h3 class="video-card__title">${escapeHTML(v.title)}</h3>
            <p class="video-card__desc">${escapeHTML(v.description || "")}</p>
          </div>
        </article>`
      )
      .join("");
    bindCards();
  };

  const bindCards = () => {
    $$(".video-card", grid).forEach((card) => {
      const video = $("video", card);
      if (video) {
        // 悬停预览播放
        card.addEventListener("mouseenter", () => video.play().catch(() => {}));
        card.addEventListener("mouseleave", () => { video.pause(); });
      }
      const open = () => openModal(Number(card.dataset.index));
      card.addEventListener("click", open);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
      });
    });
  };

  filtersEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter");
    if (!btn || btn.dataset.filter === currentFilter) return;
    currentFilter = btn.dataset.filter;
    renderFilters();
    renderGrid();
  });

  /* ---------------- Modal player ---------------- */
  const modal = $("#modal");
  const modalVideo = $("#modalVideo");
  const modalPlaceholder = $("#modalPlaceholder");
  let modalIndex = 0;
  let lastFocus = null;

  const fillModal = (i) => {
    modalIndex = (i + visibleList.length) % visibleList.length;
    const v = visibleList[modalIndex];
    $("#modalTitle").textContent = v.title;
    $("#modalDesc").textContent = v.description || "";
    $("#modalCat").textContent = `#${v.category || "未分类"}`;
    $("#modalMeta").innerHTML = [
      `<span>TOOL · <b>${escapeHTML(v.tool || "Higgsfield")}</b></span>`,
      v.duration && `<span>DURATION · <b>${escapeHTML(v.duration)}</b></span>`,
      v.date && `<span>DATE · <b>${escapeHTML(v.date)}</b></span>`,
    ].filter(Boolean).join("");

    modalVideo.pause();
    if (v.src) {
      modalPlaceholder.classList.remove("show");
      modalVideo.hidden = false;
      modalVideo.src = v.src;
      if (v.poster) modalVideo.poster = v.poster; else modalVideo.removeAttribute("poster");
      modalVideo.play().catch(() => {});
    } else {
      modalVideo.removeAttribute("src");
      modalVideo.load();
      modalVideo.hidden = true;
      modalPlaceholder.className = "modal__placeholder placeholder show";
    }
    const multiple = visibleList.length > 1;
    $("#modalPrev").hidden = !multiple;
    $("#modalNext").hidden = !multiple;
  };

  const openModal = (i) => {
    lastFocus = document.activeElement;
    fillModal(i);
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    $(".modal__close", modal).focus();
  };

  const closeModal = () => {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
    modalVideo.pause();
    if (lastFocus) lastFocus.focus();
  };

  modal.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeModal(); });
  $("#modalPrev").addEventListener("click", () => fillModal(modalIndex - 1));
  $("#modalNext").addEventListener("click", () => fillModal(modalIndex + 1));
  document.addEventListener("keydown", (e) => {
    if (!modal.classList.contains("open")) return;
    if (e.key === "Escape") closeModal();
    if (e.key === "ArrowLeft" && visibleList.length > 1) fillModal(modalIndex - 1);
    if (e.key === "ArrowRight" && visibleList.length > 1) fillModal(modalIndex + 1);
  });

  renderFilters();
  renderGrid();

  /* ---------------- Holo card tilt ---------------- */
  const holo = $("#holoCard");
  if (holo && !prefersReducedMotion) {
    holo.addEventListener("pointermove", (e) => {
      const r = holo.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      holo.style.transform = `rotateY(${(x - 0.5) * 18}deg) rotateX(${(0.5 - y) * 18}deg)`;
      holo.style.setProperty("--mx", `${x * 100}%`);
      holo.style.setProperty("--my", `${y * 100}%`);
    });
    holo.addEventListener("pointerleave", () => { holo.style.transform = ""; });
  }
})();
