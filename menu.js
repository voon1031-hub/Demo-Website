/*
  ══════════════════════════════════════════════════════════════════
  ★ THE MENU — edit dishes and prices here ★

  The page builds the menu, the dish close-ups and the order list from
  this file. Each dish is one line:

    name    : as guests see it
    price   : in dollars, before tax. A dish that comes in sizes has
              sizes: [{ label: "Small cup", price: 2.50 }, ...] instead.
    detail  : one short line under the name
    zh, py  : Chinese name and its pinyin (optional). After adding or
              changing Chinese text, run  python3 tools/subset-cjk-font.py
    hot     : true marks the dish as spicy
    photo   : a photo in assets/menu/ (see tools/prepare-photo.py)
    story   : one of the stories at the bottom of this file
    side    : the choice of rice, noodles or side the dish comes with

  A category can set side, soup, story and a note for all its dishes.
  Dishes without a photo show the Chinese character for their main
  ingredient; the characters and the words they match are in glyphs.
  ══════════════════════════════════════════════════════════════════
*/
(() => {
const RICE_UPGRADE = { label: "Comes with", options: [{ label: "Steamed rice", price: 0 }, { label: "Pork fried rice", price: 1.25 }] };
const RICE_OR_NOODLES = { label: "Comes with", options: [{ label: "Steamed rice", price: 0 }, { label: "Pork fried rice", price: 1 }, { label: "Plain pan-fried noodles", price: 1 }] };
const CHOW_MEIN_OR_CHOP_SUEY = { label: "Served on", options: [{ label: "Crispy noodles (chow mein)", price: 0 }, { label: "Steamed rice (chop suey)", price: 0 }] };
const AMERICAN_SIDE = { label: "Side", options: [{ label: "Soup", price: 0 }, { label: "Dinner salad", price: 0 }, { label: "Rice", price: 0 }, { label: "French fries", price: 0 }, { label: "Baked potato", price: 0 }] };
const SOUP = { label: "Soup", options: [{ label: "Egg flower soup", price: 0 }, { label: "Hot and sour soup", price: 0 }] };

window.MENU = {
  updated: "January 2024",

  categories: [
    {
      id: "appetizers", title: "Appetizers", zh: "小吃", py: "xiǎo chī",
      items: [
        { name: "Appetizers Plate", price: 13.25, detail: "Pork egg roll, fried shrimp, BBQ pork and crab puffs. Swap any of them, except for chicken wings or potstickers.", zh: "什锦拼盘", py: "shí jǐn pīn pán", photo: "appetizers-plate", story: "combination" },
        { name: "Fried Shrimp", sizes: [{ label: "10 pieces", price: 10.50 }, { label: "16 pieces", price: 13.50 }], detail: "Deep-fried shrimp with sweet and sour sauce, cocktail sauce, hot mustard and sesame seeds.", zh: "炸虾", py: "zhá xiā", photo: "fried-shrimp" },
        { name: "Crab Puffs", price: 8.95, detail: "Twelve crisp wontons filled with crab and cream cheese, with sweet and sour sauce.", zh: "蟹角", py: "xiè jiǎo", photo: "crab-puffs", story: "crab-puff" },
        { name: "Crispy Fried Chicken Wings", price: 8.75, detail: "Crisp, deep-fried chicken wings.", zh: "炸鸡翅", py: "zhá jī chì" },
        { name: "Potstickers", price: 8.75, detail: "Eight pan-fried pork potstickers. Ask for them steamed if you like.", zh: "锅贴", py: "guō tiē", photo: "potstickers", story: "potsticker" },
        { name: "Crispy Fried Wontons", price: 7.25, detail: "Fried wonton skins, no filling. Made for dipping.", zh: "炸云吞皮", py: "zhá yún tūn pí", story: "wonton" },
        { name: "Pork Egg Roll", sizes: [{ label: "3 rolls", price: 8.95 }, { label: "2 rolls", price: 7.25 }], detail: "Pork and vegetable egg rolls, fried crisp, with sweet and sour sauce.", zh: "蛋卷", py: "dàn juǎn", photo: "pork-egg-roll", story: "egg-roll" },
        { name: "Spring Rolls", price: 8.25, zh: "春卷", py: "chūn juǎn", story: "spring-roll" },
        { name: "BBQ Pork", price: 9.95, detail: "Sliced Chinese roast pork, sweet and glazed at the edges.", zh: "叉烧", py: "chā shāo", photo: "bbq-pork", story: "char-siu" },
      ]
    },
    {
      id: "soups", title: "Soups", zh: "汤", py: "tāng",
      items: [
        { name: "War Wonton Noodle Soup", price: 11.95, detail: "Pork wontons and noodles in broth.", zh: "窝云吞面", py: "wō yún tūn miàn", photo: "war-wonton-noodle-soup", story: "wonton" },
        { name: "Wonton Soup", price: 10.95, detail: "Pork wontons in broth.", zh: "云吞汤", py: "yún tūn tāng", photo: "wonton-soup", story: "wonton" },
        { name: "House Special Soup", price: 10.50, detail: "Chicken, shrimp, BBQ pork and vegetables in broth.", zh: "什锦汤", py: "shí jǐn tāng" },
        { name: "Chinese Green Soup", price: 7.25, detail: "Vegetable soup, no meat.", zh: "青菜汤", py: "qīng cài tāng" },
        { name: "Hot and Sour Soup", sizes: [{ label: "Small cup", price: 2.50 }, { label: "Large cup", price: 7.25 }], zh: "酸辣汤", py: "suān là tāng", hot: true, photo: "hot-and-sour-soup", story: "hot-sour" },
        { name: "Egg Flower Soup", sizes: [{ label: "Small cup", price: 2.50 }, { label: "Large cup", price: 7.25 }], zh: "蛋花汤", py: "dàn huā tāng", photo: "egg-flower-soup", story: "egg-flower" },
      ]
    },
    {
      id: "combination-dinners", title: "Combination dinners", zh: "套餐", py: "tào cān",
      glyph: "套",
      note: "Each comes with a cup of egg flower or hot and sour soup. Want something different on the plate? Ask to swap in another favorite when you call; some swaps cost a little extra.",
      soup: SOUP,
      swaps: ["BBQ Pork", "Pork Foo Young", "Egg Foo Young", "Pork Egg Roll", "Spring Rolls", "Sweet and Sour Chicken", "Sweet and Sour Pork", "Sweet and Sour Spareribs", "Almond Fried Chicken", "Subgum Chicken Chow Mein (crunchy noodles)", "Pork Chow Mein (crunchy noodles)", "Lemon Chicken", "Pork Fried Rice", "Fried Shrimp"],
      items: [
        { name: "Dinner #1", price: 12.75, detail: "Pork chow mein, pork fried rice, egg foo young" },
        { name: "Dinner #2", price: 12.95, detail: "Subgum chicken chow mein, sweet and sour pork, pork fried rice" },
        { name: "Dinner #3", price: 13.25, detail: "Pork fried rice, pork chow mein, fried shrimp", photo: "dinner-3" },
        { name: "Dinner #4", price: 13.25, detail: "Subgum chicken chow mein, sweet and sour pork, fried shrimp" },
        { name: "Dinner #5", price: 14.25, detail: "Pork fried rice, pork chow mein, pork egg roll, sweet and sour chicken", photo: "dinner-5" },
        { name: "Dinner #6", price: 14.50, detail: "BBQ pork, fried shrimp, subgum chicken chow mein, pork fried rice", photo: "dinner-6" },
        { name: "Dinner #7", price: 14.25, detail: "Kung pao chicken, pork fried rice, sweet and sour chicken", photo: "dinner-7" },
        { name: "Dinner #8", price: 14.25, detail: "Moo goo gai pan, pork fried rice, sweet and sour pork" },
        { name: "Dinner #9", price: 14.75, detail: "Broccoli beef, pork fried rice, lemon chicken, pork egg roll", photo: "dinner-9" },
        { name: "Dinner #10", price: 14.75, detail: "Pork fried rice, sweet and sour chicken, fried shrimp, BBQ pork", photo: "dinner-10" },
      ]
    },
    {
      id: "pick-your-own", title: "Pick-your-own combinations", zh: "自选套餐", py: "zì xuǎn tào cān",
      glyph: "套",
      note: "Choose two, three or four favorites for one plate. Comes with a cup of egg flower or hot and sour soup. Fried shrimp is $1 extra.",
      soup: SOUP,
      picks: ["BBQ Pork", "Pork Foo Young", "Egg Foo Young", "Pork Egg Roll", "Spring Rolls", "Sweet and Sour Chicken", "Sweet and Sour Pork", "Almond Fried Chicken", "Subgum Chicken Chow Mein (crunchy noodles)", "Pork Chow Mein (crunchy noodles)", "Lemon Chicken", "Pork Fried Rice", "Fried Shrimp"],
      extra: { "Fried Shrimp": 1 },
      items: [
        { name: "Pick 2", price: 9.95, detail: "Two different favorites on one plate.", photo: "pick-2", choose: { count: 2, doubles: 0 } },
        { name: "Pick 3", price: 12.95, detail: "Three favorites. You can double up on one.", photo: "pick-3", choose: { count: 3, doubles: 1 } },
        { name: "Pick 4", price: 14.25, detail: "Four favorites. You can double up on one.", photo: "pick-4", choose: { count: 4, doubles: 1 } },
      ]
    },
    {
      id: "family-dinners", title: "Family dinners", zh: "家庭套餐", py: "jiā tíng tào cān",
      glyph: "家",
      note: "A full spread for the table, priced per person, for two or more. Comes with egg flower or hot and sour soup. You can swap dishes within the same price range.",
      soup: SOUP,
      perPerson: true, minimum: 2,
      items: [
        { name: "Family Dinner A", price: 16.50, detail: "BBQ pork, egg roll and chicken wing to start. Then fried shrimp, pork fried rice, sweet and sour pork and BBQ pork special chow mein. For 4 or more, add beef chow yuk.", story: "family" },
        { name: "Family Dinner B", price: 16.95, detail: "BBQ pork, egg roll and fried wontons to start. Then fried shrimp, pork fried rice, BBQ pork chow yuk and sweet and sour chicken. For 4 or more, add moo goo gai pan.", story: "family" },
        { name: "Family Dinner C", price: 17.95, detail: "BBQ pork, egg roll and crab puff to start. Then fried shrimp, happy family, house fried rice and almond fried chicken. For 4 or more, add General Tso's chicken.", photo: "family-dinner-c", story: "family" },
      ]
    },
    {
      id: "chicken", title: "Chicken", zh: "鸡", py: "jī",
      note: "Served with steamed rice. Make it pork fried rice for $1.25 more.",
      side: RICE_UPGRADE,
      items: [
        { name: "General Tso's Chicken", price: 14.75, detail: "Crisp fried chicken cooked in our own house sauce.", zh: "左宗棠鸡", py: "zuǒ zōng táng jī", photo: "general-tsos-chicken", story: "general-tso" },
        { name: "Moo Goo Gai Pan", price: 14.25, detail: "Tender white-meat chicken with mushrooms, bamboo shoots, snow peas, water chestnuts and Chinese greens.", zh: "蘑菇鸡片", py: "mó gu jī piàn", story: "moo-goo" },
        { name: "Chicken with Hot Garlic Sauce", price: 14.25, detail: "Chicken sautéed with vegetables in a hot garlic sauce.", zh: "蒜辣鸡片", py: "suàn là jī piàn", hot: true },
        { name: "Cashew Nut Chicken", price: 14.25, detail: "Diced white-meat chicken stir-fried with zucchini, onion, green pepper, bamboo shoots, water chestnuts and cashews.", zh: "腰果鸡丁", py: "yāo guǒ jī dīng" },
        { name: "Curry Chicken", price: 14.25, detail: "Tender chicken with green peppers and onions in our curry sauce.", zh: "咖喱鸡", py: "gā lí jī", story: "curry" },
        { name: "Mandarin Chicken", price: 14.25, detail: "Sliced chicken stir-fried with green pepper, onion and green onion." },
        { name: "Orange Chicken", price: 14.75, detail: "Crisp fried chicken in the chef's orange sauce.", zh: "陈皮鸡", py: "chén pí jī", photo: "orange-chicken", story: "orange" },
        { name: "Lemon Chicken", price: 14.25, detail: "Crisp fried chicken with lemon sauce.", zh: "柠檬鸡", py: "níng méng jī", photo: "lemon-chicken", story: "lemon" },
        { name: "Almond Fried Chicken", price: 14.25, detail: "Crisp fried chicken under our house gravy, topped with almonds.", zh: "杏仁鸡", py: "xìng rén jī", photo: "almond-fried-chicken", story: "almond" },
        { name: "String Bean Chicken", price: 14.75, detail: "Chicken stir-fried with string beans.", zh: "四季豆鸡片", py: "sì jì dòu jī piàn" },
        { name: "Shrimp and Chicken Combination", price: 15.25, detail: "Shrimp and chicken stir-fried with Chinese vegetables.", zh: "虾仁鸡片", py: "xiā rén jī piàn" },
        { name: "Black Mushroom Chicken", price: 15.50, detail: "Sliced chicken with black mushrooms and bamboo shoots in oyster sauce.", zh: "冬菇鸡片", py: "dōng gū jī piàn", photo: "black-mushroom-chicken" },
        { name: "Hunan Chicken", price: 14.75, detail: "Sliced chicken with snow peas, mushrooms, bamboo shoots and peppers in house sauce.", zh: "湖南鸡", py: "hú nán jī", story: "hunan" },
        { name: "Kung Pao Chicken", price: 14.25, detail: "Diced chicken stir-fried with zucchini, green pepper, onion, bamboo shoots, water chestnuts and peanuts.", zh: "宫保鸡丁", py: "gōng bǎo jī dīng", hot: true, story: "kung-pao" },
        { name: "Szechuan Chicken", price: 14.75, detail: "Crisp fried chicken with onions and peppers, simmered in Szechuan hot sauce.", zh: "四川鸡", py: "sì chuān jī", hot: true, photo: "szechuan-chicken", story: "szechuan" },
        { name: "Spicy Sesame Chicken", price: 14.75, detail: "Crisp fried chicken in the chef's special hot sauce, with sesame seeds.", zh: "芝麻鸡", py: "zhī ma jī", hot: true, photo: "spicy-sesame-chicken" },
        { name: "Honey Garlic Chicken", price: 14.75, detail: "Crisp fried chicken in the chef's honey sauce.", zh: "蜜汁鸡", py: "mì zhī jī" },
        { name: "Chicken with Snow Peas", price: 14.95, detail: "Sliced chicken stir-fried with snow peas and Chinese greens.", zh: "雪豆鸡片", py: "xuě dòu jī piàn" },
        { name: "Chicken Chow Yuk", price: 14.25, detail: "Sliced chicken with house vegetables.", story: "chow-yuk" },
        { name: "Broccoli Chicken", price: 14.25, detail: "Sliced chicken with broccoli and Chinese greens.", zh: "芥兰鸡", py: "jiè lán jī", photo: "broccoli-chicken", story: "broccoli" },
        { name: "Chicken Three Style", price: 17.75, detail: "Orange chicken, lemon chicken and moo goo gai pan on one plate." },
      ]
    },
    {
      id: "beef", title: "Beef", zh: "牛肉", py: "niú ròu",
      note: "Served with steamed rice. Make it pork fried rice for $1.25 more.",
      side: RICE_UPGRADE,
      items: [
        { name: "Mongolian Beef", price: 15.50, detail: "Sliced beef stir-fried with green and red peppers, onion and green onion.", zh: "蒙古牛肉", py: "méng gǔ niú ròu", photo: "mongolian-beef", story: "mongolian" },
        { name: "Broccoli Beef", price: 14.95, detail: "Sliced beef stir-fried with broccoli and Chinese greens.", zh: "芥兰牛肉", py: "jiè lán niú ròu", story: "broccoli" },
        { name: "Ginger Beef", price: 15.50, detail: "Sliced beef stir-fried with green pepper, white onion and ginger.", zh: "姜丝牛肉", py: "jiāng sī niú ròu" },
        { name: "Curry Beef", price: 14.95, detail: "Sliced beef stir-fried in our curry sauce with Chinese greens.", zh: "咖喱牛肉", py: "gā lí niú ròu", story: "curry" },
        { name: "Mandarin Beef", price: 14.95, detail: "Sliced beef stir-fried with green pepper, white onion and green onion." },
        { name: "Kung Pao Beef", price: 14.95, detail: "Sliced beef stir-fried with diced vegetables and peanuts in kung pao sauce.", zh: "宫保牛肉", py: "gōng bǎo niú ròu", hot: true, story: "kung-pao" },
        { name: "Szechuan Beef", price: 15.50, detail: "Crisp fried beef with vegetables in the chef's special hot sauce.", zh: "四川牛肉", py: "sì chuān niú ròu", hot: true, story: "szechuan" },
        { name: "Orange Beef", price: 15.50, detail: "Crisp fried beef in the chef's orange sauce.", zh: "陈皮牛肉", py: "chén pí niú ròu", story: "orange" },
        { name: "Beef with Snow Peas", price: 15.50, detail: "Sliced beef stir-fried with snow peas and Chinese greens.", zh: "雪豆牛肉", py: "xuě dòu niú ròu" },
        { name: "Beef with Oyster Sauce", price: 14.95, detail: "Sliced beef stir-fried in house oyster sauce with Chinese greens.", zh: "蚝油牛肉", py: "háo yóu niú ròu" },
        { name: "Beef with Tomatoes", price: 14.95, detail: "Sliced beef stir-fried with tomatoes.", zh: "番茄牛肉", py: "fān qié niú ròu" },
        { name: "Beef with Green Pepper", price: 14.95, detail: "Sliced beef stir-fried with green peppers.", zh: "青椒牛肉", py: "qīng jiāo niú ròu" },
        { name: "Beef Chow Yuk", price: 14.95, detail: "Sliced beef stir-fried with vegetables.", story: "chow-yuk" },
        { name: "Hunan Beef", price: 15.50, detail: "Sliced beef with snow peas, mushrooms, bamboo shoots and peppers in house sauce.", zh: "湖南牛肉", py: "hú nán niú ròu", story: "hunan" },
        { name: "Honey Garlic Beef", price: 15.50, detail: "Crisp fried beef in the chef's honey sauce.", zh: "蜜汁牛肉", py: "mì zhī niú ròu" },
        { name: "String Bean Beef", price: 15.50, detail: "Sliced beef stir-fried with string beans.", zh: "四季豆牛肉", py: "sì jì dòu niú ròu" },
      ]
    },
    {
      id: "pork", title: "Pork", zh: "猪肉", py: "zhū ròu",
      note: "Served with steamed rice. Make it pork fried rice for $1.25 more.",
      side: RICE_UPGRADE,
      items: [
        { name: "Twice Cooked Pork", price: 13.75, detail: "BBQ pork stir-fried with carrots and bamboo shoots in our house hot sauce.", zh: "回锅肉", py: "huí guō ròu", hot: true, story: "twice-cooked" },
        { name: "BBQ Pork Almondine", price: 13.75, detail: "Diced BBQ pork sautéed with celery, onion, water chestnuts, bamboo shoots and peas.", zh: "杏仁叉烧丁", py: "xìng rén chā shāo dīng", story: "char-siu" },
        { name: "String Bean BBQ Pork", price: 14.50, detail: "Sliced BBQ pork stir-fried with string beans.", zh: "四季豆叉烧", py: "sì jì dòu chā shāo", story: "char-siu" },
        { name: "BBQ Pork Chow Yuk", price: 14.00, detail: "Sliced BBQ pork stir-fried with vegetables.", story: "chow-yuk" },
        { name: "Black Mushroom Pork", price: 15.50, detail: "Sliced pork stir-fried with black mushrooms and bamboo shoots in oyster sauce.", zh: "冬菇肉片", py: "dōng gū ròu piàn" },
      ]
    },
    {
      id: "seafood", title: "Seafood", zh: "海鲜", py: "hǎi xiān",
      note: "Served with steamed rice. Make it pork fried rice for $1.25 more.",
      side: RICE_UPGRADE,
      items: [
        { name: "Happy Family", price: 15.50, detail: "Shrimp, chicken and BBQ pork with cooked vegetables.", zh: "全家福", py: "quán jiā fú", photo: "happy-family", story: "happy-family", glyph: "福" },
        { name: "General Tso's Shrimp", price: 16.50, detail: "Crisp fried shrimp in our house sauce.", zh: "左宗棠虾", py: "zuǒ zōng táng xiā", story: "general-tso" },
        { name: "Kung Pao Shrimp", price: 15.50, detail: "Shrimp stir-fried with diced vegetables.", zh: "宫保虾仁", py: "gōng bǎo xiā rén", hot: true, story: "kung-pao" },
        { name: "Cashew Nut Shrimp", price: 15.50, detail: "Shrimp stir-fried with diced vegetables and cashews.", zh: "腰果虾仁", py: "yāo guǒ xiā rén" },
        { name: "Shrimp Chow Yuk", price: 15.50, detail: "Shrimp stir-fried with vegetables.", story: "chow-yuk" },
        { name: "Curry Shrimp", price: 15.50, detail: "Shrimp stir-fried in our curry sauce with Chinese greens.", zh: "咖喱虾", py: "gā lí xiā", photo: "curry-shrimp", story: "curry" },
        { name: "Shrimp with Snow Peas", price: 15.75, detail: "Shrimp stir-fried with snow peas and Chinese greens.", zh: "雪豆虾仁", py: "xuě dòu xiā rén" },
        { name: "Seafood Delight", price: 16.50, detail: "Seafood stir-fried with vegetables in house sauce.", zh: "海鲜什锦", py: "hǎi xiān shí jǐn" },
        { name: "Salt and Pepper Shrimp", price: 18.50, detail: "Crisp fried shrimp tossed with salt and pepper seasoning.", zh: "椒盐虾", py: "jiāo yán xiā", story: "salt-pepper" },
        { name: "House Special Sizzling Platter", price: 17.25, detail: "Meat and vegetables stir-fried and served on a sizzling platter.", zh: "招牌铁板", py: "zhāo pái tiě bǎn" },
        { name: "Szechuan Shrimp", price: 15.50, detail: "Crisp fried shrimp with green pepper, carrots, onion and bamboo shoots in Szechuan sauce.", zh: "四川虾", py: "sì chuān xiā", hot: true, photo: "szechuan-shrimp", story: "szechuan" },
        { name: "Shrimp with Hot Garlic Sauce", price: 15.50, detail: "Shrimp stir-fried with vegetables in our hot garlic sauce.", zh: "蒜辣虾仁", py: "suàn là xiā rén", hot: true },
        { name: "Shrimp with Lobster Sauce", price: 16.25, detail: "Shrimp stir-fried in house lobster sauce.", zh: "虾龙糊", py: "xiā lóng hú", story: "lobster-sauce" },
      ]
    },
    {
      id: "sweet-and-sour", title: "Sweet and sour", zh: "甜酸", py: "tián suān",
      story: "sweet-sour",
      note: "Served with steamed rice. Make it pork fried rice or plain pan-fried noodles for $1 more.",
      side: RICE_OR_NOODLES,
      items: [
        { name: "Sweet and Sour Chicken", price: 13.50, detail: "Crisp fried chicken in sweet and sour sauce.", zh: "甜酸鸡", py: "tián suān jī", photo: "sweet-and-sour-chicken" },
        { name: "Sweet and Sour Pork", price: 13.50, detail: "Crisp fried pork in sweet and sour sauce.", zh: "咕噜肉", py: "gū lū ròu" },
        { name: "Sweet and Sour Shrimp", price: 14.95, detail: "Crisp fried shrimp in sweet and sour sauce.", zh: "甜酸虾", py: "tián suān xiā" },
        { name: "Sweet and Sour Spareribs", price: 14.95, detail: "Crisp fried spareribs in sweet and sour sauce.", zh: "甜酸排骨", py: "tián suān pái gǔ" },
      ]
    },
    {
      id: "vegetables", title: "Vegetables and tofu", zh: "素菜", py: "sù cài",
      note: "Served with steamed rice. Make it pork fried rice or plain pan-fried noodles for $1 more.",
      side: RICE_OR_NOODLES,
      items: [
        { name: "Vegetable Deluxe", price: 13.25, detail: "Vegetables stir-fried in our clear sauce." },
        { name: "Green Jade Vegetable", price: 13.25, detail: "Vegetables stir-fried in our clear sauce." },
        { name: "Family Style Tofu", price: 13.25, detail: "Tofu stir-fried with vegetables.", zh: "家常豆腐", py: "jiā cháng dòu fu" },
        { name: "Mapo Tofu", price: 13.25, detail: "Szechuan-style tofu in our house sauce.", zh: "麻婆豆腐", py: "má pó dòu fu", hot: true, story: "mapo" },
        { name: "Sautéed Green Beans", price: 13.25, detail: "String beans stir-fried in our house sauce.", zh: "炒四季豆", py: "chǎo sì jì dòu" },
      ]
    },
    {
      id: "chow-mein-chop-suey", title: "Chow mein and chop suey", zh: "炒面杂碎", py: "chǎo miàn zá suì",
      story: "chow-mein",
      note: "The old-school kind, built on bean sprouts. Order it as chow mein on crispy noodles, or as chop suey over steamed rice.",
      side: CHOW_MEIN_OR_CHOP_SUEY,
      items: [
        { name: "Pork Chow Mein or Chop Suey", price: 11.95, photo: "pork-chow-mein-or-chop-suey" },
        { name: "Chicken Chow Mein or Chop Suey", price: 11.95, photo: "chicken-chow-mein-or-chop-suey" },
        { name: "Beef Chow Mein or Chop Suey", price: 12.95 },
        { name: "Shrimp Chow Mein or Chop Suey", price: 12.95 },
        { name: "Subgum Chicken Chow Mein or Chop Suey", price: 11.95, detail: "Built on celery instead of bean sprouts.", zh: "什锦", py: "shí jǐn", story: "subgum" },
        { name: "Meatless Chow Mein or Chop Suey", price: 10.95 },
      ]
    },
    {
      id: "house-chow-mein", title: "House special chow mein", zh: "招牌炒面", py: "zhāo pái chǎo miàn",
      story: "soft-chow-mein",
      note: "Soft noodles, pan-fried and then stir-fried with meat and vegetables. We can leave out anything you don't want.",
      items: [
        { name: "House Special Chow Mein", price: 14.95, detail: "Shrimp, chicken, BBQ pork and vegetables.", zh: "招牌炒面", py: "zhāo pái chǎo miàn", photo: "house-special-chow-mein" },
        { name: "BBQ Pork Special Chow Mein", price: 13.95, detail: "BBQ pork and vegetables.", zh: "叉烧炒面", py: "chā shāo chǎo miàn", photo: "bbq-pork-special-chow-mein" },
        { name: "Beef Special Chow Mein", price: 14.95, detail: "Beef and vegetables.", zh: "牛肉炒面", py: "niú ròu chǎo miàn", photo: "beef-special-chow-mein" },
        { name: "Chicken Special Chow Mein", price: 13.95, detail: "Chicken and vegetables.", zh: "鸡肉炒面", py: "jī ròu chǎo miàn" },
        { name: "Shrimp Special Chow Mein", price: 14.95, detail: "Shrimp and vegetables.", zh: "虾仁炒面", py: "xiā rén chǎo miàn" },
        { name: "Vegetable Special Chow Mein", price: 12.95, detail: "Vegetables only.", zh: "什菜炒面", py: "shí cài chǎo miàn" },
      ]
    },
    {
      id: "lo-mein", title: "Lo mein", zh: "捞面", py: "lāo miàn",
      story: "lo-mein",
      note: "Soft noodles tossed with sauce, meat and vegetables. We can leave out anything you don't want.",
      items: [
        { name: "House Special Lo Mein", price: 14.95, detail: "Shrimp, chicken, BBQ pork and vegetables.", zh: "招牌捞面", py: "zhāo pái lāo miàn", photo: "house-special-lo-mein" },
        { name: "BBQ Pork Lo Mein", price: 13.95, detail: "BBQ pork and vegetables.", zh: "叉烧捞面", py: "chā shāo lāo miàn", photo: "bbq-pork-lo-mein" },
        { name: "Beef Lo Mein", price: 14.95, detail: "Beef and vegetables.", zh: "牛肉捞面", py: "niú ròu lāo miàn", photo: "beef-lo-mein" },
        { name: "Chicken Lo Mein", price: 13.95, detail: "Chicken and vegetables.", zh: "鸡肉捞面", py: "jī ròu lāo miàn" },
        { name: "Shrimp Lo Mein", price: 14.95, detail: "Shrimp and vegetables.", zh: "虾仁捞面", py: "xiā rén lāo miàn" },
        { name: "Vegetable Lo Mein", price: 12.95, detail: "Vegetables only.", zh: "什菜捞面", py: "shí cài lāo miàn" },
      ]
    },
    {
      id: "soup-noodles", title: "Soup noodles", zh: "汤面", py: "tāng miàn",
      note: "Noodles in a bowl of hot broth. We can leave out anything you don't want.",
      items: [
        { name: "House Special Noodles", price: 13.75, detail: "Shrimp, chicken, BBQ pork and vegetables.", zh: "招牌汤面", py: "zhāo pái tāng miàn" },
        { name: "BBQ Pork Noodle Soup", price: 11.25, detail: "BBQ pork and egg.", zh: "叉烧汤面", py: "chā shāo tāng miàn", photo: "bbq-pork-noodle-soup" },
        { name: "Chicken Noodle Soup", price: 11.25, detail: "Chicken.", zh: "鸡肉汤面", py: "jī ròu tāng miàn" },
        { name: "Chicken and Vegetable Noodle Soup", price: 12.95, detail: "Chicken and vegetables." },
        { name: "Beef and Vegetable Noodle Soup", price: 12.95, detail: "Beef and vegetables." },
        { name: "Shrimp and Vegetable Noodle Soup", price: 13.75, detail: "Shrimp and vegetables." },
        { name: "Beef Tomato Curry Noodle Soup", price: 13.50, detail: "Beef, tomato and vegetables in our homemade curry.", zh: "咖喱番茄牛肉面", py: "gā lí fān qié niú ròu miàn", story: "curry" },
        { name: "Plain Pan-Fried Noodles", price: 6.95, detail: "Just the noodles: no sauce, no toppings." },
      ]
    },
    {
      id: "rice", title: "Fried rice and rice plates", zh: "饭", py: "fàn",
      story: "fried-rice",
      items: [
        { name: "House Fried Rice", price: 12.95, detail: "Shrimp, BBQ pork, ham and vegetables.", zh: "招牌炒饭", py: "zhāo pái chǎo fàn" },
        { name: "Pork Fried Rice", price: 10.95, detail: "BBQ pork and egg.", zh: "叉烧炒饭", py: "chā shāo chǎo fàn", photo: "pork-fried-rice" },
        { name: "Chicken Fried Rice", price: 11.95, detail: "Chicken and vegetables.", zh: "鸡肉炒饭", py: "jī ròu chǎo fàn" },
        { name: "Beef Fried Rice", price: 12.95, detail: "Beef and vegetables.", zh: "牛肉炒饭", py: "niú ròu chǎo fàn" },
        { name: "Shrimp Fried Rice", price: 12.95, detail: "Shrimp and vegetables.", zh: "虾仁炒饭", py: "xiā rén chǎo fàn" },
        { name: "Ham Fried Rice", price: 11.95, detail: "Ham and vegetables.", zh: "火腿炒饭", py: "huǒ tuǐ chǎo fàn" },
        { name: "Egg Fried Rice", price: 10.50, detail: "Egg.", zh: "蛋炒饭", py: "dàn chǎo fàn" },
        { name: "Vegetable Fried Rice", price: 10.95, detail: "Vegetables and egg.", zh: "什菜炒饭", py: "shí cài chǎo fàn" },
        { name: "Chicken and Vegetables over Rice", price: 12.75, detail: "Stir-fried chicken and vegetables on steamed rice." },
        { name: "Beef and Vegetables over Rice", price: 12.95, detail: "Stir-fried beef and vegetables on steamed rice." },
        { name: "Shrimp and Vegetables over Rice", price: 12.95, detail: "Stir-fried shrimp and vegetables on steamed rice." },
        { name: "Steamed Rice", sizes: [{ label: "Small cup", price: 2.50 }, { label: "Large cup", price: 5.50 }], zh: "白饭", py: "bái fàn" },
      ]
    },
    {
      id: "egg-foo-young", title: "Egg foo young", zh: "芙蓉蛋", py: "fú róng dàn",
      story: "foo-young",
      note: "Fluffy egg patties with chopped vegetables, topped with our homemade gravy. Served with steamed rice; make it pork fried rice or plain pan-fried noodles for $1 more.",
      side: RICE_OR_NOODLES,
      items: [
        { name: "Pork Foo Young", price: 11.25, detail: "With pork.", zh: "猪肉芙蓉蛋", py: "zhū ròu fú róng dàn" },
        { name: "Chicken Foo Young", price: 12.95, detail: "With chicken.", zh: "鸡肉芙蓉蛋", py: "jī ròu fú róng dàn" },
        { name: "Shrimp Foo Young", price: 13.50, detail: "With shrimp.", zh: "虾仁芙蓉蛋", py: "xiā rén fú róng dàn" },
        { name: "Ham Foo Young", price: 12.95, detail: "With ham.", zh: "火腿芙蓉蛋", py: "huǒ tuǐ fú róng dàn" },
        { name: "Vegetable Foo Young", price: 11.25, detail: "Vegetables only.", zh: "什菜芙蓉蛋", py: "shí cài fú róng dàn", photo: "vegetable-foo-young" },
      ]
    },
    {
      id: "chow-don", title: "Chow don (scrambled eggs)", zh: "炒蛋", py: "chǎo dàn",
      story: "chow-don",
      note: "Soft scrambled eggs, stir-fried. Served with steamed rice; make it pork fried rice or plain pan-fried noodles for $1 more.",
      side: RICE_OR_NOODLES,
      items: [
        { name: "House Special Chow Don", price: 13.75, detail: "With shrimp, chicken and BBQ pork.", zh: "招牌炒蛋", py: "zhāo pái chǎo dàn" },
        { name: "Shrimp Chow Don", price: 13.75, detail: "With shrimp.", zh: "虾仁炒蛋", py: "xiā rén chǎo dàn" },
        { name: "BBQ Pork Chow Don", price: 12.95, detail: "With BBQ pork.", zh: "叉烧炒蛋", py: "chā shāo chǎo dàn" },
        { name: "Chicken Chow Don", price: 12.95, detail: "With chicken.", zh: "鸡肉炒蛋", py: "jī ròu chǎo dàn" },
        { name: "Ham Chow Don", price: 12.95, detail: "With ham.", zh: "火腿炒蛋", py: "huǒ tuǐ chǎo dàn", photo: "ham-chow-don" },
        { name: "Meatless Chow Don", price: 12.75, detail: "With vegetables.", zh: "什菜炒蛋", py: "shí cài chǎo dàn" },
      ]
    },
    {
      id: "moo-shu", title: "Moo shu", zh: "木须", py: "mù xū",
      items: [
        { name: "Moo Shu", price: 14.75, detail: "Comes with thin pancakes and hoisin sauce for rolling.", zh: "木须", py: "mù xū", photo: "moo-shu", story: "moo-shu" },
      ]
    },
    {
      id: "american", title: "American menu", zh: "西餐", py: "xī cān",
      glyph: "食",
      note: "Steaks, burgers and sandwiches come with soup, dinner salad, rice, french fries or a baked potato.",
      items: [
        { name: "Rib Steak", price: 17.75, side: AMERICAN_SIDE },
        { name: "New York Steak", price: 16.75, side: AMERICAN_SIDE },
        { name: "Ground Round Steak", price: 12.75, side: AMERICAN_SIDE },
        { name: "Fish and Chips", price: 12.25, side: AMERICAN_SIDE },
        { name: "Hamburger", price: 7.50, side: AMERICAN_SIDE },
        { name: "Cheeseburger", price: 7.75, side: AMERICAN_SIDE },
        { name: "Grilled Cheese", price: 6.75, photo: "grilled-cheese", side: AMERICAN_SIDE },
        { name: "Grilled Ham and Cheese", price: 7.50, side: AMERICAN_SIDE },
        { name: "Ham and Egg Sandwich", price: 7.95, side: AMERICAN_SIDE },
        { name: "BBQ Pork Sandwich", price: 8.25, side: AMERICAN_SIDE },
        { name: "French Fries", price: 4.50, photo: "french-fries" },
        { name: "Baked Potato", price: 4.25, photo: "baked-potato" },
        { name: "Dinner Salad", price: 4.25 },
      ]
    },
  ],

  // The plates on the turning table at the top of the page.
  table: ["general-tsos-chicken", "crab-puffs", "house-special-chow-mein", "potstickers",
          "sweet-and-sour-chicken", "pork-fried-rice", "appetizers-plate", "happy-family"],

  // House favorites: the dish, and the looping video in assets/media/.
  favorites: [
    { dish: "general-tsos-chicken", video: "fav-general-tso" },
    { dish: "crab-puffs", video: "fav-crab-puff" },
    { dish: "house-special-chow-mein", video: "fav-chow-mein" }
  ],

  glyphs: [
    { char: "汤", py: "tāng", en: "Soup", match: ["soup"] },
    { char: "卷", py: "juǎn", en: "Roll", match: ["egg roll", "spring roll"] },
    { char: "饺", py: "jiǎo", en: "Dumpling", match: ["potsticker", "wonton", "crab puff"] },
    { char: "饭", py: "fàn", en: "Rice", glossary: true, match: ["fried rice", "over rice", "steamed rice"] },
    { char: "面", py: "miàn", en: "Noodles", glossary: true, match: ["chow mein", "lo mein", "noodle", "chop suey"] },
    { char: "蛋", py: "dàn", en: "Egg", match: ["foo young", "chow don", "egg"] },
    { char: "豆", py: "dòu", en: "Beans and tofu", match: ["tofu", "green bean"] },
    { char: "鱼", py: "yú", en: "Fish", match: ["fish"] },
    { char: "海", py: "hǎi", en: "Sea", match: ["seafood"] },
    { char: "虾", py: "xiā", en: "Shrimp", glossary: true, match: ["shrimp"] },
    { char: "鸡", py: "jī", en: "Chicken", glossary: true, match: ["chicken", "gai pan", "wings"] },
    { char: "牛", py: "niú", en: "Beef", glossary: true, match: ["beef", "steak", "burger", "ground round"] },
    { char: "猪", py: "zhū", en: "Pork", glossary: true, match: ["pork", "ham", "sparerib"] },
    { char: "菜", py: "cài", en: "Vegetables", match: ["vegetable", "meatless", "salad", "green", "jade"] },
    { char: "套", py: "tào", en: "Set meal", match: [] },
    { char: "家", py: "jiā", en: "Family", match: [] },
    { char: "福", py: "fú", en: "Good fortune", match: [] },
    { char: "食", py: "shí", en: "Food", match: [] },
  ],

  stories: {
    "general-tso": {
      title: "A general's name, an American favorite",
      text: "General Tso's chicken is named for Zuo Zongtang, a 19th-century general from Hunan, though he never ate it. Chef Peng Chang-kuei created the dish in Taiwan in the 1950s, and New York cooks made it sweeter and crispier in the 1970s. It has been a Chinese American favorite ever since."
    },
    "char-siu": {
      title: "Roasted on a fork",
      text: "Char siu, Cantonese barbecue pork, means \"fork roasted\": strips of pork are brushed with a sweet, savory glaze and roasted on long forks until the edges turn dark and sticky. You'll find it on its own, in fried rice and on many of our plates."
    },
    "crab-puff": {
      title: "Born in America",
      text: "Crab puffs, also called crab rangoon, are a Chinese American invention. Cream cheese and crab folded into wonton wrappers first appeared on American restaurant menus in the 1950s. You won't find them in China."
    },
    "potsticker": {
      title: "Stuck on purpose",
      text: "Potstickers, guo tie, literally means \"pot stick.\" The dumplings are fried until their bottoms stick to the pan and turn golden, then steamed with a splash of water so the tops stay soft."
    },
    "wonton": {
      title: "Swallowing clouds",
      text: "In Cantonese, wonton is written 云吞, which reads as \"swallowing clouds,\" for the way the thin wrappers float in the broth like little clouds."
    },
    "egg-roll": {
      title: "A Chinese American original",
      text: "The egg roll is a Chinese American creation: a thicker, bubbly wrapper around pork and shredded vegetables, fried until it crackles. Its lighter, thinner cousin is the spring roll."
    },
    "spring-roll": {
      title: "Named for the new year",
      text: "Spring rolls are named for the Spring Festival, the Lunar New Year, when families eat them for luck. Golden and crisp, they're said to look like little bars of gold."
    },
    "hot-sour": {
      title: "Heat from pepper, tang from vinegar",
      text: "Hot and sour soup gets its heat from pepper and its tang from vinegar. It's a classic of northern China and Sichuan, and a good cure for a cold evening."
    },
    "egg-flower": {
      title: "Flowers in the bowl",
      text: "Egg flower soup is named for the way beaten egg blooms into soft ribbons, like petals, when it's stirred into hot broth. You may know it as egg drop soup."
    },
    "chow-mein": {
      title: "Chow mein, the old-school way",
      text: "Chow mein means \"stir-fried noodles.\" In many old-school Chinese American kitchens, it's a stir-fry of bean sprouts and vegetables in a light sauce, served over crispy noodles. Served over rice instead, it's chop suey, \"odds and ends,\" which was America's first Chinese food craze around 1900."
    },
    "subgum": {
      title: "A little of everything",
      text: "Subgum is Cantonese for \"assorted.\" A subgum dish trades a single star vegetable for a mix of diced ones; ours is built on celery."
    },
    "soft-chow-mein": {
      title: "Pan-fried noodles",
      text: "These are the noodles most people picture when they hear chow mein: soft noodles, pan-fried until they pick up a little crispness, then stir-fried with meat and vegetables."
    },
    "lo-mein": {
      title: "Tossed, not fried",
      text: "Lo mein means \"scooped noodles.\" The noodles are boiled soft and tossed with sauce, meat and vegetables, so they stay silky rather than crisp."
    },
    "fried-rice": {
      title: "Rested rice, a roaring wok",
      text: "Good fried rice starts with cooked rice that has rested and dried a little, so every grain fries on its own. Tossed in a very hot wok, it picks up a smoky edge Cantonese cooks call wok hei, \"the breath of the wok.\""
    },
    "foo-young": {
      title: "Hibiscus eggs",
      text: "Egg foo young is named for the hibiscus flower, fu rong, for its puffy golden edges. It's a Cantonese omelet that Chinese American kitchens top with a savory brown gravy."
    },
    "chow-don": {
      title: "Stir-fried eggs",
      text: "Chow don is Cantonese for \"stir-fried egg\": eggs scrambled soft and fast in a hot wok, folded together with meat or vegetables."
    },
    "sweet-sour": {
      title: "Sweet, sour and crisp",
      text: "Sweet and sour dishes come from Cantonese cooking: crisp battered pieces in a bright, glossy sauce that's sweet and tangy at once. Sweet and sour pork, gu lu rou, is one of the classics."
    },
    "kung-pao": {
      title: "Named for a governor",
      text: "Kung pao chicken is named after Ding Baozhen, a 19th-century governor of Sichuan whose official title was gongbao, \"palace guardian.\" The classic version pairs diced chicken with peanuts and chilies."
    },
    "moo-goo": {
      title: "Mushroom chicken slices",
      text: "Moo goo gai pan is simply Cantonese for \"mushroom chicken slices\": tender chicken with mushrooms and crisp vegetables in a light sauce. It's one of the gentlest dishes on the menu."
    },
    "lemon": {
      title: "A Hong Kong favorite",
      text: "Lemon chicken comes from Cantonese and Hong Kong cooking: a crisp fried cutlet with a sweet, bright lemon sauce."
    },
    "almond": {
      title: "A Chinese American classic",
      text: "Almond fried chicken is a Chinese American favorite: a crisp chicken cutlet under savory gravy, finished with almonds."
    },
    "orange": {
      title: "Inspired by tangerine peel",
      text: "Orange chicken is a modern Chinese American dish, a sweeter cousin of the tangerine-peel chicken cooked in Hunan and Sichuan."
    },
    "mongolian": {
      title: "Not from Mongolia",
      text: "Despite the name, Mongolian beef isn't from Mongolia. It grew out of the \"Mongolian barbecue\" restaurants of Taiwan and became a Chinese American staple."
    },
    "broccoli": {
      title: "A clever swap",
      text: "In China, this dish is made with gai lan, Chinese broccoli. Chinese American cooks swapped in Western broccoli, and a classic was born."
    },
    "chow-yuk": {
      title: "Stir-fried meat",
      text: "Chow yuk is Cantonese for \"stir-fried meat\": thin slices tossed fast in a hot wok with a mix of vegetables."
    },
    "happy-family": {
      title: "The whole family's good fortune",
      text: "Happy family, quan jia fu, means \"the whole family's good fortune.\" It brings shrimp, chicken and pork together on one plate, and it's a favorite for celebrations."
    },
    "mapo": {
      title: "Named for its cook",
      text: "Mapo tofu is named for a woman nicknamed Ma Po, who cooked it at her small restaurant in Chengdu in the 1800s. It's a Sichuan classic: soft tofu in a bold, spicy sauce."
    },
    "twice-cooked": {
      title: "Cooked twice",
      text: "Twice-cooked pork is a Sichuan home-cooking classic: the pork is cooked once, sliced, then stir-fried a second time in a spicy sauce."
    },
    "moo-shu": {
      title: "Roll your own",
      text: "Moo shu is a northern Chinese stir-fry of egg, vegetables and meat. Spread a little hoisin sauce on a thin pancake, add a spoonful of filling, roll it up and eat it by hand."
    },
    "family": {
      title: "Family style",
      text: "Chinese meals are served family style: the dishes go in the middle and everyone shares. These dinners do the ordering for you."
    },
    "combination": {
      title: "A little of everything",
      text: "The combination plate is a Chinese American tradition: several favorites together on one plate. It's the easiest way to find yours."
    },
    "curry": {
      title: "Cantonese curry",
      text: "Curry came into Cantonese cooking through Hong Kong and Southeast Asia. The Cantonese style is mild, golden and a little sweet."
    },
    "szechuan": {
      title: "From Sichuan",
      text: "Szechuan is the older spelling of Sichuan, the province in southwest China famous for bold, spicy food."
    },
    "hunan": {
      title: "From Hunan",
      text: "Hunan, the province next to Sichuan, is known for cooking with fresh peppers and plenty of heat."
    },
    "salt-pepper": {
      title: "Salt and pepper",
      text: "Jiao yan, \"salt and pepper,\" is a Cantonese way of frying: crisp pieces tossed with seasoned salt and pepper straight out of the wok."
    },
    "lobster-sauce": {
      title: "No lobster required",
      text: "There's no lobster in lobster sauce. It's the savory, garlicky sauce Cantonese cooks traditionally served with lobster, and it's just as good with shrimp."
    },
  }
};
})();
