import { connectDB } from "@/lib/db";
import { CatalogueItem } from "@/lib/models/CatalogueItem";
import { PageTransition } from "@/components/PageTransition";
import { CatalogueDetail } from "@/components/CatalogueDetail";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

async function getItem(id: string) {
  try {
    await connectDB();
    const item = await CatalogueItem.findById(id).lean();
    if (!item) return null;
    return JSON.parse(JSON.stringify(item));
  } catch {
    return null;
  }
}

export default async function CatalogueItemPage({
  params,
}: {
  params: { id: string };
}) {
  const item = await getItem(params.id);
  if (!item) notFound();

  return (
    <PageTransition>
      <CatalogueDetail item={item} />
    </PageTransition>
  );
}
