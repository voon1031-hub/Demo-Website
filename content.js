/*
  ══════════════════════════════════════════════════════════════════
  ★ THE LITTLE STORE — everything you edit lives in this file ★

  Both pages (index.html = café menu, flowers.html = flowers) are
  built from the three blocks below, so a new price, a new dish or
  new hours only ever needs a change here.

  STORE    shop details: address, phone, hours, order links.
           hours.days uses 0 = Sunday … 6 = Saturday; open/close are
           24-hour times in the shop's own time zone. The "Open now"
           line and the marigold next to it follow these.
  MENU     the café menu, top to bottom. Each section becomes one
           button in the section bar. A section holds groups; a group
           title is optional (leave it out and the dishes sit straight
           under the section title).
           Dish fields:
             name   shown as written
             price  a number: 17 shows as 17, 4.5 shows as 4.50
             desc   optional, the line under the name
             tags   optional, ["gf"] adds a "gluten-free" mark
           extras are the "+ avocado 3" add-ons shown under a section.
  FLOWERS  the flowers page: intro line and the three product rows.
           Photos live in assets/flowers/ (square images). "from: true"
           puts "From" before the price, "per" adds "a week" / "a month",
           and "cta" is the wording of the order button or label.
  ══════════════════════════════════════════════════════════════════
*/

window.STORE = {
  name: "The Little Store",
  street: "3340 Woodside Road",
  city: "Woodside",
  region: "CA",
  mapLink: "https://www.google.com/maps/search/?api=1&query=The+Little+Store+3340+Woodside+Road+Woodside+CA",
  phone: "(650) 332-8885",
  phoneLink: "+16503328885",
  email: "hello@thelittlestorewoodside.com",
  flowersEmail: "flowers@thelittlestorewoodside.com",
  instagram: "thelittlestore_ws",
  timeZone: "America/Los_Angeles",
  hours: { days: [0, 1, 2, 3, 4, 5, 6], open: "08:00", close: "15:00" },
  orderFood: "https://www.toasttab.com/local/order/marigold-3340-woodside-road",
  orderFlowers: "https://www.thelittlestorewoodside.com/flowers"
};

window.MENU = [
  {
    id: "all-day",
    title: "All day",
    groups: [
      {
        title: "Eggs",
        items: [
          { name: "Burrito", price: 17, desc: "scrambled eggs, tater tots, Oaxaca cheese, chipotle crema, peppers, onions, black beans, salsa macha, bacon" },
          { name: "Little Breakfast", price: 12, desc: "sourdough toast, avocado, scrambled eggs" },
          { name: "Breakfast Sandwich", price: 17, desc: "buttermilk biscuit, Hook’s 5-year cheddar, herb aioli, scrambled egg and your choice of protein" },
          { name: "The Rancher", price: 18, tags: ["gf"], desc: "roasted potatoes, bacon lardons, mushrooms, asparagus, herbs and sherry vinaigrette, fried egg" }
        ]
      },
      {
        title: "Toast",
        items: [
          { name: "Avocado Toast", price: 14, desc: "whipped avocado mousse, feta, Castelvetrano olives, preserved lemon, spiced pepitas" },
          { name: "French Toast", price: 14, desc: "sourdough, mascarpone, compote + granola" },
          { name: "Butter + Jam", price: 8, desc: "whipped butter, seasonal jam, Maldon salt" },
          { name: "Nutella + Banana", price: 8 }
        ]
      },
      {
        title: "Bowls",
        items: [
          { name: "Yogurt Bowl", price: 12, desc: "seasonal jam + fruit, housemade granola, bee pollen" },
          { name: "Grain Bowl", price: 15, desc: "herbed farro, roasted Thumbelina carrots, hummus, hazelnuts, blood orange, herbed yogurt and yuzu vinaigrette" }
        ]
      }
    ],
    extras: [
      { name: "soft-boiled egg", price: 2 },
      { name: "avocado", price: 3 },
      { name: "bacon", price: 4 }
    ]
  },
  {
    id: "sandwiches",
    title: "Sandwiches",
    groups: [
      {
        items: [
          { name: "Chicken Club", price: 18, desc: "housemade focaccia, roasted chicken, Hobbs’ bacon, toma, winter romesco, arugula, pickled onion" },
          { name: "BLT", price: 18, desc: "toasted marble rye, Journeyman bacon, fresh tomatoes, romaine, herb aioli" },
          { name: "Grilled Cheese", price: 16, desc: "Grand Cru Gruyère, caramelized leek, cowboy candy" },
          { name: "Ham and Cheese", price: 16, desc: "marble rye, thin-sliced ham, cacio de roma provolone, red onion agrodolce, house pickles, Cape Cod potato chips, dijonnaise" },
          { name: "Barbecue Tri-Tip", price: 26, desc: "smoked Akaushi Wagyu tri-tip, pickled tomatoes, romaine, herb aioli" }
        ]
      }
    ]
  },
  {
    id: "salads",
    title: "Salads",
    groups: [
      {
        items: [
          { name: "The Little Gem Caesar", price: 18, desc: "herbed croutons, parmigiano, pecans, miso caesar dressing" },
          { name: "Kale Chicken Salad", price: 18, desc: "almond butter dressing, roasted Mary’s chicken, satsuma mandarin, lime, cilantro" },
          { name: "Chopped Cobb", price: 22, desc: "romaine hearts, cherry tomatoes, feta, pickled shallot, bacon, soft-boiled egg, avocado, lemon-dijon dressing" }
        ]
      }
    ],
    extras: [
      { name: "roasted chicken", price: 6 },
      { name: "soft-boiled egg", price: 4 },
      { name: "avocado", price: 3 }
    ]
  },
  {
    id: "coffee",
    title: "Coffee",
    groups: [
      {
        title: "Espresso",
        items: [
          { name: "Espresso", price: 4.5 },
          { name: "Espresso con panna", price: 5 },
          { name: "Macchiato", price: 5 },
          { name: "Cappuccino", price: 5.5 },
          { name: "Latte", price: 6 },
          { name: "Mocha", price: 7, desc: "with Guittard chocolate" }
        ]
      },
      {
        title: "Brewed",
        items: [
          { name: "Drip", price: 4, desc: "rotating single origin from Heart Coffee" },
          { name: "Cold Brew", price: 5 }
        ]
      },
      {
        title: "Seasonal",
        items: [
          { name: "Rose Vanilla Bean Latte", price: 7.25 },
          { name: "Honeysuckle Latte", price: 7.25, desc: "honeysuckle syrup, espresso" }
        ]
      }
    ]
  },
  {
    id: "tea",
    title: "Tea",
    groups: [
      {
        items: [
          { name: "Matcha", price: 7 },
          { name: "Lavender Matcha", price: 7.5 },
          { name: "Chai Tea Latte", price: 6 },
          { name: "Hot Tea", price: 4, desc: "English Breakfast, Vanilla Comoro, Lemon Ginger or Hibiscus" },
          { name: "Black Iced Tea", price: 4 },
          { name: "Arnold Palmer", price: 4 }
        ]
      }
    ]
  }
];

window.FLOWERS = {
  intro: "Seasonal flowers from local farms and the San Francisco Flower Market.",
  sections: [
    {
      id: "bouquets",
      title: "Wrapped bouquet",
      layout: "feature",
      items: [
        { name: "Wrapped Bouquet", price: 75, from: true, cta: "Order a bouquet", img: "assets/flowers/wrapped-bouquet.webp", alt: "A wrapped bouquet of peach roses, red poppies and greenery in kraft paper" }
      ]
    },
    {
      id: "vases",
      title: "Vase arrangements",
      layout: "grid",
      kind: "vase arrangement",
      items: [
        { name: "Small", price: 150, img: "assets/flowers/vase-small.webp", alt: "Small vase arrangement in peach and orange on a white pedestal" },
        { name: "Medium", price: 225, img: "assets/flowers/vase-medium.webp", alt: "Close-up of peach and blush blooms from a medium vase arrangement" },
        { name: "Large", price: 300, img: "assets/flowers/vase-large.webp", alt: "Large vase arrangement in coral, peach and blue on a white pedestal" },
        { name: "Grand", price: 385, img: "assets/flowers/vase-grand.webp", alt: "Grand vase arrangement of pale yellow and peach blooms on a white pedestal" }
      ]
    },
    {
      id: "subscriptions",
      title: "Subscriptions",
      layout: "row",
      kind: "floral subscription",
      items: [
        { name: "Weekly", price: 150, from: true, per: "week", cta: "Subscribe", img: "assets/flowers/weekly-subscription.webp", alt: "Arrangement of pale yellow and peach blooms on a white pedestal" },
        { name: "Monthly", price: 150, from: true, per: "month", cta: "Subscribe", img: "assets/flowers/monthly-subscription.webp", alt: "Arrangement of pale yellow and peach blooms on a white pedestal" }
      ]
    }
  ]
};
