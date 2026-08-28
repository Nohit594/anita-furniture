import Link from "next/link";
import { connectDB } from "@/lib/db";
import { CatalogueItem } from "@/lib/models/CatalogueItem";
import { CatalogueCard } from "@/components/CatalogueCard";
import { PageTransition } from "@/components/PageTransition";
import { Hero } from "@/components/Hero";
import { PopularCategories } from "@/components/PopularCategories";
import { RegistrationPopup } from "@/components/RegistrationPopup";
import { Mic, Image as ImageIcon, ShieldCheck, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

async function getFeatured() {
  try {
    await connectDB();
    const items = await CatalogueItem.find({ isAvailable: true })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();
    return JSON.parse(JSON.stringify(items));
  } catch {
    return [];
  }
}

const steps = [
  {
    icon: ImageIcon,
    title: "Upload 2–3 photos",
    desc: "Share reference images of the furniture you imagine.",
  },
  {
    icon: Mic,
    title: "Describe by voice",
    desc: "Speak in Hindi, English, or any language — we understand.",
  },
  {
    icon: ShieldCheck,
    title: "Approve & pay",
    desc: "Admin reviews, sets a price, you accept or counter, then pay.",
  },
];

export default async function HomePage() {
  const featured = await getFeatured();

  return (
    <PageTransition>
      <Hero />

      <PopularCategories />

      <RegistrationPopup />

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            How custom orders work
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-espresso/70">
            From imagination to your living room in three simple steps.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.title} className="card group relative overflow-hidden">
              <div className="absolute -right-6 -top-6 text-8xl font-bold text-sand/60">
                {i + 1}
              </div>
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-warm-gradient text-white shadow-warm transition-transform group-hover:scale-110">
                  <s.icon size={26} />
                </div>
                <h3 className="mt-5 font-display text-xl font-bold">{s.title}</h3>
                <p className="mt-2 text-espresso/70">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/custom-order" className="btn-primary">
            Start a custom order <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Featured catalogue */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pb-20">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold sm:text-4xl">
                From the catalogue
              </h2>
              <p className="mt-2 text-espresso/70">
                Ready-to-order pieces, crafted with love.
              </p>
            </div>
            <Link
              href="/catalogue"
              className="hidden items-center gap-1 font-medium text-terracotta hover:gap-2 sm:flex"
            >
              View all <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((item: any) => (
              <CatalogueCard key={item._id} item={item} />
            ))}
          </div>
        </section>
      )}
    </PageTransition>
  );
}
