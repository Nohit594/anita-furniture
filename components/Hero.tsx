"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Sofa, Armchair, Bed } from "lucide-react";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-hero-gradient">
      {/* Floating decorative icons */}
      <motion.div
        className="pointer-events-none absolute left-[8%] top-24 text-terracotta/20"
        animate={{ y: [0, -16, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
      >
        <Sofa size={80} />
      </motion.div>
      <motion.div
        className="pointer-events-none absolute right-[10%] top-40 text-saddle/20"
        animate={{ y: [0, 18, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
      >
        <Armchair size={70} />
      </motion.div>
      <motion.div
        className="pointer-events-none absolute bottom-16 left-[18%] text-peach/40"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 4.5, repeat: Infinity }}
      >
        <Bed size={64} />
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative mx-auto flex max-w-4xl flex-col items-center px-6 py-28 text-center sm:py-36"
      >
        <motion.span
          variants={item}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-terracotta/30 bg-white/60 px-4 py-1.5 text-sm font-medium text-terracotta-dark backdrop-blur"
        >
          <Sparkles size={16} /> Custom furniture, your way
        </motion.span>

        <motion.h1
          variants={item}
          className="font-display text-5xl font-bold leading-tight sm:text-7xl"
        >
          Furniture that fits{" "}
          <span className="bg-warm-gradient bg-clip-text text-transparent">
            your story
          </span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-6 max-w-2xl text-lg text-espresso/75"
        >
          Upload a few photos, describe your dream piece by voice — in Hindi,
          English, or any language — and we&apos;ll craft it just for you. Or shop
          our ready-made collection.
        </motion.p>

        <motion.div variants={item} className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href="/custom-order" className="btn-primary">
            Design a custom piece <ArrowRight size={18} />
          </Link>
          <Link href="/catalogue" className="btn-ghost">
            Browse catalogue
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
