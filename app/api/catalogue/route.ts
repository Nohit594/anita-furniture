import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { CatalogueItem } from "@/lib/models/CatalogueItem";
import { requireAdmin } from "@/lib/session";

// GET /api/catalogue — public list of available items (or all, for admin)
export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const all = searchParams.get("all") === "true";
  const category = searchParams.get("category");

  const filter: Record<string, unknown> = all ? {} : { isAvailable: true };
  if (category && category !== "All") filter.category = category;

  const items = await CatalogueItem.find(filter).sort({ createdAt: -1 }).lean();
  return NextResponse.json(items);
}

// POST /api/catalogue — admin creates a new catalogue item
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await connectDB();
  const body = await req.json();

  if (!body.name || body.price == null) {
    return NextResponse.json(
      { error: "Name and price are required" },
      { status: 400 }
    );
  }

  const item = await CatalogueItem.create({
    name: body.name,
    description: body.description || "",
    price: Number(body.price),
    category: body.category || "General",
    images: Array.isArray(body.images) ? body.images : [],
    isAvailable: body.isAvailable ?? true,
  });

  return NextResponse.json(item, { status: 201 });
}
