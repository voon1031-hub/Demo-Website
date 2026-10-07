#!/usr/bin/env python3
"""Builds Elementor templates (JSON) for WordPress from content.py.

    python3 coffee/tools/build_elementor.py [--media-base URL]

Writes, for Chinese (zh) and English (en):
  coffee/elementor/<lang>/lathill-<part>-<lang>.json   header, footer, home,
                                                        about, coffee, contact
  coffee/elementor/lathill-elementor-<lang>.zip         the six files, for a
                                                        one-step import
The templates use only free Elementor widgets inside Flexbox Containers, so
they work with Elementor and Elementor Pro. See coffee/elementor/README.md.

--media-base is where the videos and images will live on the WordPress site
(default /wp-content/uploads/lathill/): upload coffee/assets/media/* and
coffee/assets/img/* there, or rebuild with your own address.
"""
import argparse
import hashlib
import json
import re
import sys
import zipfile
from pathlib import Path
from urllib.parse import quote

sys.path.insert(0, str(Path(__file__).resolve().parent))
import content as C  # noqa: E402
from content import T  # noqa: E402

SITE = Path(__file__).resolve().parent.parent
OUT = SITE / "elementor"
DEFAULT_MEDIA_BASE = "/wp-content/uploads/lathill/"

# Page addresses on the WordPress site. Polylang (free) needs a different slug
# for each language, so the English pages have their own.
URLS = {
    "zh": {"index": "/", "about": "/about/", "services": "/coffee/", "contact": "/contact/"},
    "en": {"index": "/en/", "about": "/en/about-us/", "services": "/en/our-coffee/", "contact": "/en/contact-us/"},
}
WPFORMS_SHORTCODE = '[wpforms id="123" title="false"]'

ESPRESSO, ESPRESSO_2, ROAST, CREMA = "#2A1A12", "#3D281D", "#7A4A2E", "#D9A86C"
KRAFT, PAPER, CHERRY, CHERRY_DARK = "#E9DBC5", "#F7F0E5", "#9E2B25", "#82211C"
LEAF, MUTED = "#5F6A3E", "#6A5546"
LINE = "rgba(42,26,18,0.14)"
LINE_STRONG = "rgba(42,26,18,0.28)"
ON_DARK = "rgba(247,240,229,0.72)"
CLEAR = "rgba(0,0,0,0)"
FONTS = {
    "zh": {"serif": "Noto Serif SC", "sans": "Noto Sans SC"},
    "en": {"serif": "Noto Serif", "sans": "Noto Sans"},
}
BUTTONS = {  # background, text, hover background, border
    "primary": (CHERRY, "#FFF8F0", CHERRY_DARK, None),
    "light": (PAPER, ESPRESSO, "#FFFFFF", None),
    "ghost": (CLEAR, ESPRESSO, "rgba(42,26,18,0.06)", LINE_STRONG),
    "outline-light": (CLEAR, PAPER, "rgba(247,240,229,0.12)", "rgba(247,240,229,0.55)"),
    "link": (CLEAR, CHERRY, CLEAR, None),
}


def px(v, unit="px"):
    return {"unit": unit, "size": v, "sizes": []}


def box(t, r=None, b=None, l=None, unit="px"):
    r = t if r is None else r
    b = t if b is None else b
    l = r if l is None else l
    return {"unit": unit, "top": str(t), "right": str(r), "bottom": str(b), "left": str(l),
            "isLinked": t == r == b == l}


def gap(v):
    return {"column": str(v), "row": str(v), "isLinked": True, "unit": "px", "size": v}


def link(url, external=False):
    return {"url": url, "is_external": "on" if external else "", "nofollow": "", "custom_attributes": ""}


def wa_url(text):
    return f"https://wa.me/{C.WHATSAPP}?text={quote(text)}"


class Template:
    """Builds one Elementor template in one language."""

    def __init__(self, lang, name, media):
        self.lang, self.name, self.media, self.n = lang, name, media, 0

    # -- basics ------------------------------------------------------------
    def nid(self):
        self.n += 1
        return hashlib.md5(f"lathill-{self.lang}-{self.name}-{self.n}".encode()).hexdigest()[:7]

    def tr(self, x):
        return x[self.lang] if isinstance(x, T) else x

    def url(self, page, anchor=""):
        return URLS[self.lang][page] + anchor

    def fmt(self, tpl, **kw):
        return self.tr(tpl).format(**{k: self.tr(v) for k, v in kw.items()})

    def typo(self, kind, size, weight=None, lh=None, tablet=None, mobile=None, prefix="typography"):
        s = {f"{prefix}_typography": "custom", f"{prefix}_font_family": FONTS[self.lang][kind],
             f"{prefix}_font_size": px(size)}
        if tablet:
            s[f"{prefix}_font_size_tablet"] = px(tablet)
        if mobile:
            s[f"{prefix}_font_size_mobile"] = px(mobile)
        if weight:
            s[f"{prefix}_font_weight"] = str(weight)
        if lh:
            s[f"{prefix}_line_height"] = px(lh, "em")
        return s

    def widget(self, kind, settings):
        return {"id": self.nid(), "elType": "widget", "widgetType": kind, "isInner": False,
                "settings": settings, "elements": []}

    # -- containers --------------------------------------------------------
    def box_(self, children, direction="column", space=16, width=None, width_t=None, width_m=None,
             pad=(0,), pad_m=None, bg=None, radius=None, align=None, justify=None, wrap=False,
             dir_m=None, border=None, css=None, extra=None, inner=True, boxed=False):
        s = {"content_width": "boxed" if boxed else "full", "flex_direction": direction, "flex_gap": gap(space),
             "padding": box(*pad)}
        if boxed:
            s["boxed_width"] = px(1180)
        if width is not None:
            s["width"] = px(width, "%")
            s["width_tablet"] = px(width_t if width_t is not None else width, "%")
            s["width_mobile"] = px(width_m if width_m is not None else 100, "%")
        if pad_m is not None:
            s["padding_mobile"] = box(*pad_m)
        if dir_m:
            s["flex_direction_mobile"] = dir_m
        if bg:
            s.update({"background_background": "classic", "background_color": bg})
        if radius:
            s["border_radius"] = box(radius)
        if align:
            s["flex_align_items"] = align
        if justify:
            s["flex_justify_content"] = justify
        if wrap:
            s["flex_wrap"] = "wrap"
        if border:  # (width, colour[, sides]) e.g. (1, LINE) or (2, CREMA, (2, 0, 0, 0))
            sides = border[2] if len(border) > 2 else (border[0],)
            s.update({"border_border": "solid", "border_width": box(*sides), "border_color": border[1]})
        if css:
            s["css_classes"] = css
        if extra:
            s.update(extra)
        return {"id": self.nid(), "elType": "container", "isInner": inner, "settings": s, "elements": children}

    def section(self, children, bg=KRAFT, pad=(96, 24), pad_m=(64, 16), space=24, css=None, extra=None):
        return self.box_(children, space=space, pad=pad, pad_m=pad_m, bg=bg, inner=False, boxed=True, css=css,
                         extra={"html_tag": "section", **(extra or {})})

    def row(self, children, space=32, align="flex-start", justify=None, wrap=False, dir_m="column", **kw):
        return self.box_(children, direction="row", space=space, align=align, justify=justify, wrap=wrap,
                         dir_m=dir_m, **kw)

    def video_bg(self, name, angle=90):
        """Background settings: a looping video under a dark gradient."""
        return {
            "background_background": "video",
            "background_video_link": f"{self.media}{name}.mp4",
            "background_play_on_mobile": "yes",
            "background_video_fallback": {"url": f"{self.media}{name}.jpg", "id": ""},
            "background_overlay_background": "gradient",
            "background_overlay_color": "rgba(26,15,10,0.86)",
            "background_overlay_color_stop": px(0, "%"),
            "background_overlay_color_b": "rgba(26,15,10,0.18)",
            "background_overlay_color_b_stop": px(100, "%"),
            "background_overlay_gradient_type": "linear",
            "background_overlay_gradient_angle": px(angle, "deg"),
            "background_overlay_gradient_angle_mobile": px(0, "deg"),
        }

    # -- widgets -------------------------------------------------------------
    def heading(self, text, tag="h2", size=40, color=ESPRESSO, weight=None, tablet=None, mobile=None, lh=1.3,
                align=None, url=None, kind="serif", css=None):
        weight = weight or ("900" if tag == "h1" and self.lang == "zh" else "700")
        s = {"title": self.tr(text), "header_size": tag, "title_color": color,
             **self.typo(kind, size, weight, lh, tablet, mobile)}
        if align:
            s["align"] = align
        if url:
            s["link"] = link(url, url.startswith("http"))
        if css:
            s["_css_classes"] = css
        return self.widget("heading", s)

    def text(self, body, size=17, color=MUTED, weight=None, mobile=None, align=None, lh=None, css=None, kind="sans"):
        body = self.tr(body)
        if not body.lstrip().startswith("<"):
            body = f"<p>{body}</p>"
        s = {"editor": body, "text_color": color,
             **self.typo(kind, size, weight, lh or (1.75 if self.lang == "zh" else 1.6), mobile=mobile)}
        if align:
            s["align"] = align
        if css:
            s["_css_classes"] = css
        return self.widget("text-editor", s)

    def button(self, label, url, style="primary", icon=None, size=15, align=None, small=False):
        bg, fg, hover, border = BUTTONS[style]
        pad = (0, 0, 0, 0) if style == "link" else ((10, 18, 10, 18) if small else (14, 26, 14, 26))
        s = {"text": self.tr(label), "link": link(url, url.startswith("http")),
             "button_text_color": fg, "hover_color": CHERRY_DARK if style == "link" else fg,
             "background_background": "classic", "background_color": bg,
             "button_background_hover_background": "classic", "button_background_hover_color": hover,
             "border_radius": box(999), "text_padding": box(*pad),
             **self.typo("sans", size, 500, 1.2)}
        if border:
            s.update({"border_border": "solid", "border_width": box(1), "border_color": border,
                      "button_hover_border_color": fg})
        if icon:
            s.update({"selected_icon": {"value": icon, "library": "fa-brands" if icon.startswith("fab") else "fa-solid"},
                      "icon_align": "left", "icon_indent": px(8)})
        if align:
            s["align"] = align
        return self.widget("button", s)

    def image(self, file, width=None, align="center", alt="", url=None):
        s = {"image": {"url": self.media + file, "id": "", "alt": alt, "source": "library"},
             "image_size": "full", "align": align}
        if width:
            s["width"] = px(width)
        if url:
            s.update({"link_to": "custom", "link": link(url)})
        return self.widget("image", s)

    def video(self, key, radius=28):
        name = C.VIDEOS[key]
        src = f"{self.media}{name}.mp4"
        v = self.widget("video", {
            "video_type": "hosted", "insert_url": "yes", "external_url": link(src),
            "hosted_url": {"url": src, "id": ""}, "autoplay": "yes", "mute": "yes", "loop": "yes",
            "controls": "", "play_on_mobile": "yes", "download_button": "",
            "poster": {"url": f"{self.media}{name}.jpg", "id": ""},
        })
        # The rounded corners come from the container around the video
        return self.box_([v], radius=radius, extra={"overflow": "hidden"}, css="lathill-video")

    def icon_list(self, items, inline=False, size=15, color=MUTED, icon_color=ROAST, space=8, hover=None):
        lst = []
        for item in items:
            label, url, icon = (list(item) + [None, None])[:3]
            lst.append({"text": self.tr(label), "_id": self.nid(),
                        "selected_icon": {"value": icon or "", "library": ("fa-brands" if icon and icon.startswith("fab") else "fa-solid") if icon else ""},
                        "link": link(url, bool(url and url.startswith("http"))) if url else {"url": ""}})
        s = {"view": "inline" if inline else "traditional", "icon_list": lst, "text_color": color,
             "icon_color": icon_color, "icon_size": px(14), "space_between": px(space),
             **self.typo("sans", size, 400, prefix="icon_typography")}
        if hover:
            s["text_color_hover"] = hover
        return self.widget("icon-list", s)

    def html(self, code):
        return self.widget("html", {"html": code})

    def testimonial(self, quote, name, job, size=17, kind="sans", color=PAPER):
        return self.widget("testimonial", {
            "testimonial_content": self.tr(quote), "testimonial_name": name, "testimonial_job": self.tr(job),
            "testimonial_image": {"url": "", "id": ""}, "testimonial_alignment": "left",
            "content_content_color": color, "name_text_color": PAPER, "job_text_color": ON_DARK,
            **self.typo(kind, size, 600 if kind == "serif" else 400, 1.6, prefix="content_typography"),
            **self.typo("sans", 15, 600, prefix="name_typography"),
            **self.typo("sans", 13, 400, prefix="job_typography"),
        })

    def accordion(self, items):
        return self.widget("accordion", {
            "tabs": [{"tab_title": self.tr(q), "tab_content": f"<p>{self.tr(a)}</p>", "_id": self.nid()} for q, a in items],
            "selected_icon": {"value": "fas fa-plus", "library": "fa-solid"},
            "selected_active_icon": {"value": "fas fa-minus", "library": "fa-solid"},
            "border_color": LINE, "title_background": CLEAR, "title_color": ESPRESSO, "tab_active_color": CHERRY,
            "content_background_color": CLEAR, "content_color": MUTED,
            **self.typo("serif", 19, 700, prefix="title_typography"),
            **self.typo("sans", 16, 400, 1.7, prefix="content_typography"),
        })

    def social(self):
        icons = {"instagram": "fab fa-instagram", "facebook": "fab fa-facebook-f", "tiktok": "fab fa-tiktok",
                 "xhs": "fas fa-book-open"}
        return self.widget("social-icons", {
            "social_icon_list": [{"social_icon": {"value": icons[s["key"]], "library": icons[s["key"]].split()[0].replace("fab", "fa-brands").replace("fas", "fa-solid")},
                                  "link": link(s["url"], True), "_id": self.nid()} for s in C.SOCIAL],
            "shape": "circle", "align": "left", "icon_color": "custom",
            "icon_primary_color": ESPRESSO_2, "icon_secondary_color": PAPER,
            "icon_size": px(16), "icon_padding": px(0.7, "em"), "icon_spacing": px(8),
        })

    def shortcode(self, code):
        return self.widget("shortcode", {"shortcode": code})

    def gmap(self, address, zoom=5, height=380):
        return self.widget("google_maps", {"address": address, "zoom": px(zoom), "height": px(height)})

    def spacer(self, h):
        return self.widget("spacer", {"space": px(h)})

    # -- shared blocks --------------------------------------------------------
    def section_head(self, title, intro=None, dark=False, tag="h2"):
        items = [self.heading(title, tag, 40, PAPER if dark else ESPRESSO, tablet=34, mobile=30)]
        if intro:
            items.append(self.text(intro, 20, ON_DARK if dark else MUTED, mobile=18))
        return self.box_(items, space=12, width=62, width_t=90)

    def page_hero(self, hero):
        crumb = f'<p><a href="{self.url("index")}">{self.tr(C.UI["home"])}</a> / {self.tr(hero["crumb"])}</p>'
        copy = self.box_([
            self.text(crumb, 13, MUTED),
            self.heading(hero["title"], "h1", 56, tablet=44, mobile=32, lh=1.25),
            self.text(hero["lead"], 20, MUTED, mobile=18),
        ], space=16, width=55, width_t=100)
        return self.section([
            self.row([copy, self.box_([self.video(hero["video"])], width=45, width_t=100)], space=64, align="center"),
        ], pad=(48, 24, 72, 24), pad_m=(32, 16, 48, 16), extra=self.bottom_line())

    def bottom_line(self):
        return {"border_border": "solid", "border_width": box(0, 0, 1, 0), "border_color": LINE}

    def cta(self, title, text, buttons):
        inner = self.row([
            self.box_([self.heading(title, "h2", 40, "#FFF8F0", tablet=34, mobile=28),
                       self.text(text, 17, "rgba(255,248,240,0.88)")], space=8, width=62, width_t=100),
            self.row(buttons, space=12, align="center", wrap=True, dir_m="row"),
        ], space=32, align="center", justify="space-between", bg=CHERRY, radius=28, pad=(48,), pad_m=(32, 24))
        return self.section([inner], pad=(24, 24, 72, 24), pad_m=(16, 16, 48, 16))

    def product_card(self, p):
        level = C.ROAST_LEVELS[p["roast"]]
        msg = self.fmt(C.WA_MESSAGES["order"], name=p["name"], size=p["size"], price=p["price"])
        price = (f'RM {p["price"]}<span style="font-size:14px;font-weight:400;color:{MUTED}"> / '
                 f'{self.tr(p["size"])}</span>')
        return self.box_([
            self.image(f'bag-{p["key"]}.png', width=180, alt=self.tr(p["name"])),
            self.text(p["origin"], 13, LEAF, weight=500),
            self.heading(p["name"], "h3", 20, lh=1.35),
            self.text(p["notes"], 15, MUTED),
            self.text(f'{self.tr(C.UI["roast"])}{"：" if self.lang == "zh" else ": "}{self.tr(level)}', 13, MUTED),
            self.heading(price, "div", 26, lh=1.2),
            self.button(C.UI["order_wa"], wa_url(msg), "ghost", icon="fab fa-whatsapp", size=14, small=True),
        ], space=8, width=31.5, width_t=48, width_m=100, bg=PAPER, radius=14, border=(1, LINE),
            pad=(28, 24, 24, 24))

    def product_grid(self, products):
        return self.row([self.product_card(p) for p in products], space=24, align="stretch", wrap=True, dir_m="column")

    def roast_widget(self):
        """The interactive roast curve as one self-contained HTML widget."""
        RC = C.ROAST_CURVE
        data = {
            "markers": {k: self.tr(v) for k, v in RC["markers"].items()},
            "turning": {"name": self.tr(RC["turning"]["name"]), "use": self.tr(RC["turning"]["use"]),
                        "notes": [self.tr(n) for n in RC["turning"]["notes"]]},
            "stages": [{"max": s["max"], "name": self.tr(s["name"]), "use": self.tr(s["use"]),
                        "notes": [self.tr(n) for n in s["notes"]]} for s in RC["stages"]],
        }
        start = RC["stages"][4]
        script = (SITE / "js" / "roast-curve.js").read_text(encoding="utf-8")
        serif = FONTS[self.lang]["serif"]
        return self.html(f"""<div class="lh-roast">
<style>
.lh-roast .roast-card{{margin:0;background:#3d281d;color:#f7f0e5;border-radius:28px;padding:32px}}
.lh-roast .roast-card-head{{display:flex;justify-content:space-between;align-items:baseline;gap:16px;margin-bottom:16px;flex-wrap:wrap}}
.lh-roast .roast-card-head h3{{margin:0;font-family:"{serif}",serif;font-size:20px;color:#f7f0e5}}
.lh-roast .roast-card-head span{{font-size:13px;color:rgba(247,240,229,.6)}}
.lh-roast .roast-chart{{position:relative}}
.lh-roast .roast-chart svg{{display:block;width:100%;height:auto;overflow:visible;cursor:ew-resize;touch-action:pan-y}}
.lh-roast .grid line{{stroke:rgba(247,240,229,.08)}}
.lh-roast .axis text{{fill:rgba(247,240,229,.55);font-size:11px}}
.lh-roast .marker line{{stroke:rgba(217,168,108,.55);stroke-dasharray:3 4}}
.lh-roast .marker text{{fill:#d9a86c;font-size:11px}}
.lh-roast .curve{{fill:none;stroke:url(#curveGrad);stroke-width:3;stroke-linecap:round}}
.lh-roast .curve-area{{fill:url(#areaGrad)}}
.lh-roast .cursor-line{{stroke:rgba(247,240,229,.5)}}
.lh-roast .cursor-dot{{stroke:#f7f0e5;stroke-width:3}}
.lh-roast .roast-range{{position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;pointer-events:none}}
.lh-roast .roast-chart:has(.roast-range:focus-visible){{outline:3px solid #d9a86c;outline-offset:6px;border-radius:8px}}
.lh-roast .roast-readout{{display:grid;grid-template-columns:auto 1fr;gap:24px;align-items:center;margin-top:24px;padding-top:24px;border-top:1px solid rgba(247,240,229,.12)}}
.lh-roast .bean-swatch{{width:64px;height:64px}}
.lh-roast .roast-stats{{display:flex;flex-wrap:wrap;gap:4px 24px;margin:0;font-size:15px;color:rgba(247,240,229,.65)}}
.lh-roast .roast-stats b{{color:#f7f0e5;font-weight:500}}
.lh-roast .roast-stage{{margin:0;font-family:"{serif}",serif;font-size:26px;line-height:1.3;color:#f7f0e5}}
.lh-roast .roast-notes{{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 0;padding:0;list-style:none}}
.lh-roast .roast-notes li{{margin:0;font-size:13px;padding:2px 10px;border-radius:999px;background:rgba(217,168,108,.16);color:#d9a86c}}
.lh-roast .roast-hint{{margin:16px 0 0;font-size:13px;color:rgba(247,240,229,.55)}}
@media (max-width:640px){{.lh-roast .roast-card{{padding:20px}}}}
</style>
<figure class="roast-card" id="lh-roast-{self.lang}">
  <div class="roast-card-head"><h3>{self.tr(RC["title"])}</h3><span>{self.tr(RC["axis"])}</span></div>
  <div class="roast-chart" data-roast-chart>
    <svg role="presentation" focusable="false"></svg>
    <label style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)" for="lh-roast-range">{self.tr(RC["range"])}</label>
    <input class="roast-range" id="lh-roast-range" type="range" min="0" max="720" step="5" value="525">
  </div>
  <figcaption class="roast-readout">
    <svg class="bean-swatch" viewBox="0 0 64 64" aria-hidden="true"><g transform="rotate(30 32 32)"><ellipse data-bean cx="32" cy="32" rx="20" ry="27" fill="#74432a"/><path d="M32 7c-8 12 8 38 0 50" stroke="rgba(0,0,0,.35)" stroke-width="3" fill="none" stroke-linecap="round"/></g></svg>
    <div>
      <div class="roast-stats"><span>{self.tr(RC["time"])} <b data-out-time>8:45</b></span><span>{self.tr(RC["temp"])} <b data-out-temp>208°C</b></span></div>
      <p class="roast-stage" data-out-stage>{self.tr(start["name"])}</p>
      <p class="roast-stats" data-out-use>{self.tr(start["use"])}</p>
      <ul class="roast-notes" data-out-notes></ul>
    </div>
  </figcaption>
  <p class="roast-hint">{self.tr(RC["hint"])}</p>
</figure>
<script>
{script}
</script>
<script>
(function () {{
  var card = document.getElementById("lh-roast-{self.lang}");
  if (card && window.LatHillRoastCurve) window.LatHillRoastCurve.init(card.querySelector("[data-roast-chart]"),
    {json.dumps(data, ensure_ascii=False)}, function () {{ return "{self.lang}"; }});
}})();
</script>
</div>""")


# ---------------------------------------------------------------------------
# Templates
# ---------------------------------------------------------------------------
def header(b):
    other = "en" if b.lang == "zh" else "zh"
    nav = [(n["label"], b.url(n["page"])) for n in C.NAV]
    actions = b.row([
        b.icon_list(nav, inline=True, size=15, color=ESPRESSO, space=24, hover=CHERRY),
        b.button("EN" if b.lang == "zh" else "中文", URLS[other]["index"], "ghost", size=13, small=True),
        b.button(C.UI["reserve"], b.url("contact", "#reserve"), "primary", size=14, small=True),
    ], space=20, align="center", justify="flex-end", wrap=True, dir_m="row")
    return [b.box_([
        b.image("logo-dark.png", width=190, align="left", alt=b.tr(C.BRAND["name"]), url=b.url("index")),
        actions,
    ], direction="row", space=16, align="center", justify="space-between", dir_m="column", bg=KRAFT,
        pad=(12, 24), pad_m=(12, 16), inner=False, boxed=True, css="lathill-header",
        extra={"html_tag": "header", **b.bottom_line()})]


def footer(b):
    F = C.FOOTER
    small_title = lambda x: b.heading(x, "h2", 15, PAPER, weight="500", kind="sans")
    nav = [(n["label"], b.url(n["page"])) for n in C.NAV]
    help_items = [
        (f"WhatsApp {C.WHATSAPP_DISPLAY}", wa_url(b.tr(C.WA_MESSAGES["hello"])), "fab fa-whatsapp"),
        (C.EMAIL, f"mailto:{C.EMAIL}", "fas fa-envelope"),
        (F["help_hours"], None, "fas fa-clock"),
    ]
    cols = b.row([
        b.box_([b.image("logo-light.png", width=180, align="left", alt=b.tr(C.BRAND["name"]), url=b.url("index")),
                b.text(F["about"], 15, ON_DARK)], space=16, width=32, width_t=100),
        b.box_([small_title(F["nav_title"]), b.icon_list(nav, size=15, color=ON_DARK, hover=PAPER)], space=12, width=17, width_t=30),
        b.box_([small_title(F["help_title"]), b.icon_list(help_items, size=15, color=ON_DARK, icon_color=CREMA, hover=PAPER)],
               space=12, width=24, width_t=35),
        b.box_([small_title(F["social_title"]), b.social()], space=12, width=17, width_t=30),
    ], space=32, wrap=True)
    bottom = b.row([
        b.text(f"© 2026 {b.tr(F['copyright'])}", 13, "rgba(247,240,229,0.55)"),
        b.text(F["ai_note"], 13, "rgba(247,240,229,0.55)"),
    ], space=16, justify="space-between", wrap=True, pad=(20, 0, 0, 0),
        extra={"border_border": "solid", "border_width": box(1, 0, 0, 0), "border_color": "rgba(247,240,229,0.12)"})
    return [b.section([cols, bottom], bg=ESPRESSO, pad=(72, 24, 24, 24), pad_m=(56, 16, 24, 16), space=48,
                      extra={"html_tag": "footer"})]


def home(b):
    H = C.HOME
    hero, ways, proc, curve, feat, rev, cta = (H[k] for k in ("hero", "two_ways", "process", "curve", "featured", "reviews", "cta"))
    pill = f'<p>● {b.tr(C.UI["roast_days"])}</p>'
    hero_box = b.box_([
        b.text(pill, 15, PAPER),
        b.heading(hero["title"], "h1", 72, PAPER, tablet=56, mobile=36, lh=1.18),
        b.box_([b.text(hero["lead"], 20, "rgba(247,240,229,0.88)", mobile=17)], width=80, width_t=100),
        b.row([b.button(hero["shop"], b.url("services"), "primary"),
               b.button(C.UI["reserve"], b.url("contact", "#reserve"), "outline-light")],
              space=12, align="center", wrap=True, dir_m="row"),
    ], space=20, width=72, width_t=90)
    hero_sec = b.box_([hero_box], justify="flex-end", inner=False, boxed=True, pad=(120, 24, 72, 24),
                      pad_m=(96, 16, 48, 16), css="lathill-hero",
                      extra={"html_tag": "section", "min_height": px(92, "vh"), "min_height_mobile": px(84, "vh"),
                             **b.video_bg(C.VIDEOS["hero"])})

    cards = [b.box_([
        b.video(c["video"]),
        b.heading(c["title"], "h3", 26, tablet=24, mobile=22),
        b.text(c["text"], 17, MUTED),
        b.button(c["link"], b.url("services", "#beans"), "link", size=16),
    ], space=12, width=50, width_t=50) for c in ways["cards"]]
    ways_sec = b.section([b.section_head(ways["title"], ways["intro"]), b.row(cards, space=32)])

    def step(i, s):
        num = b.box_([b.heading(str(i), "div", 20, ROAST, align="center")], bg=KRAFT, radius=999,
                     border=(1, "rgba(122,74,46,0.35)"), align="center", justify="center",
                     extra={"width": px(44), "width_mobile": px(44), "min_height": px(44), "_flex_size": "none"})
        return b.row([num, b.box_([b.heading(s["title"], "h3", 20), b.text(s["text"], 16, MUTED)], space=4)],
                     space=16, dir_m="row")
    proc_sec = b.section([b.row([
        b.box_([b.video(proc["video"])], width=46, width_t=100),
        b.box_([b.heading(proc["title"], "h2", 40, tablet=34, mobile=30)] + [step(i + 1, s) for i, s in enumerate(proc["steps"])],
               space=24, width=54, width_t=100),
    ], space=64, align="center")], bg=PAPER)

    curve_sec = b.section([b.row([
        b.box_([b.heading(curve["title"], "h2", 40, PAPER, tablet=34, mobile=30), b.text(curve["text"], 19, ON_DARK)],
               space=16, width=38, width_t=100),
        b.box_([b.roast_widget()], width=62, width_t=100),
    ], space=64, align="center")], bg=ESPRESSO)

    featured = [p for k in C.FEATURED for p in C.PRODUCTS if p["key"] == k]
    feat_sec = b.section([
        b.row([b.section_head(feat["title"], feat["intro"]),
               b.button(feat["all"], b.url("services", "#beans"), "ghost")],
              align="flex-end", justify="space-between", dir_m="column"),
        b.product_grid(featured),
    ], space=40)

    f = rev["featured"]
    small = [b.box_([b.testimonial(r["quote"], r["name"], r["role"])], bg=ESPRESSO_2, radius=14, pad=(24,))
             for r in rev["more"]]
    rev_sec = b.section([
        b.section_head(rev["title"], rev["intro"], dark=True),
        b.row([b.box_([b.testimonial(f["quote"], f["name"], f["role"], size=28, kind="serif")], width=58, width_t=100),
               b.box_(small, space=24, width=42, width_t=100)], space=48),
    ], bg=ESPRESSO, space=40)

    cta_sec = b.cta(cta["title"], cta["text"], [
        b.button(C.UI["reserve"], b.url("contact", "#reserve"), "light"),
        b.button(cta["wa"], wa_url(b.tr(C.WA_MESSAGES["reserve"])), "outline-light", icon="fab fa-whatsapp"),
    ])
    return [hero_sec, ways_sec, proc_sec, curve_sec, feat_sec, rev_sec, cta_sec]


def about(b):
    A = C.ABOUT
    s, band, team, values, cta = (A[k] for k in ("story", "band", "team", "values", "cta"))
    story_text = b.box_([b.text(s["pull"], 26, ESPRESSO, lh=1.55, mobile=22, kind="serif")] +
                        [b.text(p, 17, ESPRESSO_2) for p in s["paragraphs"]], space=12, width=55, width_t=100)
    timeline = b.box_([b.box_([
        b.heading(i["year"], "div", 20, ROAST),
        b.heading(i["title"], "h3", 20),
        b.text(i["text"], 15, MUTED),
    ], space=2, pad=(0, 0, 8, 24), border=(2, LINE_STRONG, (0, 0, 0, 2))) for i in s["timeline"]], space=24, width=45, width_t=100)
    story_sec = b.section([b.heading(s["title"], "h2", 15, MUTED, kind="sans", weight="500"),
                           b.row([story_text, timeline], space=64)])

    band_sec = b.box_([b.box_([
        b.heading(f"“{b.tr(band['quote'])}”", "div", 40, PAPER, tablet=34, mobile=26, lh=1.5, weight="600"),
        b.text(band["cite"], 15, ON_DARK),
    ], space=16, width=66, width_t=90)], justify="center", inner=False, boxed=True, pad=(96, 24), pad_m=(72, 16),
        extra={"html_tag": "section", "min_height": px(72, "vh"), **b.video_bg(C.VIDEOS[band["video"]])})

    members = [b.box_([
        b.box_([b.heading(m["initial"], "div", 36, PAPER, align="center")], bg=m["color"].upper(), radius=999,
               align="center", justify="center", extra={"width": px(96), "width_mobile": px(96), "min_height": px(96)}),
        b.heading(m["name"], "h3", 20),
        b.text(m["role"], 15, CHERRY, weight=500),
        b.text(m["bio"], 15, MUTED),
    ], space=8, width=23, width_t=48, width_m=100) for m in team["members"]]
    team_sec = b.section([b.section_head(team["title"], team["intro"]), b.row(members, space=32, wrap=True)], bg=PAPER, space=40)

    vals = [b.box_([b.heading(v["title"], "h3", 26, PAPER), b.text(v["text"], 16, ON_DARK)], space=8,
                   width=31.5, width_t=100, pad=(24, 0, 0, 0), border=(2, CREMA, (2, 0, 0, 0))) for v in values["items"]]
    values_sec = b.section([b.section_head(values["title"], values["intro"], dark=True), b.row(vals, space=40)],
                           bg=ESPRESSO, space=40)

    tasting = next(p for p in C.PRODUCTS if p["key"] == "tasting")
    msg = b.fmt(C.WA_MESSAGES["order"], name=tasting["name"], size=tasting["size"], price=tasting["price"])
    cta_sec = b.cta(cta["title"], cta["text"], [
        b.button(cta["order"], wa_url(msg), "light", icon="fab fa-whatsapp"),
        b.button(cta["all"], b.url("services", "#beans"), "outline-light"),
    ])
    return [b.page_hero(A["hero"]), story_sec, band_sec, team_sec, values_sec, cta_sec]


def services(b):
    S = C.SERVICES
    beans, plans, partners, faq = (S[k] for k in ("beans", "plans", "partners", "faq"))
    groups = []
    for cat in C.CATEGORIES:
        items = [p for p in C.PRODUCTS if p["cat"] == cat["key"]]
        groups += [b.heading(cat["label"], "h3", 22, ROAST), b.product_grid(items)]
    beans_sec = b.section([b.section_head(beans["title"], beans["intro"])] + groups, space=24,
                          extra={"_element_id": "beans"})

    def plan(p):
        featured = p.get("featured")
        fg, sub = (ESPRESSO, MUTED) if featured else (PAPER, "rgba(247,240,229,0.65)")
        if p["from"]:
            price = (f'RM {p["price"]}<span style="font-size:15px;font-weight:400"> {b.tr(plans["per_month"])}{b.tr(plans["from"])}</span>'
                     if b.lang == "zh" else
                     f'<span style="font-size:20px">{plans["from"].en}</span> RM {p["price"]}<span style="font-size:15px;font-weight:400">{plans["per_month"].en}</span>')
        else:
            price = f'RM {p["price"]}<span style="font-size:15px;font-weight:400"> {b.tr(plans["per_month"])}</span>'
        url = b.url("contact", "#reserve") if p.get("href") else wa_url(b.fmt(C.WA_MESSAGES["plan"], name=p["name"]))
        items = []
        if featured:
            items.append(b.text(f'<p><span style="display:inline-block;background:{CHERRY};color:#FFF8F0;border-radius:999px;padding:2px 12px">{b.tr(plans["badge"])}</span></p>', 13, "#FFF8F0"))
        items += [
            b.heading(p["name"], "h3", 26, fg),
            b.text(p["desc"], 15, sub),
            b.heading(price, "div", 40, fg, weight="900", lh=1.1),
            b.icon_list([(x, None, "fas fa-check") for x in p["features"]], size=15, color=fg,
                        icon_color=CHERRY if featured else CREMA, space=10),
            b.button(p["button"], url, "primary" if featured else "outline-light"),
        ]
        return b.box_(items, space=12, width=31.5, width_t=100, radius=14, pad=(32,), pad_m=(28, 24),
                      bg=PAPER if featured else None,
                      border=None if featured else (1, "rgba(247,240,229,0.16)"))
    plans_sec = b.section([b.section_head(plans["title"], plans["intro"], dark=True),
                           b.row([plan(p) for p in plans["items"]], space=24, align="stretch")],
                          bg=ESPRESSO, space=40, extra={"_element_id": "plans"})

    head = partners["head"]
    rows = [b.row([
        b.box_([b.heading(r["title"], "h3", 20), b.text(r["text"], 15, MUTED)], space=4, width=58, width_t=58),
        b.text(f'{b.tr(head[1])}{"：" if b.lang == "zh" else ": "}{b.tr(r["min"])}', 15, ESPRESSO),
        b.heading(r["price"], "div", 20, align="right"),
    ], space=24, align="flex-start", justify="space-between", pad=(20, 0),
        extra={"border_border": "solid", "border_width": box(0, 0, 1, 0), "border_color": LINE}) for r in partners["rows"]]
    partners_sec = b.section([b.section_head(partners["title"], partners["intro"])] + rows +
                             [b.box_([b.button(partners["cta"], b.url("contact", "#reserve"), "primary")],
                                     pad=(16, 0, 0, 0), align="flex-start")], space=0)

    faq_sec = b.section([b.section_head(faq["title"]), b.box_([b.accordion([(q["q"], q["a"]) for q in faq["items"]])],
                                                              width=72, width_t=100)], bg=PAPER, space=32)
    return [b.page_hero(S["hero"]), beans_sec, plans_sec, partners_sec, faq_sec]


def contact(b):
    K = C.CONTACT
    form, wa, hours, sched, deliv = (K[k] for k in ("form", "whatsapp", "hours", "schedule", "delivery"))
    sep = "：" if b.lang == "zh" else ": "
    table = lambda rows: ('<table class="lathill-rows"><tbody>' + "".join(
        f'<tr><th style="text-align:left;font-weight:500">{a}</th><td style="text-align:right">{c}</td></tr>' for a, c in rows)
        + "</tbody></table>")

    form_card = b.box_([
        b.heading(form["title"], "h2", 36, tablet=32, mobile=28),
        b.text(form["required"], 15, MUTED),
        b.shortcode(WPFORMS_SHORTCODE),
    ], space=16, width=58, width_t=100, bg=PAPER, radius=28, border=(1, LINE), pad=(48, 40), pad_m=(28, 20),
        extra={"_element_id": "reserve"})

    wa_card = b.box_([
        b.heading(wa["title"], "h2", 26, PAPER),
        b.text(wa["text"], 16, ON_DARK),
        b.heading(C.WHATSAPP_DISPLAY, "div", 34, PAPER, url=wa_url(b.tr(C.WA_MESSAGES["hello"]))),
        b.button(wa["button"], wa_url(b.tr(C.WA_MESSAGES["hello"])), "light", icon="fab fa-whatsapp"),
        b.text(f'{b.tr(wa["email_label"])}{sep}<a href="mailto:{C.EMAIL}" style="color:{PAPER}">{C.EMAIL}</a>', 14, ON_DARK),
    ], space=12, bg=ESPRESSO, radius=14, pad=(32,), pad_m=(28, 24))
    hour_rows = [(b.tr(r["label"]), f'{r["open"]} – {r["close"]}' if r["open"] else b.tr(hours["closed"])) for r in hours["rows"]]
    hours_card = b.box_([b.heading(hours["title"], "h2", 26), b.text(table(hour_rows), 16, ESPRESSO, css="lathill-table"),
                         b.text(hours["note"], 14, MUTED)], space=12, bg=PAPER, radius=14, border=(1, LINE), pad=(32,), pad_m=(28, 24))
    sched_card = b.box_([b.heading(sched["title"], "h2", 26),
                         b.text(table([(b.tr(k), b.tr(v)) for k, v in sched["rows"]]), 16, ESPRESSO, css="lathill-table")],
                        space=12, bg=PAPER, radius=14, border=(1, LINE), pad=(32,), pad_m=(28, 24))
    main_sec = b.section([b.row([form_card, b.box_([wa_card, hours_card, sched_card], space=24, width=42, width_t=100)],
                                space=40)])

    dhead = "".join(f'<th style="text-align:left;font-weight:500;color:{MUTED}">{b.tr(h)}</th>' for h in deliv["head"])
    drows = "".join(f'<tr><th style="text-align:left">{b.tr(r[0])}</th><td>{b.tr(r[1])}</td><td>{b.tr(r[2])}</td></tr>'
                    for r in deliv["rows"])
    deliv_sec = b.section([b.row([
        b.box_([b.heading(deliv["title"], "h2", 40, tablet=34, mobile=30),
                b.text(f'<table class="lathill-rows"><thead><tr>{dhead}</tr></thead><tbody>{drows}</tbody></table>', 16,
                       ESPRESSO, css="lathill-table"),
                b.text(deliv["note"], 15, MUTED)], space=16, width=50, width_t=100),
        b.box_([b.box_([b.gmap("Malaysia", 5, 380)], radius=28, extra={"overflow": "hidden"}),
                b.text(deliv["map_caption"], 14, MUTED)], space=12, width=50, width_t=100),
    ], space=48)], bg=PAPER)
    return [b.page_hero(K["hero"]), main_sec, deliv_sec]


PARTS = [  # file part, builder, Elementor template type, title
    ("header", header, "section", T("叻山 页首", "Lat Hill Header")),
    ("footer", footer, "section", T("叻山 页尾", "Lat Hill Footer")),
    ("home", home, "page", T("叻山 首页", "Lat Hill Home")),
    ("about", about, "page", T("叻山 关于我们", "Lat Hill About")),
    ("coffee", services, "page", T("叻山 咖啡豆与服务", "Lat Hill Coffee & Services")),
    ("contact", contact, "page", T("叻山 联系我们", "Lat Hill Contact")),
]


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--media-base", default=DEFAULT_MEDIA_BASE,
                    help="address of the folder holding the videos and images on the WordPress site")
    ap.add_argument("--out", default=str(OUT), help="output folder (default coffee/elementor)")
    args = ap.parse_args()
    media = args.media_base if args.media_base.endswith("/") else args.media_base + "/"
    out = Path(args.out).resolve()
    for lang in ("zh", "en"):
        folder = out / lang
        folder.mkdir(parents=True, exist_ok=True)
        files = []
        for part, build, kind, title in PARTS:
            b = Template(lang, part, media)
            doc = {"content": build(b), "page_settings": {"hide_title": "yes"} if kind == "page" else [],
                   "version": "0.4", "title": b.tr(title), "type": kind}
            path = folder / f"lathill-{part}-{lang}.json"
            path.write_text(json.dumps(doc, ensure_ascii=False, indent=1), encoding="utf-8")
            files.append(path)
            print(f"wrote {path} ({b.n} elements)")
        bundle = out / f"lathill-elementor-{lang}.zip"
        with zipfile.ZipFile(bundle, "w", zipfile.ZIP_DEFLATED) as z:
            for path in files:
                z.write(path, path.name)
        print(f"wrote {bundle}")


if __name__ == "__main__":
    main()
