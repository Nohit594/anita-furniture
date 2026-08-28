import { connectDB } from "@/lib/db";
import { CatalogueItem } from "@/lib/models/CatalogueItem";
import { CatalogueCard } from "@/components/CatalogueCard";
import { PageTransition } from "@/components/PageTransition";
import { Sofa } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getItems(category?: string) {
  try {
    await connectDB();
    const filter: Record<string, unknown> = { isAvailable: true };
    if (category) {
      // Forgiving match against either the category or the item name
      const rx = new RegExp(category.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ category: rx }, { name: rx }];
    }
    const items = await CatalogueItem.find(filter).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(items));
  } catch {
    return [];
  }
}

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const category = searchParams.category;
  const items = await getItems(category);

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-6 py-14">
        <header className="text-center">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">
            {category || "Our Catalogue"}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-espresso/70">
            {category
              ? `Showing pieces in "${category}".`
              : "Curated pieces ready to order. Found something you love? Order it in a tap."}
          </p>
          {category && (
            <Link
              href="/catalogue"
              className="mt-3 inline-block text-sm font-medium text-terracotta hover:underline"
            >
              ← View all categories
            </Link>
          )}
        </header>

        {items.length === 0 ? (
          <div className="mt-16 flex flex-col items-center rounded-3xl border border-dashed border-sand py-20 text-center">
            <Sofa className="text-terracotta/40" size={56} />
            <p className="mt-4 text-lg font-medium">
              {category ? "Nothing here yet" : "No items yet"}
            </p>
            <p className="text-espresso/60">
              {category
                ? "We don't have pieces in this category right now — start a custom order instead."
                : "Check back soon — or start a custom order instead."}
            </p>
            <Link href="/custom-order" className="btn-primary mt-6">
              Start a custom order
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item: any) => (
              <CatalogueCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
