"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";

export function PopularCategories() {
  const [expanded, setExpanded] = useState(true);
  const visible = expanded ? CATEGORIES : CATEGORIES.slice(0, 6);

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="flex flex-col items-center">
        <h2 className="text-center font-display text-3xl font-bold text-espresso sm:text-4xl">
          Popular Categories
        </h2>
        <button
          onClick={() => setExpanded((e) => !e)}
          className="mt-4 flex h-9 w-9 items-center justify-center rounded-full border border-sand bg-white text-terracotta shadow-sm transition hover:shadow-warm"
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      <motion.div
        layout
        className="mt-10 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-6"
      >
        <AnimatePresence>
          {visible.map((cat, i) => (
            <motion.div
              key={cat.slug}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: (i % 6) * 0.04 }}
            >
              <Link
                href={`/catalogue?category=${encodeURIComponent(cat.name)}`}
                className="group block cursor-pointer"
              >
                <div className="overflow-hidden rounded-lg bg-sand">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cat.image}
                    alt={cat.name}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover transition-transform duration-300 ease-out group-hover:scale-110"
                  />
                </div>
                <p className="mt-2.5 text-center text-sm font-medium text-espresso/80 transition-colors group-hover:text-terracotta">
                  {cat.name}
                </p>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
