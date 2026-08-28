"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";
import { ArrowUpRight, ImageOff } from "lucide-react";

interface Item {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
}

export function CatalogueCard({ item }: { item: Item }) {
  const cover = item.images?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <Link
        href={`/catalogue/${item._id}`}
        className="group block overflow-hidden rounded-3xl border border-sand bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-terracotta/40 hover:shadow-warm-lg"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-sand">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              alt={item.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-espresso/30">
              <ImageOff size={40} />
            </div>
          )}
          <span className="absolute left-3 top-3 rounded-full bg-cream/90 px-3 py-1 text-xs font-semibold text-terracotta-dark backdrop-blur">
            {item.category}
          </span>
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-lg font-bold leading-snug">
              {item.name}
            </h3>
            <ArrowUpRight
              className="shrink-0 text-terracotta opacity-0 transition-opacity group-hover:opacity-100"
              size={20}
            />
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-espresso/60">
            {item.description}
          </p>
          <p className="mt-3 text-xl font-bold text-terracotta">
            {formatCurrency(item.price)}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
