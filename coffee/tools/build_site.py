#!/usr/bin/env python3
"""Builds the static Lat Hill site from content.py.

    python3 coffee/tools/build_site.py

Writes coffee/index.html, about.html, services.html and contact.html.
Every piece of text is written in both languages (<span lang="zh-Hans"> and
<span lang="en">); css/style.css shows the active one and js/main.js switches
between them. Attributes carry Chinese, with English in data-en-<attribute>.
"""
import html
import json
import re
import sys
from pathlib import Path
from urllib.parse import quote

sys.path.insert(0, str(Path(__file__).resolve().parent))
import content as C  # noqa: E402
from content import T  # noqa: E402

SITE = Path(__file__).resolve().parent.parent
MEDIA = "assets/media/"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def esc(s):
    return html.escape(s, quote=True)


def plain(s):
    return re.sub(r"<[^>]+>", "", s)


def t(x):
    """Inline text in both languages."""
    if isinstance(x, T):
        return f'<span lang="zh-Hans">{x.zh}</span><span lang="en">{x.en}</span>'
    return x


def a(name, x):
    """An attribute in both languages: Chinese value, English in data-en-<name>."""
    if isinstance(x, T):
        return f'{name}="{esc(plain(x.zh))}" data-en-{name}="{esc(plain(x.en))}"'
    return f'{name}="{esc(plain(x))}"'


def fmt(tpl, **kw):
    """Fill a T template with values that may themselves be T."""
    pick = lambda lang: {k: (v[lang] if isinstance(v, T) else v) for k, v in kw.items()}
    return T(tpl.zh.format(**pick("zh")), tpl.en.format(**pick("en")))


def wa_url(text):
    return f"https://wa.me/{C.WHATSAPP}?text={quote(text)}"


def wa_attrs(msg):
    """WhatsApp link with the message in Chinese, and in English for the EN toggle."""
    return f'href="{esc(wa_url(msg.zh))}" data-en-href="{esc(wa_url(msg.en))}" target="_blank" rel="noopener"'


def jsonable(x):
    if isinstance(x, T):
        return {"zh": x.zh, "en": x.en}
    if isinstance(x, dict):
        return {k: jsonable(v) for k, v in x.items()}
    if isinstance(x, (list, tuple)):
        return [jsonable(v) for v in x]
    return x


def indent(block, n):
    pad = " " * n
    return "\n".join(pad + line if line.strip() else line for line in block.strip("\n").split("\n"))


# ---------------------------------------------------------------------------
# Icons
# ---------------------------------------------------------------------------
ICON = {
    "wa": '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3Z"/><path fill="currentColor" d="M8.6 7.6c.3-.6.6-.6 1-.6h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .6l-.5.7c-.1.2-.1.4 0 .6.6 1 1.4 1.9 2.5 2.5.2.1.4.1.6 0l.7-.6c.2-.2.4-.2.6-.1l1.9.9c.3.1.4.3.4.5 0 .9-.6 1.8-1.5 2.1-.8.3-1.8.2-3.3-.5-2-1-3.6-2.7-4.6-4.7-.6-1.3-.6-2.3-.2-3.1Z"/></svg>',
    "check": '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m4 10 4 4 8-8"/></svg>',
    "pause": '<svg class="icon-pause" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M4 3h3v10H4zM9 3h3v10H9z"/></svg>',
    "play": '<svg class="icon-play" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M4 2.5v11l9-5.5z"/></svg>',
    "instagram": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
    "facebook": '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H7.9v3h2.6V21h3Z"/></svg>',
    "tiktok": '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16.6 3c.3 2.2 1.6 3.6 3.9 3.8v3.1c-1.4.1-2.6-.3-3.9-1.1v5.7c0 3.6-2.6 6.1-6 6.1-3.3 0-5.6-2.4-5.6-5.5 0-3.4 2.7-5.8 6.3-5.5v3.2c-.4-.1-.7-.1-1-.1-1.4 0-2.3.9-2.3 2.3 0 1.3.9 2.3 2.4 2.3 1.6 0 2.5-1 2.5-2.9V3h3.7Z"/></svg>',
    "xhs": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><path d="M8 9h8M8 12h8M8 15h5" stroke-linecap="round"/></svg>',
}


def logo_svg():
    # A coffee bean rising over the horizon like a hill at dawn
    return ('<svg viewBox="0 0 40 40" aria-hidden="true">'
            '<path fill="currentColor" fill-rule="evenodd" d="M6 30A14 16 0 0 1 34 30Z'
            'M18.9 14.6C15.2 19.6 23.1 24.6 18.9 30H21.1C25.3 24.6 17.4 19.6 21.1 14.6Z"/>'
            '<path d="M3 30H37" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>'
            '<circle cx="32.5" cy="10.5" r="2.6" fill="#d9a86c"/></svg>')


FAVICON = ("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E"
           "%3Cpath fill='%232a1a12' fill-rule='evenodd' d='M6 30A14 16 0 0 1 34 30Z"
           "M18.9 14.6C15.2 19.6 23.1 24.6 18.9 30H21.1C25.3 24.6 17.4 19.6 21.1 14.6Z'/%3E"
           "%3Cpath d='M3 30H37' stroke='%232a1a12' stroke-width='2.2' stroke-linecap='round'/%3E"
           "%3Ccircle cx='32.5' cy='10.5' r='2.6' fill='%239e2b25'/%3E%3C/svg%3E")


# ---------------------------------------------------------------------------
# Shared parts
# ---------------------------------------------------------------------------
LANG_BOOT = """(function () {
      /* Pick the language before the first paint: ?lang=, then the saved choice,
         then Chinese if the browser lists Chinese at all, otherwise English. */
      var d = document.documentElement, m = /[?&]lang=(zh|en)\\b/.exec(location.search), l = m && m[1];
      try { if (l) localStorage.setItem("lathill-lang", l); else l = localStorage.getItem("lathill-lang"); } catch (e) {}
      if (l !== "zh" && l !== "en") l = /(^|,)zh/i.test((navigator.languages || [navigator.language || ""]).join(",")) ? "zh" : "en";
      d.setAttribute("data-lang", l); d.lang = l === "zh" ? "zh-Hans" : "en";
    })();"""


def js_strings():
    return {
        "tz": C.TIMEZONE,
        "roastDays": list(C.ROAST_DAYS),
        "menuOpen": C.UI["menu_open"], "menuClose": C.UI["menu_close"],
        "videoPause": C.UI["video_pause"], "videoPlay": C.UI["video_play"],
        "nextRoast": C.UI["next_roast"],
        "ctaNext": C.HOME["cta"]["title_next"],
        "scheduleNext": C.CONTACT["schedule"]["next"],
        "filterStatus": C.SERVICES["beans"]["status"],
        "hours": {k: C.CONTACT["hours"][k] for k in ("online", "later", "offline")},
        "form": {k: C.CONTACT["form"][k] for k in ("err_name", "err_contact_empty", "err_contact", "err_message", "success")},
    }


def head(page, preload=None):
    pre = f'\n  <link rel="preload" as="image" href="{preload}">' if preload else ""
    return f"""<!doctype html>
<html lang="zh-Hans" data-lang="zh">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title data-en-text="{esc(page["title"].en)}">{esc(page["title"].zh)}</title>
  <meta name="description" {a("content", page["description"])}>
  <meta name="theme-color" content="#2a1a12">
  <link rel="icon" href="{FAVICON}">
  <script>
    {LANG_BOOT}
  </script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;700&family=Noto+Sans+SC:wght@400;500;700&family=Noto+Serif:wght@600;700&family=Noto+Serif+SC:wght@600;700;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">{pre}
</head>"""


def header(current):
    items = "\n".join(
        f'<li><a href="{n["href"]}"{" aria-current=" + chr(34) + "page" + chr(34) if n["page"] == current else ""}>{t(n["label"])}</a></li>'
        for n in C.NAV)
    return f"""  <a class="skip-link" href="#main">{t(C.UI["skip"])}</a>

  <!-- ===== Header ===== -->
  <header class="site-header" data-header>
    <div class="container header-inner">
      <a class="logo" href="index.html" {a("aria-label", C.UI["home_label"])}>
        {logo_svg()}
        <span class="logo-text"><b>{C.BRAND["mark"]}</b><small>{C.BRAND["latin"]} {C.BRAND["tagline"]}</small></span>
      </a>
      <nav class="nav" id="site-nav" {a("aria-label", T("主导航", "Main"))}>
        <ul>
{indent(items, 10)}
        </ul>
        <a class="btn btn-primary nav-cta" href="{C.RESERVE_HREF}">{t(C.UI["reserve"])}</a>
      </nav>
      <div class="lang-switch" role="group" {a("aria-label", C.UI["lang_group"])}>
        <button type="button" data-set-lang="zh" aria-pressed="true" aria-label="中文">中</button>
        <button type="button" data-set-lang="en" aria-pressed="false" aria-label="English">EN</button>
      </div>
      <a class="btn btn-primary btn-sm header-cta" href="{C.RESERVE_HREF}">{t(C.UI["reserve"])}</a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="{esc(C.UI["menu_open"].zh)}"><span></span></button>
    </div>
  </header>"""


def footer():
    F = C.FOOTER
    nav = "\n".join(f'<li><a href="{n["href"]}">{t(n["label"])}</a></li>' for n in C.NAV)
    social = "\n".join(
        f'<li><a href="{s["url"]}" {a("aria-label", fmt(T("{l}：{h}", "{l}: {h}"), l=s["label"], h=s["handle"]))}>'
        f'{ICON[s["key"]]}{t(s["label"])}</a></li>' for s in C.SOCIAL)
    social_col = f"""
        <div>
          <h2>{t(F["social_title"])}</h2>
          <ul class="social">
{indent(social, 12)}
          </ul>
        </div>""" if C.SOCIAL else ""
    hello = C.WA_MESSAGES["hello"]
    return f"""  <!-- ===== Footer ===== -->
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid{" has-social" if C.SOCIAL else ""}">
        <div>
          <a class="logo" href="index.html" {a("aria-label", C.UI["home_label"])}>
            {logo_svg()}
            <span class="logo-text"><b>{C.BRAND["mark"]}</b><small>{C.BRAND["latin"]} {C.BRAND["tagline"]}</small></span>
          </a>
          <p class="footer-about">{t(F["about"])}</p>
        </div>
        <div>
          <h2>{t(F["nav_title"])}</h2>
          <ul class="footer-links">
{indent(nav, 12)}
          </ul>
        </div>
        <div>
          <h2>{t(F["help_title"])}</h2>
          <ul class="footer-links">
            <li><a {wa_attrs(hello)}>WhatsApp {C.WHATSAPP_DISPLAY}</a></li>
            <li><a href="mailto:{C.EMAIL}">{C.EMAIL}</a></li>
            <li>{t(F["help_hours"])}</li>
          </ul>
        </div>{social_col}
      </div>
      <div class="footer-bottom">
        <span>© <span data-year>2026</span> {t(F["copyright"])}</span>
        <span>{t(F["ai_note"])}</span>
        <nav {a("aria-label", T("法律信息", "Legal"))}><a href="#">{t(F["privacy"])}</a><a href="#">{t(F["shipping"])}</a></nav>
      </div>
    </div>
  </footer>"""


def scripts(extra=None, files=()):
    data = js_strings()
    if extra:
        data.update(extra)
    blob = json.dumps(jsonable(data), ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    tags = "".join(f'\n  <script src="js/{f}"></script>' for f in (*files, "main.js"))
    return f"""  <script type="application/json" id="site-i18n">{blob}</script>{tags}"""


def page(current, meta, main, body_class="", preload=None, extra=None, files=()):
    return f"""{head(meta, preload)}
<body class="page-{current}{(" " + body_class) if body_class else ""}">
{header(current)}

  <main id="main">
{main}
  </main>

{footer()}

{scripts(extra, files)}
</body>
</html>
"""


def video_tag(key, cls="", small=False):
    name = C.VIDEOS[key]
    sm = f' data-src-sm="{MEDIA}{name}-sm.mp4"' if small else ""
    return (f'<video{(" class=" + chr(34) + cls + chr(34)) if cls else ""} muted loop playsinline preload="none" '
            f'poster="{MEDIA}{name}.jpg" data-src="{MEDIA}{name}.mp4"{sm} aria-hidden="true"></video>')


def video_toggle(with_text=False):
    label = esc(C.UI["video_pause"].zh)
    if with_text:
        return (f'<button class="video-toggle" type="button" data-video-toggle aria-label="{label}">'
                f'{ICON["pause"]}{ICON["play"]}<span data-video-toggle-text>{label}</span></button>')
    return (f'<button class="video-toggle video-toggle-icon-only" type="button" data-video-toggle aria-label="{label}">'
            f'{ICON["pause"]}{ICON["play"]}</button>')


def media_frame(key, cls=""):
    name = C.VIDEOS[key]
    return (f'<div class="media-frame{(" " + cls) if cls else ""}" style="background-image:url({MEDIA}{name}.jpg)">\n'
            f'  {video_tag(key)}\n  {video_toggle()}\n</div>')


def page_hero(hero):
    return f"""    <section class="page-hero">
      <div class="container page-hero-grid">
        <div class="page-hero-copy">
          <nav class="breadcrumb" {a("aria-label", C.UI["breadcrumb"])}><a href="index.html">{t(C.UI["home"])}</a> / {t(hero["crumb"])}</nav>
          <h1>{t(hero["title"])}</h1>
          <p>{t(hero["lead"])}</p>
        </div>
{indent(media_frame(hero["video"]), 8)}
      </div>
    </section>"""


def product_card(p):
    level = C.ROAST_LEVELS[p["roast"]]
    bars = "".join(f'<li{" class=" + chr(34) + "on" + chr(34) if i <= p["roast"] else ""}></li>' for i in range(1, 6))
    scale_label = fmt(T("5 级中的第 {n} 级（{lv}）", "Roast level {n} of 5 ({lv})"), n=p["roast"], lv=level)
    msg = fmt(C.WA_MESSAGES["order"], name=p["name"], size=p["size"], price=p["price"])
    return f"""<article class="product" data-category="{p["cat"]}">
  <div class="bag" style="--bag-label:{p["color"]}"><div class="bag-label"><span class="bag-brand">{C.BRAND["mark"]}</span><b>{p["label"][0]}</b><small>{p["label"][1]}</small></div></div>
  <p class="product-origin">{t(p["origin"])}</p>
  <h3>{t(p["name"])}</h3>
  <p class="product-notes">{t(p["notes"])}</p>
  <div class="roast-scale"><span>{t(C.UI["roast"])}</span><ol {a("aria-label", scale_label)}>{bars}</ol><span>{t(level)}</span></div>
  <div class="product-foot">
    <span class="price">RM {p["price"]}<small>/ {t(p["size"])}</small></span>
    <a class="btn btn-ghost btn-sm" {wa_attrs(msg)}>{ICON["wa"]}{t(C.UI["order_wa"])}</a>
  </div>
</article>"""


def products(keys=None):
    items = [p for p in C.PRODUCTS if keys is None or p["key"] in keys]
    if keys:
        items.sort(key=lambda p: keys.index(p["key"]))
    return "\n".join(product_card(p) for p in items)


# ---------------------------------------------------------------------------
# Pages
# ---------------------------------------------------------------------------
def build_index():
    H = C.HOME
    hero, ways, proc, curve, feat, rev, cta = (H[k] for k in ("hero", "two_ways", "process", "curve", "featured", "reviews", "cta"))
    RC = C.ROAST_CURVE
    hv = C.VIDEOS["hero"]

    cards = "\n".join(f"""<article class="way-card">
{indent(media_frame(c["video"]), 2)}
  <div class="way-body">
    <h3>{t(c["title"])}</h3>
    <p>{t(c["text"])}</p>
    <a class="text-link" href="{c["href"]}">{t(c["link"])}</a>
  </div>
</article>""" for c in ways["cards"])
    steps = "\n".join(f'<li><div><h3>{t(s["title"])}</h3><p>{t(s["text"])}</p></div></li>' for s in proc["steps"])
    f, more = rev["featured"], rev["more"]
    small_reviews = "\n".join(f"""<figure class="review-small">
  <blockquote>{t(r["quote"])}</blockquote>
  <figcaption class="review-person"><span class="avatar" aria-hidden="true">{r["initial"]}</span><span><b>{r["name"]}</b>{t(r["role"])}</span></figcaption>
</figure>""" for r in more)

    main = f"""    <!-- ===== Hero: full-screen video ===== -->
    <section class="hero" aria-labelledby="hero-title" style="background-image:url({MEDIA}{hv}.jpg)">
      {video_tag("hero", "hero-video", small=True)}
      <div class="container hero-inner">
        <p class="roast-pill" data-next-roast="pill">{t(C.UI["roast_days"])}</p>
        <h1 id="hero-title">{t(hero["title"])}</h1>
        <p class="hero-lead">{t(hero["lead"])}</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="services.html">{t(hero["shop"])}</a>
          <a class="btn btn-outline-light" href="{C.RESERVE_HREF}">{t(C.UI["reserve"])}</a>
        </div>
      </div>
      {video_toggle(with_text=True)}
    </section>

    <!-- ===== Two lines: specialty and traditional ===== -->
    <section class="section" aria-labelledby="ways-title">
      <div class="container">
        <div class="section-head">
          <h2 id="ways-title">{t(ways["title"])}</h2>
          <p>{t(ways["intro"])}</p>
        </div>
        <div class="ways">
{indent(cards, 10)}
        </div>
      </div>
    </section>

    <!-- ===== From hill to cup ===== -->
    <section class="section section-paper" aria-labelledby="process-title">
      <div class="container process">
{indent(media_frame(proc["video"]), 8)}
        <div>
          <h2 id="process-title">{t(proc["title"])}</h2>
          <ol class="steps">
{indent(steps, 12)}
          </ol>
        </div>
      </div>
    </section>

    <!-- ===== Interactive roast curve ===== -->
    <section class="section section-dark" aria-labelledby="curve-title">
      <div class="container curve-grid">
        <div class="curve-copy">
          <h2 id="curve-title">{t(curve["title"])}</h2>
          <p>{t(curve["text"])}</p>
        </div>
        <figure class="roast-card" aria-labelledby="roast-card-title">
          <div class="roast-card-head">
            <h3 id="roast-card-title">{t(RC["title"])}</h3>
            <span>{t(RC["axis"])}</span>
          </div>
          <div class="roast-chart" data-roast-chart>
            <svg role="presentation" focusable="false"></svg>
            <label class="visually-hidden" for="roast-range">{t(RC["range"])}</label>
            <input class="roast-range" id="roast-range" type="range" min="0" max="720" step="5" value="525">
          </div>
          <figcaption class="roast-readout">
            <svg class="bean-swatch" viewBox="0 0 64 64" aria-hidden="true">
              <g transform="rotate(30 32 32)"><ellipse data-bean cx="32" cy="32" rx="20" ry="27" fill="#74432a"/><path d="M32 7c-8 12 8 38 0 50" stroke="rgba(0,0,0,.35)" stroke-width="3" fill="none" stroke-linecap="round"/></g>
            </svg>
            <div>
              <div class="roast-stats"><span>{t(RC["time"])} <b data-out-time>8:45</b></span><span>{t(RC["temp"])} <b data-out-temp>208°C</b></span></div>
              <p class="roast-stage" data-out-stage>{t(RC["stages"][4]["name"])}</p>
              <p class="roast-stats" data-out-use>{t(RC["stages"][4]["use"])}</p>
              <ul class="roast-notes" data-out-notes>{"".join("<li>" + t(n) + "</li>" for n in RC["stages"][4]["notes"])}</ul>
            </div>
          </figcaption>
          <p class="roast-hint">{t(RC["hint"])}</p>
        </figure>
      </div>
    </section>

    <!-- ===== Featured coffee ===== -->
    <section class="section" aria-labelledby="featured-title">
      <div class="container">
        <div class="section-head section-head-row">
          <div>
            <h2 id="featured-title">{t(feat["title"])}</h2>
            <p>{t(feat["intro"])}</p>
          </div>
          <a class="btn btn-ghost" href="services.html#beans">{t(feat["all"])}</a>
        </div>
        <div class="product-grid">
{indent(products(list(C.FEATURED)), 10)}
        </div>
      </div>
    </section>

    <!-- ===== Testimonials ===== -->
    <section class="section section-dark" aria-labelledby="reviews-title">
      <div class="container">
        <div class="section-head">
          <h2 id="reviews-title">{t(rev["title"])}</h2>
          <p>{t(rev["intro"])}</p>
        </div>
        <div class="reviews">
          <figure class="review-feature">
            <blockquote>{t(f["quote"])}</blockquote>
            <figcaption class="review-person"><span class="avatar" aria-hidden="true">{f["initial"]}</span><span><b>{f["name"]}</b>{t(f["role"])}</span></figcaption>
          </figure>
          <div class="review-stack">
{indent(small_reviews, 12)}
          </div>
        </div>
      </div>
    </section>

    <!-- ===== Call to action ===== -->
    <section class="cta-band" aria-labelledby="cta-title">
      <div class="container">
        <div class="cta-box">
          <div>
            <h2 id="cta-title" data-next-roast="cta">{t(cta["title"])}</h2>
            <p>{t(cta["text"])}</p>
          </div>
          <div class="hero-actions">
            <a class="btn btn-light" href="{C.RESERVE_HREF}">{t(C.UI["reserve"])}</a>
            <a class="btn btn-outline-light" {wa_attrs(C.WA_MESSAGES["reserve"])}>{ICON["wa"]}{t(cta["wa"])}</a>
          </div>
        </div>
      </div>
    </section>"""
    extra = {"roast": {k: RC[k] for k in ("markers", "turning", "stages")}}
    return page("index", H, main, body_class="has-video-hero", preload=f"{MEDIA}{hv}.jpg", extra=extra,
                files=("roast-curve.js",))


def build_about():
    A = C.ABOUT
    s, band, team, values, cta = (A[k] for k in ("story", "band", "team", "values", "cta"))
    paras = "\n".join(f"<p>{t(p)}</p>" for p in s["paragraphs"])
    timeline = "\n".join(
        f'<li><time datetime="{i["year"]}">{i["year"]}</time><h3>{t(i["title"])}</h3><p>{t(i["text"])}</p></li>'
        for i in s["timeline"])
    members = "\n".join(f"""<article class="member">
  <div class="member-photo" style="background:{m["color"]}" aria-hidden="true">{m["initial"]}</div>
  <h3>{m["name"]}</h3>
  <p class="role">{t(m["role"])}</p>
  <p>{t(m["bio"])}</p>
</article>""" for m in team["members"])
    vals = "\n".join(f'<div class="value"><h3>{t(v["title"])}</h3><p>{t(v["text"])}</p></div>' for v in values["items"])
    tasting = next(p for p in C.PRODUCTS if p["key"] == "tasting")
    msg = fmt(C.WA_MESSAGES["order"], name=tasting["name"], size=tasting["size"], price=tasting["price"])
    hv = C.VIDEOS[band["video"]]

    main = f"""{page_hero(A["hero"])}

    <!-- ===== Story ===== -->
    <section class="section" aria-labelledby="story-title">
      <div class="container story">
        <div class="story-text">
          <h2 id="story-title" class="visually-hidden">{t(s["title"])}</h2>
          <p class="pull">{t(s["pull"])}</p>
{indent(paras, 10)}
        </div>
        <div>
          <h2 class="visually-hidden">{t(s["timeline_title"])}</h2>
          <ol class="timeline">
{indent(timeline, 12)}
          </ol>
        </div>
      </div>
    </section>

    <!-- ===== Video band ===== -->
    <section class="video-band" style="background-image:url({MEDIA}{hv}.jpg)" {a("aria-label", band["cite"])}>
      {video_tag(band["video"], small=True)}
      <div class="container">
        <figure>
          <blockquote><p>{t(band["quote"])}</p></blockquote>
          <figcaption>{t(band["cite"])}</figcaption>
        </figure>
      </div>
      {video_toggle()}
    </section>

    <!-- ===== Team ===== -->
    <section class="section section-paper" aria-labelledby="team-title">
      <div class="container">
        <div class="section-head">
          <h2 id="team-title">{t(team["title"])}</h2>
          <p>{t(team["intro"])}</p>
        </div>
        <div class="team-grid">
{indent(members, 10)}
        </div>
      </div>
    </section>

    <!-- ===== Values ===== -->
    <section class="section section-dark" aria-labelledby="values-title">
      <div class="container">
        <div class="section-head">
          <h2 id="values-title">{t(values["title"])}</h2>
          <p>{t(values["intro"])}</p>
        </div>
        <div class="values">
{indent(vals, 10)}
        </div>
      </div>
    </section>

    <section class="cta-band" aria-labelledby="cta-title">
      <div class="container">
        <div class="cta-box">
          <div>
            <h2 id="cta-title">{t(cta["title"])}</h2>
            <p>{t(cta["text"])}</p>
          </div>
          <div class="hero-actions">
            <a class="btn btn-light" {wa_attrs(msg)}>{ICON["wa"]}{t(cta["order"])}</a>
            <a class="btn btn-outline-light" href="services.html#beans">{t(cta["all"])}</a>
          </div>
        </div>
      </div>
    </section>"""
    return page("about", A, main)


def build_services():
    S = C.SERVICES
    beans, plans, partners, faq = (S[k] for k in ("beans", "plans", "partners", "faq"))
    filters = [f'<button class="filter-btn" type="button" data-filter="all" aria-pressed="true">{t(beans["all"])}</button>']
    filters += [f'<button class="filter-btn" type="button" data-filter="{c["key"]}" aria-pressed="false">{t(c["label"])}</button>'
                for c in C.CATEGORIES]

    def plan_html(p):
        feats = "\n".join(f"<li>{ICON['check']}<span>{t(x)}</span></li>" for x in p["features"])
        featured = p.get("featured")
        badge = f'<span class="plan-badge">{t(plans["badge"])}</span>\n' if featured else ""
        if p["from"]:  # "RM 380/月起" in Chinese, "from RM 380/month" in English
            price = f'<span lang="en">{plans["from"].en} </span>RM {p["price"]}'
            suffix = T(plans["per_month"].zh + plans["from"].zh, plans["per_month"].en)
        else:
            price, suffix = f'RM {p["price"]}', plans["per_month"]
        cls = "btn btn-primary" if featured else "btn btn-outline-light"
        if p.get("href"):
            link = f'href="{p["href"]}"'
        else:
            link = wa_attrs(fmt(C.WA_MESSAGES["plan"], name=p["name"]))
        return f"""<article class="plan{" is-featured" if featured else ""}">
  {badge}<h3>{t(p["name"])}</h3>
  <p class="plan-desc">{t(p["desc"])}</p>
  <p class="plan-price">{price}<small>{t(suffix)}</small></p>
  <ul>
{indent(feats, 4)}
  </ul>
  <a class="{cls}" {link}>{t(p["button"])}</a>
</article>"""

    head_cells = "".join(f'<th scope="col">{t(h)}</th>' for h in partners["head"])
    label = lambda h: f'<span class="cell-label">{t(T(h.zh + "：", h.en + ": "))}</span>'
    rows = "\n".join(f"""<tr>
  <td><h3>{t(r["title"])}</h3><p>{t(r["text"])}</p></td>
  <td>{label(partners["head"][1])}{t(r["min"])}</td>
  <td><span class="price">{t(r["price"])}</span></td>
</tr>""" for r in partners["rows"])
    faqs = "\n".join(f"""<details>
  <summary>{t(q["q"])}</summary>
  <p>{t(q["a"])}</p>
</details>""" for q in faq["items"])

    main = f"""{page_hero(S["hero"])}

    <!-- ===== Coffee ===== -->
    <section class="section" id="beans" aria-labelledby="beans-title">
      <div class="container">
        <div class="section-head section-head-row">
          <div>
            <h2 id="beans-title">{t(beans["title"])}</h2>
            <p>{t(beans["intro"])}</p>
          </div>
          <div class="filters" data-filters role="group" {a("aria-label", beans["filter_label"])}>
{indent(chr(10).join(filters), 12)}
          </div>
        </div>
        <p class="visually-hidden" data-filter-status aria-live="polite"></p>
        <div class="product-grid">
{indent(products(), 10)}
        </div>
      </div>
    </section>

    <!-- ===== Subscriptions ===== -->
    <section class="section section-dark" id="plans" aria-labelledby="plans-title">
      <div class="container">
        <div class="section-head">
          <h2 id="plans-title">{t(plans["title"])}</h2>
          <p>{t(plans["intro"])}</p>
        </div>
        <div class="plans">
{indent(chr(10).join(plan_html(p) for p in plans["items"]), 10)}
        </div>
      </div>
    </section>

    <!-- ===== Wholesale and partnerships ===== -->
    <section class="section" aria-labelledby="partners-title">
      <div class="container">
        <div class="section-head">
          <h2 id="partners-title">{t(partners["title"])}</h2>
          <p>{t(partners["intro"])}</p>
        </div>
        <table class="service-table">
          <thead><tr>{head_cells}</tr></thead>
          <tbody>
{indent(rows, 12)}
          </tbody>
        </table>
        <div class="hero-actions after-table"><a class="btn btn-primary" href="contact.html?type=wholesale#reserve">{t(partners["cta"])}</a></div>
      </div>
    </section>

    <!-- ===== FAQ ===== -->
    <section class="section section-paper" aria-labelledby="faq-title">
      <div class="container">
        <div class="section-head"><h2 id="faq-title">{t(faq["title"])}</h2></div>
        <div class="faq">
{indent(faqs, 10)}
        </div>
      </div>
    </section>"""
    return page("services", S, main)


def build_contact():
    K = C.CONTACT
    form, wa, hours, sched, deliv = (K[k] for k in ("form", "whatsapp", "hours", "schedule", "delivery"))
    req = '<span class="wpforms-required-label" aria-hidden="true">*</span>'
    topics = "\n".join(
        f'<label><input type="radio" name="wpforms[fields][3]" value="{v}"{" checked" if i == 0 else ""}><span>{t(lbl)}</span></label>'
        for i, (v, lbl) in enumerate(form["topics"]))
    areas = "\n".join(f'<option value="{v}" data-en-text="{esc(x.en)}">{esc(x.zh)}</option>'
                      for v, x in zip(("west", "east"), form["areas"]))
    grinds = "\n".join(f'<option value="{v}" data-en-text="{esc(x.en)}">{esc(x.zh)}</option>'
                       for v, x in zip(("whole", "pourover", "espresso", "frenchpress", "moka", "phin"), form["grinds"]))
    hour_rows = "\n".join(
        f'<tr data-days="{r["days"]}" data-open="{r["open"]}" data-close="{r["close"]}"><th scope="row">{t(r["label"])}'
        f'<span class="today-tag">{t(hours["today"])}</span></th>'
        f'<td>{(r["open"] + " – " + r["close"]) if r["open"] else t(hours["closed"])}</td></tr>'
        for r in hours["rows"])
    sched_rows = "\n".join(f"<div><dt>{t(k)}</dt><dd>{t(v)}</dd></div>" for k, v in sched["rows"])
    deliv_head = "".join(f'<th scope="col">{t(h)}</th>' for h in deliv["head"])
    deliv_rows = "\n".join(f'<tr><th scope="row">{t(r[0])}</th><td>{t(r[1])}</td><td>{t(r[2])}</td></tr>' for r in deliv["rows"])
    map_src = lambda hl: f"https://maps.google.com/maps?q=Malaysia&t=m&z=5&output=embed&iwloc=near&hl={hl}"

    main = f"""{page_hero(K["hero"])}

    <section class="section">
      <div class="container contact-grid">
        <!-- ===== Form (WPForms placeholder) ===== -->
        <div class="form-card" id="reserve">
          <h2>{t(form["title"])}</h2>
          <p>{t(form["required"])}</p>

          <!--
            WPForms 占位 / WPForms placeholder
            On WordPress, replace the whole .wpforms-container with the shortcode:
              [wpforms id="123" title="false"]
            Class and field names follow WPForms' own markup, so the styles still apply.
          -->
          <div class="wpforms-container" id="wpforms-123">
            <p class="wpforms-placeholder-note">{t(form["wpforms_note"])}</p>

            <form class="wpforms-form" id="wpforms-form-123" data-contact-form novalidate>
              <div class="field-row">
                <div class="wpforms-field">
                  <label for="wpforms-123-field_1">{t(form["name"])}{req}</label>
                  <input id="wpforms-123-field_1" name="wpforms[fields][1]" type="text" autocomplete="name" required data-rule="name" aria-describedby="err-1">
                  <p class="wpforms-error" id="err-1" role="alert"></p>
                </div>
                <div class="wpforms-field">
                  <label for="wpforms-123-field_2">{t(form["contact"])}{req}</label>
                  <input id="wpforms-123-field_2" name="wpforms[fields][2]" type="text" inputmode="email" autocomplete="tel" required data-rule="contact" aria-describedby="hint-2 err-2">
                  <p class="field-hint" id="hint-2">{t(form["contact_hint"])}</p>
                  <p class="wpforms-error" id="err-2" role="alert"></p>
                </div>
              </div>

              <fieldset class="wpforms-field">
                <legend>{t(form["topic"])}</legend>
                <div class="choice-group">
{indent(topics, 18)}
                </div>
              </fieldset>

              <div class="field-row">
                <div class="wpforms-field">
                  <label for="wpforms-123-field_4">{t(form["area"])}</label>
                  <select id="wpforms-123-field_4" name="wpforms[fields][4]">
{indent(areas, 20)}
                  </select>
                </div>
                <div class="wpforms-field">
                  <label for="wpforms-123-field_5">{t(form["grind"])}</label>
                  <select id="wpforms-123-field_5" name="wpforms[fields][5]">
{indent(grinds, 20)}
                  </select>
                </div>
              </div>

              <div class="wpforms-field">
                <label for="wpforms-123-field_6">{t(form["message"])}{req}</label>
                <textarea id="wpforms-123-field_6" name="wpforms[fields][6]" required data-rule="message" aria-describedby="err-6" {a("placeholder", form["message_ph"])}></textarea>
                <p class="wpforms-error" id="err-6" role="alert"></p>
              </div>

              <div class="form-submit">
                <button class="btn btn-primary" type="submit" name="wpforms[submit]">{t(form["submit"])}</button>
                <p class="field-hint">{t(form["privacy"])}</p>
              </div>
            </form>

            <div class="form-success" data-form-success role="status" tabindex="-1">
              <h3>{t(form["success_title"])}</h3>
              <p data-success-text></p>
            </div>
          </div>
        </div>

        <!-- ===== WhatsApp, hours, schedule ===== -->
        <aside class="info-stack">
          <div class="info-card info-card-dark">
            <h2>{t(wa["title"])}</h2>
            <p>{t(wa["text"])}</p>
            <a class="wa-number" {wa_attrs(C.WA_MESSAGES["hello"])}>{C.WHATSAPP_DISPLAY}</a>
            <a class="btn btn-light" {wa_attrs(C.WA_MESSAGES["hello"])}>{ICON["wa"]}{t(wa["button"])}</a>
            <p class="email-line">{t(T(wa["email_label"].zh + "：", wa["email_label"].en + ": "))}<a href="mailto:{C.EMAIL}">{C.EMAIL}</a></p>
          </div>

          <div class="info-card">
            <h2>{t(hours["title"])} <span class="open-status" data-open-status></span></h2>
            <table class="hours" data-hours>
              <caption class="visually-hidden">{t(hours["title"])}</caption>
              <tbody>
{indent(hour_rows, 16)}
              </tbody>
            </table>
            <p class="note">{t(hours["note"])}</p>
          </div>

          <div class="info-card">
            <h2>{t(sched["title"])}</h2>
            <dl class="schedule">
{indent(sched_rows, 14)}
            </dl>
            <p class="next-roast" data-next-roast="schedule"></p>
          </div>
        </aside>
      </div>
    </section>

    <!-- ===== Delivery + map ===== -->
    <section class="section section-paper" aria-labelledby="delivery-title">
      <div class="container delivery">
        <div>
          <h2 id="delivery-title">{t(deliv["title"])}</h2>
          <table class="delivery-table">
            <thead><tr>{deliv_head}</tr></thead>
            <tbody>
{indent(deliv_rows, 14)}
            </tbody>
          </table>
          <p class="note">{t(deliv["note"])}</p>
        </div>
        <figure class="map-wrap">
          <div class="map-frame">
            <iframe {a("title", deliv["map_title"])} loading="lazy" referrerpolicy="no-referrer-when-downgrade"
              src="{esc(map_src("zh-CN"))}" data-en-src="{esc(map_src("en"))}"></iframe>
          </div>
          <figcaption>{t(deliv["map_caption"])}</figcaption>
        </figure>
      </div>
    </section>"""
    return page("contact", K, main)


def build_image_sheet():
    """A page of the logo and coffee bags for tools/render-images.js to turn into PNGs
    (used by the Elementor templates, since WordPress doesn't accept SVG uploads)."""
    bags = "\n".join(
        f'<div class="shot" data-shot="bag-{p["key"]}"><div class="bag" style="--bag-label:{p["color"]}">'
        f'<div class="bag-label"><span class="bag-brand">{C.BRAND["mark"]}</span><b>{p["label"][0]}</b>'
        f'<small>{p["label"][1]}</small></div></div></div>' for p in C.PRODUCTS)
    lockup = lambda name, color: (
        f'<div class="lockup" data-shot="{name}" style="color:{color}">{logo_svg()}'
        f'<span class="logo-text"><b>{C.BRAND["mark"]}</b><small>{C.BRAND["latin"]} {C.BRAND["tagline"]}</small></span></div>')
    return f"""<!doctype html>
<!-- Generated by build_site.py. Rendered to PNG by render-images.js; not part of the site. -->
<html lang="zh-Hans" data-lang="zh">
<head>
  <meta charset="utf-8">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;700&family=Noto+Serif:wght@600;700&family=Noto+Serif+SC:wght@600;700;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../css/style.css">
  <style>
    html, body {{ background: transparent !important; margin: 0; }}
    body {{ padding: 16px; display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-start; }}
    .shot {{ padding: 20px 28px 44px; }}            /* room for the bag's shadow */
    .shot .bag {{ width: 220px; max-width: none; margin: 0; }}
    .shot .bag-label b {{ font-size: 1.3rem; }}
    .lockup {{ display: inline-flex; align-items: center; gap: 12px; padding: 6px 8px; }}
    .lockup svg {{ width: 52px; height: 52px; }}
    .lockup .logo-text b {{ font-size: 1.85rem; }}
    .lockup .logo-text small {{ font-size: 0.9rem; opacity: 0.8; }}
  </style>
</head>
<body>
{lockup("logo-dark", "#2a1a12")}
{lockup("logo-light", "#f7f0e5")}
{bags}
</body>
</html>
"""


def main():
    out = {"index.html": build_index(), "about.html": build_about(),
           "services.html": build_services(), "contact.html": build_contact(),
           "tools/image-sheet.html": build_image_sheet()}
    for name, doc in out.items():
        (SITE / name).write_text(doc, encoding="utf-8")
        print(f"wrote coffee/{name} ({len(doc) // 1024} KB)")


if __name__ == "__main__":
    main()
