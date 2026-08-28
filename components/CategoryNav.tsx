"use client";

import Link from "next/link";
import { NAV_CATEGORIES } from "@/lib/categories";

export function CategoryNav() {
  return (
    <div className="hidden border-t border-sand/70 bg-cream/60 md:block">
      <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8">
        {NAV_CATEGORIES.map((cat) => {
          const isSale = cat === "Sale";
          return (
            <Link
              key={cat}
              href={`/catalogue?category=${encodeURIComponent(cat)}`}
              className={`relative whitespace-nowrap px-3 py-2.5 text-[13px] font-semibold transition-colors ${
                isSale
                  ? "text-red-600 hover:text-red-700"
                  : "text-espresso/75 hover:text-terracotta"
              }`}
            >
              {cat}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
