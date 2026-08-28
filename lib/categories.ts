export interface Category {
  name: string;
  slug: string;
  image: string;
}

/**
 * Popular furniture categories shown on the home page grid.
 * Images are royalty-free Unsplash photos.
 */
export const CATEGORIES: Category[] = [
  { name: "Leather Sofas", slug: "leather-sofas", image: "https://images.unsplash.com/photo-1550254478-ead40cc54513?w=600&q=80" },
  { name: "Fabric Sofas", slug: "fabric-sofas", image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600&q=80" },
  { name: "Recliners", slug: "recliners", image: "https://images.unsplash.com/photo-1519947486511-46149fa0a254?w=600&q=80" },
  { name: "Dining Sets", slug: "dining-sets", image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&q=80" },
  { name: "Beds", slug: "beds", image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80" },
  { name: "Office Chairs", slug: "office-chairs", image: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=600&q=80" },
  { name: "Coffee Tables", slug: "coffee-tables", image: "https://images.unsplash.com/photo-1499933374294-4584851497cc?w=600&q=80" },
  { name: "Living Chairs", slug: "living-chairs", image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&q=80" },
  { name: "Dining Chairs", slug: "dining-chairs", image: "https://images.unsplash.com/photo-1503602642458-232111445657?w=600&q=80" },
  { name: "Bedside Tables", slug: "bedside-tables", image: "https://images.unsplash.com/photo-1532323544230-7191fd51bc1b?w=600&q=80" },
  { name: "Desks", slug: "desks", image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&q=80" },
  { name: "TV Units", slug: "tv-units", image: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600&q=80" },
  { name: "Shoe Racks", slug: "shoe-racks", image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600&q=80" },
  { name: "Study Tables", slug: "study-tables", image: "https://images.unsplash.com/photo-1544457070-4cd773b4d71e?w=600&q=80" },
  { name: "Wardrobes", slug: "wardrobes", image: "https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=600&q=80" },
  { name: "Bookshelves", slug: "bookshelves", image: "https://images.unsplash.com/photo-1594620302200-9a762244a156?w=600&q=80" },
  { name: "Side Tables", slug: "side-tables", image: "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=600&q=80" },
  { name: "Storage", slug: "storage", image: "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=600&q=80" },
];

/** Top-level menu categories for the secondary nav bar. */
export const NAV_CATEGORIES = [
  "Living",
  "Dining",
  "Bedroom",
  "Sofas",
  "Storage",
  "Office",
  "New Arrivals",
  "Modular Kitchen",
  "Modular Wardrobe",
  "Sale",
];
