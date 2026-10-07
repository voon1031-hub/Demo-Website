"""All copy for the Lat Hill Coffee site, in Chinese (zh) and English (en).

Two scripts read this file:
  build_site.py      -> coffee/index.html, about.html, services.html, contact.html
  build_elementor.py -> coffee/elementor/*.json (WordPress + Elementor templates)

Edit the text here, then rebuild both:
  python3 coffee/tools/build_site.py && python3 coffee/tools/build_elementor.py

Strings may contain simple inline HTML (<br>, <code>, <a>).
Names, quotes, figures and testimonials are sample content: replace them
with the real ones before the site goes live.
"""


class T:
    """One piece of text in both languages."""

    __slots__ = ("zh", "en")

    def __init__(self, zh, en):
        self.zh, self.en = zh, en

    def __getitem__(self, lang):
        return self.zh if lang == "zh" else self.en


# ---------------------------------------------------------------------------
# Business details (placeholders: change these first)
# ---------------------------------------------------------------------------
WHATSAPP = "60123456789"              # digits only, for wa.me links
WHATSAPP_DISPLAY = "+60 12-345 6789"
EMAIL = "hello@lathill.coffee"
ROAST_DAYS = (2, 5)                   # Tuesday and Friday (0 = Sunday)
TIMEZONE = "Asia/Kuala_Lumpur"

BRAND = {
    "name": T("叻山咖啡", "Lat Hill Coffee"),
    "mark": "叻山",
    "latin": "Lat Hill",
    "tagline": "Coffee Roasters",
}

SOCIAL = [
    {"key": "instagram", "label": "Instagram", "url": "#", "handle": "@lathill.coffee"},
    {"key": "facebook", "label": "Facebook", "url": "#", "handle": "Lat Hill Coffee"},
    {"key": "tiktok", "label": "TikTok", "url": "#", "handle": "@lathill.coffee"},
    {"key": "xhs", "label": T("小红书", "Xiaohongshu"), "url": "#", "handle": "叻山咖啡"},
]

# Videos (made by tools/fetch-media.sh from coffee/tools/media.txt)
VIDEOS = {
    "hero": "hero-hills",       # 16:9 full-screen loop (+ hero-hills-sm.mp4 for phones)
    "harvest": "clip-harvest",  # square loops
    "roast": "clip-roast",
    "phin": "clip-phin",
    "pourover": "clip-pourover",
}

# ---------------------------------------------------------------------------
# Shared interface text
# ---------------------------------------------------------------------------
UI = {
    "skip": T("跳到正文", "Skip to content"),
    "home_label": T("叻山咖啡首页", "Lat Hill Coffee home"),
    "menu_open": T("打开菜单", "Open menu"),
    "menu_close": T("关闭菜单", "Close menu"),
    "lang_group": T("语言", "Language"),
    "lang_zh": T("切换到中文", "Switch to Chinese"),
    "lang_en": T("切换到英文", "Switch to English"),
    "reserve": T("预约下一炉", "Reserve next roast"),
    "order_wa": T("WhatsApp 下单", "Order on WhatsApp"),
    "roast": T("烘焙度", "Roast"),
    "video_pause": T("暂停视频", "Pause video"),
    "video_play": T("播放视频", "Play video"),
    "breadcrumb": T("面包屑导航", "Breadcrumb"),
    "home": T("首页", "Home"),
    "next_roast": T("下一炉：{date}", "Next roast: {date}"),
    "roast_days": T("每周二、周五新鲜烘焙", "Roasted fresh every Tuesday and Friday"),
}

NAV = [
    {"page": "index", "href": "index.html", "label": T("首页", "Home")},
    {"page": "about", "href": "about.html", "label": T("关于我们", "About")},
    {"page": "services", "href": "services.html", "label": T("咖啡豆与服务", "Coffee & services")},
    {"page": "contact", "href": "contact.html", "label": T("联系我们", "Contact")},
]
RESERVE_HREF = "contact.html?type=reserve#reserve"

WA_MESSAGES = {
    "hello": T("你好叻山，我想咨询：", "Hi Lat Hill, I have a question: "),
    "reserve": T("你好叻山，我想预约下一炉的咖啡豆。", "Hi Lat Hill, I'd like to reserve coffee from your next roast."),
    "order": T("你好叻山，我想订购：{name}（{size}，RM {price}）", "Hi Lat Hill, I'd like to order: {name} ({size}, RM {price})"),
    "plan": T("你好叻山，我想订阅「{name}」方案。", "Hi Lat Hill, I'd like the {name} subscription."),
}

FOOTER = {
    "about": T(
        "叻山咖啡直接向越南大叻的小农采购生豆，在马来西亚巴生谷小批量烘焙。只做网店，全马配送。",
        "Lat Hill buys green coffee directly from smallholder farms around Da Lat, Vietnam, "
        "and roasts it in small batches in Malaysia's Klang Valley. Online only, delivering nationwide.",
    ),
    "nav_title": T("网站导航", "Explore"),
    "help_title": T("订购与客服", "Orders & help"),
    "help_hours": T("客服：周一至周五 9:00–18:00", "Customer care: Mon–Fri, 9 am–6 pm"),
    "social_title": T("关注我们", "Follow us"),
    "copyright": T("叻山咖啡 Lat Hill Coffee Roasters。保留所有权利。", "Lat Hill Coffee Roasters. All rights reserved."),
    "privacy": T("隐私政策", "Privacy policy"),
    "shipping": T("配送与退换", "Shipping & returns"),
    "ai_note": T("页面中的视频由 AI 生成，仅作示意。", "Videos on this site are AI-generated placeholders."),
}

# ---------------------------------------------------------------------------
# Coffee
# ---------------------------------------------------------------------------
ROAST_LEVELS = {
    1: T("浅", "Light"),
    2: T("中浅", "Light-medium"),
    3: T("中", "Medium"),
    4: T("中深", "Medium-dark"),
    5: T("深", "Dark"),
}

CATEGORIES = [
    {"key": "specialty", "label": T("精品单品", "Single origins")},
    {"key": "espresso", "label": T("意式拼配", "Espresso blends")},
    {"key": "traditional", "label": T("越南传统", "Traditional Vietnamese")},
]

# label: the two lines printed on the bag illustration; color: bag label colour
PRODUCTS = [
    {
        "key": "caudat", "cat": "specialty", "roast": 1, "price": 48, "size": T("200g", "200 g"),
        "name": T("Cầu Đất 水洗波旁", "Cầu Đất Washed Bourbon"),
        "origin": T("越南林同省 Cầu Đất，海拔 1,650 米", "Cầu Đất, Lâm Đồng, 1,650 m"),
        "notes": T("柑橘、蜂蜜、茉莉花，干净清爽。", "Citrus, honey and jasmine. Clean and bright."),
        "tag": T("手冲", "Pour-over"),
        "label": ("Cầu Đất", "Washed · 200g"), "color": "#a8743f",
    },
    {
        "key": "langbiang", "cat": "specialty", "roast": 2, "price": 52, "size": T("200g", "200 g"),
        "name": T("朗边山 蜜处理", "Langbiang Honey"),
        "origin": T("越南林同省 Lạc Dương，海拔 1,500 米", "Lạc Dương, Lâm Đồng, 1,500 m"),
        "notes": T("黄桃、红糖、乌龙茶，甜感饱满。", "Yellow peach, brown sugar and oolong. Round and sweet."),
        "tag": T("手冲", "Pour-over"),
        "label": ("Langbiang", "Honey · 200g"), "color": "#9c4a2f",
    },
    {
        "key": "sonla", "cat": "specialty", "roast": 2, "price": 46, "size": T("200g", "200 g"),
        "name": T("山罗 日晒", "Sơn La Natural"),
        "origin": T("越南西北山罗省，海拔 1,200 米", "Sơn La, northwest Vietnam, 1,200 m"),
        "notes": T("草莓、酒酿、可可，发酵感温和。", "Strawberry, rice wine and cocoa. Gently funky."),
        "tag": T("手冲", "Pour-over"),
        "label": ("Sơn La", "Natural · 200g"), "color": "#8b3b3b",
    },
    {
        "key": "robusta", "cat": "specialty", "roast": 3, "price": 38, "size": T("200g", "200 g"),
        "name": T("精品罗布斯塔 日晒", "Fine Robusta Natural"),
        "origin": T("越南多乐省 Buôn Ma Thuột，海拔 600 米", "Buôn Ma Thuột, Đắk Lắk, 600 m"),
        "notes": T("黑巧克力、烤花生、黑糖，醇厚低酸。", "Dark chocolate, roasted peanut and molasses. Heavy body, low acidity."),
        "tag": T("手冲 / 意式", "Filter / espresso"),
        "label": ("Fine Robusta", "Natural · 200g"), "color": "#5d4632",
    },
    {
        "key": "tasting", "cat": "specialty", "roast": 2, "price": 39, "size": T("4 × 50g", "4 × 50 g"),
        "name": T("单品试饮装", "Tasting box"),
        "origin": T("四款当季单品", "Four current single origins"),
        "notes": T("Cầu Đất、朗边山、山罗、精品罗布斯塔各 50g，附冲煮卡。", "50 g each of Cầu Đất, Langbiang, Sơn La and Fine Robusta, with brew cards."),
        "tag": T("包邮", "Free shipping"),
        "label": ("Tasting Box", "4 × 50g"), "color": "#6b6f48",
    },
    {
        "key": "house", "cat": "espresso", "roast": 4, "price": 45, "size": T("250g", "250 g"),
        "name": T("叻山拼配", "Lat Hill House Blend"),
        "origin": T("Cầu Đất 阿拉比卡 70% + 精品罗布斯塔 30%", "70% Cầu Đất arabica, 30% fine robusta"),
        "notes": T("黑巧克力、焦糖、榛果，油脂丰厚，做拿铁很稳。", "Dark chocolate, caramel and hazelnut. Thick crema, great with milk."),
        "tag": T("意式", "Espresso"),
        "label": ("House Blend", "Espresso · 250g"), "color": "#3d281d",
    },
    {
        "key": "dawn", "cat": "espresso", "roast": 3, "price": 42, "size": T("250g", "250 g"),
        "name": T("清晨拼配", "Dawn Blend"),
        "origin": T("Cầu Đất 水洗 + 山罗 日晒", "Cầu Đất washed + Sơn La natural"),
        "notes": T("橙皮、牛奶巧克力、蔗糖，适合美式和浓缩。", "Orange peel, milk chocolate and cane sugar. For long blacks and espresso."),
        "tag": T("意式", "Espresso"),
        "label": ("Dawn Blend", "Espresso · 250g"), "color": "#7a4a2e",
    },
    {
        "key": "phin", "cat": "traditional", "roast": 5, "price": 32, "size": T("250g", "250 g"),
        "name": T("经典滴滤咖啡粉", "Phin Classic, ground"),
        "origin": T("罗布斯塔 + 阿拉比卡，Phin 专用研磨", "Robusta + arabica, ground for phin"),
        "notes": T("浓郁、苦甜、焦糖，加炼奶加冰最对味。", "Bold, bittersweet and caramel. Made for condensed milk and ice."),
        "tag": T("Phin 滴滤", "Phin"),
        "label": ("Phin Classic", "Ground · 250g"), "color": "#2a1a12",
    },
    {
        "key": "phinkit", "cat": "traditional", "roast": 5, "price": 69, "size": T("套装", "kit"),
        "name": T("Phin 入门套装", "Phin starter kit"),
        "origin": T("不锈钢 Phin 滴滤壶 + 250g 经典咖啡粉", "Stainless-steel phin + 250 g Phin Classic"),
        "notes": T("附图解冲煮卡，十分钟做出一杯越南冰咖啡。", "With an illustrated brew card. Iced Vietnamese coffee in ten minutes."),
        "tag": T("送礼推荐", "Good gift"),
        "label": ("Phin Kit", "Filter + 250g"), "color": "#9e2b25",
    },
    {
        "key": "dripbags", "cat": "traditional", "roast": 4, "price": 35, "size": T("10 包", "10 bags"),
        "name": T("越南滴滤挂耳 10 入", "Drip bags, 10 pack"),
        "origin": T("办公室与出差", "For the office and travel"),
        "notes": T("叻山拼配与经典滴滤各 5 包，热水一冲就好。", "Five House Blend and five Phin Classic. Just add hot water."),
        "tag": T("便携", "On the go"),
        "label": ("Drip Bags", "10 × 12g"), "color": "#4a5a66",
    },
]
FEATURED = ("caudat", "house", "phinkit")

# Roast curve (home page): stages by bean temperature, after the turning point
ROAST_CURVE = {
    "title": T("Cầu Đất 水洗波旁的烘焙曲线", "Roast profile: Cầu Đất Washed Bourbon"),
    "axis": T("豆温 / 时间", "Bean temp / time"),
    "time": T("时间", "Time"),
    "temp": T("豆温", "Bean temp"),
    "range": T("烘焙时间", "Roast time"),
    "hint": T("在曲线上拖动，或用方向键调整。", "Drag along the curve, or use the arrow keys."),
    "markers": {"yellow": T("转黄", "Yellowing"), "first": T("一爆", "1st crack"), "second": T("二爆", "2nd crack")},
    "turning": {"name": T("入豆回温", "Charge"), "use": T("生豆刚进锅，正在吸热", "Green beans just dropped in, soaking up heat"),
                "notes": [T("还没有香气", "No aroma yet")]},
    "stages": [
        {"max": 150, "name": T("脱水期", "Drying"), "use": T("豆子还在失去水分", "Moisture is still leaving the bean"),
         "notes": [T("青草", "Grass"), T("谷物", "Grain")]},
        {"max": 175, "name": T("梅纳反应", "Maillard"), "use": T("颜色转黄，香气开始出现", "Beans turn yellow and aromas appear"),
         "notes": [T("烤面包", "Toast"), T("坚果壳", "Nut skin")]},
        {"max": 196, "name": T("一爆前", "Before first crack"), "use": T("糖分焦化，等待第一次爆裂", "Sugars caramelise before first crack"),
         "notes": [T("焦糖初现", "Early caramel"), T("麦芽", "Malt")]},
        {"max": 205, "name": T("浅烘焙", "Light roast"), "use": T("适合手冲，保留产地风味", "Best for pour-over, keeps the origin character"),
         "notes": [T("柑橘", "Citrus"), T("茉莉", "Jasmine"), T("蜂蜜", "Honey")]},
        {"max": 214, "name": T("中浅烘焙", "Light-medium roast"), "use": T("叻山手冲豆的标准曲线", "Our standard pour-over profile"),
         "notes": [T("黄桃", "Yellow peach"), T("焦糖", "Caramel"), T("乌龙茶", "Oolong")]},
        {"max": 224, "name": T("中深烘焙", "Medium-dark roast"), "use": T("适合意式浓缩与奶咖", "For espresso and milk drinks"),
         "notes": [T("黑巧克力", "Dark chocolate"), T("坚果", "Nuts"), T("红糖", "Brown sugar")]},
        {"max": 999, "name": T("深烘焙", "Dark roast"), "use": T("越南滴滤的经典烘焙度", "The classic roast for phin coffee"),
         "notes": [T("烟熏", "Smoky"), T("苦甜", "Bittersweet"), T("厚重", "Heavy body")]},
    ],
}

# ---------------------------------------------------------------------------
# Pages
# ---------------------------------------------------------------------------
HOME = {
    "title": T("叻山咖啡 Lat Hill｜越南大叻咖啡豆，马来西亚新鲜烘焙",
               "Lat Hill Coffee | Vietnamese coffee from Da Lat, roasted fresh in Malaysia"),
    "description": T(
        "叻山咖啡直接向越南大叻小农采购生豆，每周二、周五在巴生谷新鲜烘焙，48 小时内寄出。"
        "精品手冲、意式拼配与越南传统滴滤咖啡，WhatsApp 下单，全马配送。",
        "Lat Hill buys green coffee direct from smallholder farms around Da Lat, Vietnam, roasts it every "
        "Tuesday and Friday in the Klang Valley and ships within 48 hours. Order single origins, espresso "
        "blends and traditional phin coffee on WhatsApp, delivered across Malaysia.",
    ),
    "hero": {
        "title": T("大叻山上的咖啡豆，<br>在马来西亚新鲜烘焙", "Coffee from the hills of Da Lat,<br>roasted fresh in Malaysia"),
        "lead": T(
            "我们直接向越南大叻的小农采购生豆，每周二、周五在巴生谷小批量烘焙，烘好 48 小时内寄出。"
            "精品手冲、意式拼配，还有一杯地道的越南滴滤咖啡。",
            "We buy green coffee straight from smallholder farms around Da Lat, roast it in small batches in "
            "the Klang Valley every Tuesday and Friday, and ship it within 48 hours. Single origins for "
            "pour-over, blends for espresso, and proper Vietnamese phin coffee.",
        ),
        "shop": T("选购咖啡豆", "Shop coffee"),
    },
    "two_ways": {
        "title": T("一座山，两种喝法", "One hill, two ways to drink it"),
        "intro": T(
            "同一片产区，我们烘两条线：保留花果香的精品手冲，和浓、甜、够劲的越南传统滴滤。",
            "From the same hills we roast two lines: bright single origins for pour-over, and the bold, "
            "sweet phin coffee Vietnam is famous for.",
        ),
        "cards": [
            {"video": "pourover", "title": T("精品手冲", "Specialty pour-over"),
             "text": T("Cầu Đất 和朗边山的阿拉比卡，浅到中度烘焙，喝得到柑橘、蜂蜜和花香。",
                       "Arabica from Cầu Đất and Langbiang, roasted light to medium for citrus, honey and floral notes."),
             "link": T("看精品单品", "Browse single origins"), "href": "services.html?filter=specialty#beans"},
            {"video": "phin", "title": T("越南传统滴滤", "Traditional phin"),
             "text": T("罗布斯塔与阿拉比卡拼配，深度烘焙。加炼奶、加冰，就是一杯 Cà phê sữa đá。",
                       "A robusta and arabica blend, roasted dark. Add condensed milk and ice and you have cà phê sữa đá."),
             "link": T("看传统系列", "Browse traditional coffee"), "href": "services.html?filter=traditional#beans"},
        ],
    },
    "process": {
        "video": "roast",
        "title": T("从大叻山上，到你的杯子", "From the hills of Da Lat to your cup"),
        "steps": [
            {"title": T("小农手摘", "Hand-picked by smallholders"),
             "text": T("合作的 9 户小农只采红透的咖啡果。每年收获季，我们都会上山和农户一起杯测选豆。",
                       "Our nine partner farms pick only ripe red cherries. Every harvest we go up the hills to cup with them and choose the lots.")},
            {"title": T("生豆直接进口", "Imported direct"),
             "text": T("不经中间商，直接向农户和处理厂买生豆，收购价比当地市场价高 25% 以上。",
                       "We buy green coffee straight from farms and their washing stations, paying at least 25% above local market price.")},
            {"title": T("每周两炉，小批量烘焙", "Roasted twice a week"),
             "text": T("每周二、周五在巴生谷的工坊烘焙，每炉不超过 5 公斤，每支豆子都有自己的曲线。",
                       "Every Tuesday and Friday at our Klang Valley roastery, no more than 5 kg a batch, each coffee on its own profile.")},
            {"title": T("48 小时内寄出", "Shipped within 48 hours"),
             "text": T("烘好隔天出货，西马 1–3 个工作日送达，包装上印着烘焙日期。",
                       "Bags leave the day after roasting and reach West Malaysia in 1–3 working days, with the roast date printed on each one.")},
        ],
    },
    "curve": {
        "title": T("拖动曲线，找到你的那一杯", "Drag the curve to find your cup"),
        "text": T(
            "同一支豆子，停在不同的时间点，味道完全不同。这是我们为 Cầu Đất 水洗波旁写的烘焙曲线，拖动看看豆子在每一刻的颜色和风味。",
            "The same bean tastes completely different depending on when the roast stops. This is our profile "
            "for the Cầu Đất Washed Bourbon: drag along it to see the colour and flavour at each moment.",
        ),
    },
    "featured": {
        "title": T("本周推荐", "This week's picks"),
        "intro": T("每周一更新。点“WhatsApp 下单”，咖啡的名字会自动带进对话。",
                   "Updated every Monday. Tap “Order on WhatsApp” and the coffee's name is filled in for you."),
        "all": T("查看全部咖啡豆", "See all coffee"),
    },
    "reviews": {
        "title": T("喝过的人怎么说", "What our customers say"),
        "intro": T("来自订阅用户和回头客。", "From our subscribers and regulars."),
        "featured": {
            "quote": T("在家接案三年，早上那杯手冲是我唯一的通勤。叻山每包豆子都附冲煮参数，照着冲几乎不会失手。",
                       "I've freelanced from home for three years, and the morning pour-over is my only commute. Every Lat Hill bag comes with a brew recipe, so it's hard to get wrong."),
            "name": "Nurul Huda", "initial": "N",
            "role": T("自由插画师，订阅 14 个月", "Freelance illustrator, subscriber for 14 months"),
        },
        "more": [
            {"quote": T("办公室换成叻山拼配之后，下午再也没人出去买咖啡了。WhatsApp 下单也很方便。",
                        "Since our office switched to the House Blend, nobody walks out for afternoon coffee anymore. Ordering on WhatsApp is easy, too."),
             "name": "Daniel Tan", "initial": "D", "role": T("设计工作室合伙人，八打灵再也", "Design studio partner, Petaling Jaya")},
            {"quote": T("第一次喝到不苦的越南咖啡，Cầu Đất 的果酸很干净。Phin 套装拿来送朋友也很受欢迎。",
                        "The first Vietnamese coffee I've had that isn't bitter. The Cầu Đất is clean and fruity, and the phin kit makes a great gift."),
             "name": "Priya Menon", "initial": "P", "role": T("软件工程师，槟城", "Software engineer, Penang")},
        ],
    },
    "cta": {
        "title": T("每周二、周五烘焙，现在预约下一炉", "We roast every Tuesday and Friday. Reserve a bag from the next batch."),
        "title_next": T("下一炉：{date}<br>现在预约你的那一包", "Next roast: {date}.<br>Reserve your bag now."),
        "text": T("前一天 23:59 前预约，就能排进那一炉；烘好隔天寄出，西马 1–3 个工作日送达。",
                  "Reserve by 11:59 pm the day before to make the batch. It ships the next day and reaches West Malaysia in 1–3 working days."),
        "wa": T("WhatsApp 我们", "Chat on WhatsApp"),
    },
}

ABOUT = {
    "title": T("关于我们｜叻山咖啡 Lat Hill", "About us | Lat Hill Coffee"),
    "description": T("叻山咖啡的品牌故事、团队与理念：从越南大叻山上的一杯咖啡，到马来西亚巴生谷的小烘焙坊。",
                     "The story, team and values behind Lat Hill: from a cup of coffee on a hill in Da Lat to a small roastery in Malaysia's Klang Valley."),
    "hero": {
        "crumb": T("关于我们", "About us"),
        "title": T("一座越南的山，和一间马来西亚的烘焙坊", "A hill in Vietnam and a roastery in Malaysia"),
        "lead": T("叻山的名字来自越南咖啡产区大叻（Đà Lạt）。“叻”在马来西亚的广东话里也是“厉害、好”的意思，我们希望每一包豆子都配得上这个字。",
                  "Our name comes from Đà Lạt, the coffee highland in Vietnam. In Malaysian Cantonese, “lat” (叻) also means clever, or really good. We try to make every bag live up to it."),
        "video": "harvest",
    },
    "story": {
        "title": T("品牌故事", "Our story"),
        "pull": T("我们想让更多人知道，越南咖啡不只有又苦又浓。", "We want more people to know Vietnamese coffee can be more than bitter and strong."),
        "paragraphs": [
            T("2018 年，创始人 Jay 在越南大叻背包旅行，在山上一个小咖啡园喝到一杯刚烘好的阿拉比卡：干净，带着柑橘和蜂蜜的甜，完全不像印象中的越南咖啡。",
              "In 2018 our founder, Jay, was backpacking through Da Lat and stopped at a small hillside farm. The freshly roasted arabica was clean and sweet, with citrus and honey: nothing like the Vietnamese coffee Jay knew."),
            T("回到吉隆坡后，Jay 开始向那几户小农买生豆，在自家后院用一台 1 公斤的烘豆机试烘，送给朋友喝。后来朋友的朋友也开始下单，后院很快就不够用了。",
              "Back in Kuala Lumpur, Jay started buying green coffee from those same farmers and roasting it on a 1 kg roaster in the backyard for friends. Then friends of friends started ordering, and the backyard got crowded."),
            T("2022 年，叻山正式成立，在巴生谷租下一间小工坊。我们没有开门市，所有咖啡都按订单烘焙，直接寄到你家或办公室。",
              "Lat Hill launched in 2022 from a small roastery in the Klang Valley. We don't run a café: every bag is roasted to order and sent straight to your home or office."),
        ],
        "timeline_title": T("我们的历程", "How we got here"),
        "timeline": [
            {"year": "2018", "title": T("大叻山上的一杯咖啡", "A cup on a hill in Da Lat"),
             "text": T("在小农的咖啡园第一次喝到越南精品阿拉比卡。", "A first taste of Vietnamese specialty arabica, at a smallholder farm.")},
            {"year": "2019", "title": T("后院的 1 公斤烘豆机", "A 1 kg roaster in the backyard"),
             "text": T("每周烘几炉，只卖给朋友。", "A few batches a week, for friends only.")},
            {"year": "2021", "title": T("和三户 Cầu Đất 小农直接合作", "Direct trade with three Cầu Đất farms"),
             "text": T("开始按我们的标准采摘和处理。", "They began picking and processing to our spec.")},
            {"year": "2022", "title": T("叻山上线", "Lat Hill goes online"),
             "text": T("巴生谷工坊每周烘两炉，全马配送。", "Two roasts a week from the Klang Valley, delivered nationwide.")},
            {"year": "2026", "title": T("1,500 位订阅用户", "1,500 subscribers"),
             "text": T("合作小农增加到 9 户，新增越南传统系列。", "Nine partner farms, and a new traditional Vietnamese line.")},
        ],
    },
    "band": {
        "video": "hero",
        "quote": T("每年收获季，我们都会回到大叻的山上，和农户一起杯测，挑出这一年最好的批次。",
                   "Every harvest we go back up the hills of Da Lat to cup with our farmers and choose the year's best lots."),
        "cite": T("Jay Lim，创始人", "Jay Lim, founder"),
    },
    "team": {
        "title": T("团队", "The team"),
        "intro": T("人不多，每个环节都有专人负责。你在 WhatsApp 上聊天的，就是我们其中一位。",
                   "We're a small team, and each of us looks after one part of the chain. Whoever answers your WhatsApp message is one of us."),
        "members": [
            {"name": "Jay Lim", "initial": "J", "color": "#7a4a2e",
             "role": T("创始人 / 烘焙师", "Founder & roaster"),
             "bio": T("SCA 认证烘焙师，负责每一支豆子的打样和曲线。最爱 Cầu Đất 的柑橘酸。",
                      "SCA-certified roaster who profiles every coffee. Has a soft spot for the citrus in Cầu Đất.")},
            {"name": "Mai Nguyễn", "initial": "M", "color": "#6b6f48",
             "role": T("越南产地联络", "Origin partner, Đà Lạt"),
             "bio": T("在大叻长大，负责和小农沟通采摘与处理。每年收获季，都是 Mai 带我们上山杯测。",
                      "Grew up in Da Lat and works with our farmers on picking and processing. Every harvest, Mai takes us up the hills to cup.")},
            {"name": "Aisyah Rahman", "initial": "A", "color": "#9e2b25",
             "role": T("咖啡师 / 课程讲师", "Head barista & classes"),
             "bio": T("每批豆子出货前都由 Aisyah 杯测把关，也负责线上手冲课，把“酸质”讲成人人听得懂的话。",
                      "Cups every batch before it ships and teaches our online brewing classes in plain words.")},
            {"name": "Tan Wei Ling", "initial": "W", "color": "#3d281d",
             "role": T("客服与订阅", "Customer care & subscriptions"),
             "bio": T("WhatsApp 那头回你信息的人。想换豆、暂停订阅或改地址，直接找 Wei Ling。",
                      "The person answering your WhatsApp messages. To swap coffee, pause a subscription or change your address, message Wei Ling.")},
        ],
    },
    "values": {
        "title": T("我们坚持的三件事", "Three things we don't compromise on"),
        "intro": T("从后院烘豆到现在，这三条从没变过。", "They haven't changed since the backyard days."),
        "items": [
            {"title": T("新鲜是底线", "Fresh, always"),
             "text": T("所有豆子按订单烘焙，烘好 48 小时内寄出，包装印烘焙日期。超过 6 周的豆子不再出售。",
                       "Everything is roasted to order and shipped within 48 hours, with the roast date on the bag. We stop selling any coffee older than six weeks.")},
            {"title": T("公平对待农户", "Fair to farmers"),
             "text": T("直接向小农购买，收购价比当地市场价高 25% 以上，每年收获季都回到大叻。",
                       "We buy directly from smallholders, pay at least 25% above local market price, and go back to Da Lat every harvest.")},
            {"title": T("让越南咖啡被重新认识", "Vietnamese coffee, rediscovered"),
             "text": T("从花果香的精品阿拉比卡，到浓郁的传统滴滤，我们想让更多人喝到越南咖啡的另一面。",
                       "From floral specialty arabica to bold traditional phin, we want more people to taste the other side of Vietnamese coffee.")},
        ],
    },
    "cta": {
        "title": T("还没想好喝哪一支？先订一盒试饮装", "Not sure where to start? Try the tasting box"),
        "text": T("四款当季单品各 50g，附冲煮卡，RM 39 全马包邮。", "50 g each of four current single origins, with brew cards. RM 39 with free shipping."),
        "order": T("WhatsApp 订试饮装", "Order the tasting box"),
        "all": T("看全部咖啡豆", "See all coffee"),
    },
}

SERVICES = {
    "title": T("咖啡豆与服务｜叻山咖啡 Lat Hill", "Coffee & services | Lat Hill Coffee"),
    "description": T("叻山咖啡在售的越南咖啡豆、订阅方案与批发合作：精品单品、意式拼配、越南传统滴滤，价格以 RM 计。",
                     "Lat Hill's Vietnamese coffee, subscriptions and wholesale: single origins, espresso blends and traditional phin coffee, priced in RM."),
    "hero": {
        "crumb": T("咖啡豆与服务", "Coffee & services"),
        "title": T("咖啡豆、订阅与合作", "Coffee, subscriptions and wholesale"),
        "lead": T("所有咖啡都按订单烘焙，西马满 RM 80 包邮。看中哪一支，点“WhatsApp 下单”就好。",
                  "Everything is roasted to order, with free shipping in West Malaysia over RM 80. Found one you like? Tap “Order on WhatsApp”."),
        "video": "roast",
    },
    "beans": {
        "title": T("咖啡豆", "Coffee"),
        "intro": T("当季在售 10 款。烘焙度从浅到深用 5 格表示。", "Ten coffees this season. The five bars show the roast level, from light to dark."),
        "filter_label": T("按类型筛选", "Filter by type"),
        "all": T("全部", "All"),
        "status": T("显示 {n} 款", "Showing {n}"),
    },
    "plans": {
        "title": T("咖啡豆订阅", "Subscriptions"),
        "intro": T("每月 5 日烘焙、7 日前寄出，全马包邮。想换豆、跳过一期或暂停，WhatsApp 说一声就行。",
                   "Roasted on the 5th and shipped by the 7th of every month, with free shipping nationwide. To swap, skip or pause, just send us a WhatsApp message."),
        "per_month": T("/月", "/month"),
        "from": T("起", "from"),
        "badge": T("最多人选", "Most popular"),
        "items": [
            {"key": "explorer", "name": T("尝鲜", "Explorer"), "price": 89, "from": False,
             "desc": T("一个人喝，想多试几个产区", "For one, exploring different farms"),
             "features": [T("每月 2 包 200g 当季单品", "Two 200 g single origins a month"),
                          T("附冲煮参数卡与产地故事", "Brew cards and farm stories"),
                          T("全马包邮", "Free shipping in Malaysia")],
             "button": T("WhatsApp 订阅", "Subscribe on WhatsApp")},
            {"key": "daily", "name": T("常饮", "Daily"), "price": 159, "from": False, "featured": True,
             "desc": T("每天一两杯，手冲和意式都喝", "A cup or two a day, filter and espresso"),
             "features": [T("每月 4 包，单品或拼配自由搭配", "Four bags a month, single origins or blends"),
                          T("首次订阅送不锈钢 Phin 滴滤壶", "A free stainless-steel phin with your first box"),
                          T("优先尝到限量批次", "First dibs on limited lots"),
                          T("随时暂停、跳过或取消", "Pause, skip or cancel any time")],
             "button": T("WhatsApp 订阅", "Subscribe on WhatsApp")},
            {"key": "office", "name": T("办公室", "Office"), "price": 380, "from": True,
             "desc": T("10–30 人团队的日常咖啡", "Daily coffee for teams of 10–30"),
             "features": [T("每月 2kg 意式或滴滤咖啡，可随时加量", "2 kg of espresso or phin coffee a month, top up any time"),
                          T("可借用磨豆机", "A grinder on loan"),
                          T("巴生谷免费上门调试一次", "One free set-up visit in the Klang Valley"),
                          T("月结电子发票", "Monthly e-invoice")],
             "button": T("咨询办公室方案", "Ask about office plans"), "href": "contact.html?type=subscription#reserve"},
        ],
    },
    "partners": {
        "title": T("批发与合作", "Wholesale and partnerships"),
        "intro": T("咖啡馆、公司，或想做自己咖啡品牌的你，都可以找我们。", "For cafés, companies, and anyone starting their own coffee brand."),
        "head": [T("服务", "Service"), T("起订量", "Minimum"), T("价格", "Price")],
        "rows": [
            {"title": T("咖啡馆批发", "Café wholesale"),
             "text": T("为咖啡馆和餐厅定制烘焙曲线，每周固定出炉，免费提供样品。", "Custom roast profiles for cafés and restaurants, on a weekly roasting schedule, with free samples."),
             "min": T("每周 3kg", "3 kg a week"), "price": T("RM 110/kg 起", "From RM 110/kg")},
            {"title": T("企业礼盒", "Corporate gift boxes"),
             "text": T("农历新年、开斋节、屠妖节等节庆礼盒，可加印企业 logo 腰封。", "Gift boxes for Chinese New Year, Hari Raya, Deepavali and more, with your logo on the sleeve."),
             "min": T("20 盒", "20 boxes"), "price": T("RM 68/盒起", "From RM 68/box")},
            {"title": T("线上手冲课", "Online brewing class"),
             "text": T("60 分钟 Google Meet 小班课，课前寄出 2 × 50g 练习豆。", "A 60-minute small-group class on Google Meet. We post 2 × 50 g of practice beans beforehand."),
             "min": T("每月两场，每场 8 人", "Twice a month, 8 per class"), "price": T("RM 59/人", "RM 59/person")},
            {"title": T("自有品牌代烘", "Private-label roasting"),
             "text": T("用叻山的越南生豆和烘焙曲线，做你自己品牌的咖啡豆。", "Your own coffee brand, roasted from our Vietnamese green coffee and profiles."),
             "min": T("10kg", "10 kg"), "price": T("RM 95/kg 起", "From RM 95/kg")},
        ],
        "cta": T("咨询合作", "Ask about wholesale"),
    },
    "faq": {
        "title": T("常见问题", "Questions"),
        "items": [
            {"q": T("怎么下单和付款？", "How do I order and pay?"),
             "a": T("点咖啡上的“WhatsApp 下单”，咖啡的名字会自动带进对话。确认订单后，我们会发付款链接，支持 FPX 网银转账、Touch 'n Go eWallet 和 DuitNow QR。",
                    "Tap “Order on WhatsApp” on any coffee and its name is filled in for you. Once we confirm the order, we send a payment link for FPX online banking, Touch 'n Go eWallet or DuitNow QR.")},
            {"q": T("多久可以收到？", "When will my coffee arrive?"),
             "a": T("我们每周二、周五烘焙，前一天 23:59 前下单就能排进那一炉。烘好隔天寄出，西马 1–3 个工作日、东马 3–5 个工作日送达。",
                    "We roast every Tuesday and Friday. Order by 11:59 pm the day before to make that batch. Bags ship the next day and arrive in 1–3 working days in West Malaysia, or 3–5 in East Malaysia.")},
            {"q": T("运费怎么算？", "How much is shipping?"),
             "a": T("西马满 RM 80 包邮，未满收 RM 8；东马满 RM 150 包邮，未满收 RM 15。订阅方案全马包邮。",
                    "West Malaysia: free over RM 80, otherwise RM 8. East Malaysia: free over RM 150, otherwise RM 15. Subscriptions always ship free.")},
            {"q": T("可以帮我磨好粉吗？", "Can you grind it for me?"),
             "a": T("可以。下单时告诉我们你用的器具（手冲、法压壶、摩卡壶、意式机或 Phin），我们会按对应粗细研磨。磨好的粉建议两周内喝完。",
                    "Yes. Tell us your brewer (pour-over, French press, moka pot, espresso machine or phin) and we'll grind to match. Ground coffee is best within two weeks.")},
            {"q": T("喝不惯可以换吗？", "What if I don't like it?"),
             "a": T("收货 14 天内，豆子还剩一半以上，都可以免费换一包别的，来回运费由我们负责。",
                    "Within 14 days of delivery, if at least half the bag is left, we'll swap it for another coffee and cover shipping both ways.")},
        ],
    },
}

CONTACT = {
    "title": T("联系我们｜叻山咖啡 Lat Hill", "Contact | Lat Hill Coffee"),
    "description": T("WhatsApp 下单、预约下一炉、订阅与批发咨询。叻山咖啡的客服时间、烘焙发货时间表与全马配送范围。",
                     "Order on WhatsApp, reserve the next roast, or ask about subscriptions and wholesale. Lat Hill's customer care hours, roasting schedule and delivery across Malaysia."),
    "hero": {
        "crumb": T("联系我们", "Contact"),
        "title": T("想下单、想预约？WhatsApp 最快", "Want to order or reserve? WhatsApp is fastest"),
        "lead": T("我们只做网店，没有门市。下单、预约下一炉、订阅或批发合作，都可以直接 WhatsApp 我们，或填写下面的表单，客服会在一个工作日内回复。",
                  "We're online only, with no café. To order, reserve a roast, subscribe or talk wholesale, message us on WhatsApp or use the form below. We reply within one working day."),
        "video": "phin",
    },
    "form": {
        "title": T("预约与咨询", "Reserve or ask us anything"),
        "required": T("带 * 的为必填项。", "Fields marked * are required."),
        "wpforms_note": T("WPForms 占位表单：上线 WordPress 后替换为短代码 <code>[wpforms id=\"123\"]</code>。当前为静态演示，提交不会发送数据。",
                          "WPForms placeholder: on WordPress, replace it with the shortcode <code>[wpforms id=\"123\"]</code>. This static demo doesn't send any data."),
        "name": T("称呼", "Name"),
        "contact": T("手机或邮箱", "Phone or email"),
        "contact_hint": T("例如 012-345 6789", "e.g. 012-345 6789"),
        "topic": T("想咨询什么", "What's it about?"),
        "topics": [
            ("reserve", T("预约下一炉", "Reserve next roast")),
            ("order", T("订购咖啡豆", "Buy coffee")),
            ("subscription", T("订阅方案", "Subscription")),
            ("wholesale", T("咖啡馆批发", "Café wholesale")),
            ("gifts", T("企业礼盒", "Corporate gifts")),
            ("class", T("线上手冲课", "Online class")),
            ("other", T("其他", "Something else")),
        ],
        "area": T("配送地区", "Delivery area"),
        "areas": [T("西马（半岛）", "West Malaysia (Peninsular)"), T("东马（沙巴、砂拉越、纳闽）", "East Malaysia (Sabah, Sarawak, Labuan)")],
        "grind": T("研磨方式", "Grind"),
        "grinds": [T("整豆", "Whole bean"), T("手冲", "Pour-over"), T("意式", "Espresso"), T("法压壶", "French press"),
                   T("摩卡壶", "Moka pot"), T("Phin 滴滤", "Phin")],
        "message": T("留言", "Message"),
        "message_ph": T("例如：想预约下一炉的 Cầu Đất 两包，磨成手冲粉，寄到八打灵再也。",
                        "e.g. Two bags of Cầu Đất from the next roast, ground for pour-over, to Petaling Jaya."),
        "submit": T("发送", "Send"),
        "privacy": T("我们只用你的联系方式回复这次咨询。", "We only use your details to reply to this message."),
        "success_title": T("已收到", "Message received"),
        "success": T("谢谢你，{name}！我们会在一个工作日内回复你。", "Thanks, {name}! We'll get back to you within one working day."),
        "err_name": T("请填写你的称呼", "Please tell us your name"),
        "err_contact_empty": T("请留下手机号或邮箱，方便我们回复", "Please leave a phone number or email so we can reply"),
        "err_contact": T("请输入马来西亚手机号（如 012-345 6789）或有效的邮箱", "Enter a Malaysian mobile number (e.g. 012-345 6789) or a valid email"),
        "err_message": T("请至少写 5 个字，让我们知道你需要什么", "Please write a few words so we know what you need"),
    },
    "whatsapp": {
        "title": T("WhatsApp 下单最快", "Fastest: WhatsApp"),
        "text": T("下单、改地址、暂停订阅，都可以直接发信息给我们。", "Order, change your address or pause a subscription. Just send us a message."),
        "button": T("打开 WhatsApp", "Open WhatsApp"),
        "email_label": T("合作与媒体联络", "Partnerships and press"),
    },
    "hours": {
        "title": T("客服时间", "Customer care hours"),
        "rows": [
            {"days": "1 2 3 4 5", "open": "09:00", "close": "18:00", "label": T("周一至周五", "Monday to Friday")},
            {"days": "6", "open": "10:00", "close": "14:00", "label": T("周六", "Saturday")},
            {"days": "0", "open": "", "close": "", "label": T("周日及公共假期", "Sunday & public holidays")},
        ],
        "closed": T("休息", "Closed"),
        "today": T("今天", "Today"),
        "online": T("客服在线，{close} 下线", "Online now, until {close}"),
        "later": T("今天 {open} 上线", "Back today at {open}"),
        "offline": T("客服已下线，下个工作日回复", "Offline, we'll reply next working day"),
        "note": T("非客服时间也可以留言，我们会在下个工作日依次回复。", "You can message us any time; we reply in order on the next working day."),
    },
    "schedule": {
        "title": T("烘焙与发货", "Roasting and dispatch"),
        "rows": [
            (T("烘焙日", "Roast days"), T("每周二、周五", "Tuesday and Friday")),
            (T("截单时间", "Order cutoff"), T("烘焙前一天 23:59", "11:59 pm the day before")),
            (T("发货", "Dispatch"), T("烘焙隔天", "The day after roasting")),
        ],
        "next": T("下一炉：{date}，{cutoff} 前截单", "Next roast: {date}. Order by {cutoff}."),
    },
    "delivery": {
        "title": T("全马配送", "Delivery across Malaysia"),
        "head": [T("地区", "Area"), T("时效", "Delivery time"), T("运费", "Shipping")],
        "rows": [
            (T("西马（半岛）", "West Malaysia"), T("1–3 个工作日", "1–3 working days"), T("满 RM 80 包邮，否则 RM 8", "Free over RM 80, otherwise RM 8")),
            (T("东马（沙巴、砂拉越、纳闽）", "East Malaysia"), T("3–5 个工作日", "3–5 working days"), T("满 RM 150 包邮，否则 RM 15", "Free over RM 150, otherwise RM 15")),
        ],
        "note": T("暂不寄送海外。", "We don't ship overseas yet."),
        "map_title": T("叻山咖啡的配送范围：马来西亚全境", "Lat Hill delivery area: all of Malaysia"),
        "map_caption": T("西马与东马全境配送，订单从巴生谷的烘焙工坊寄出。", "We deliver to every state in West and East Malaysia, from our roastery in the Klang Valley."),
    },
}
