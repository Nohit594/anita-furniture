/**
 * Seed script — populates the catalogue with sample furniture items.
 *
 * Usage:
 *   1. Ensure .env.local has MONGODB_URI set
 *   2. npm run seed
 */
import "dotenv/config";
import mongoose from "mongoose";
import { CatalogueItem } from "../lib/models/CatalogueItem";

const SAMPLE_ITEMS = [
  {
    name: "Teak Wood Coffee Table",
    description:
      "Handcrafted solid teak coffee table with a natural matte finish. Perfect centrepiece for a modern living room.",
    price: 18999,
    category: "Tables",
    images: ["https://images.unsplash.com/photo-1499933374294-4584851497cc?w=800"],
    isAvailable: true,
  },
  {
    name: "Velvet Accent Armchair",
    description:
      "Plush velvet armchair with solid wood legs. Available in warm terracotta tones.",
    price: 24999,
    category: "Seating",
    images: ["https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800"],
    isAvailable: true,
  },
  {
    name: "Rustic Oak Bookshelf",
    description:
      "Five-tier oak bookshelf with an open-back design. Sturdy, spacious, and timeless.",
    price: 31500,
    category: "Storage",
    images: ["https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800"],
    isAvailable: true,
  },
  {
    name: "Minimalist Platform Bed",
    description:
      "Low-profile queen platform bed in walnut. Clean lines for a serene bedroom.",
    price: 42999,
    category: "Bedroom",
    images: ["https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800"],
    isAvailable: true,
  },
  {
    name: "Cane & Wood Dining Chair",
    description:
      "Elegant dining chair blending natural cane weave with a sheesham wood frame.",
    price: 8999,
    category: "Seating",
    images: ["https://images.unsplash.com/photo-1503602642458-232111445657?w=800"],
    isAvailable: true,
  },
  {
    name: "Industrial TV Console",
    description:
      "Mango wood and black metal TV console with two drawers and open shelving.",
    price: 27500,
    category: "Storage",
    images: ["https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800"],
    isAvailable: true,
  },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI not set. Add it to .env.local");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("✅ Connected to MongoDB");

  await CatalogueItem.deleteMany({});
  console.log("🧹 Cleared existing catalogue items");

  await CatalogueItem.insertMany(SAMPLE_ITEMS);
  console.log(`🌱 Inserted ${SAMPLE_ITEMS.length} catalogue items`);

  await mongoose.disconnect();
  console.log("👋 Done. Log in with your ADMIN_EMAIL to manage the store.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
