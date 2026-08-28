import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { CatalogueItem } from "@/lib/models/CatalogueItem";
import { requireAdmin } from "@/lib/session";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectDB();
  const item = await CatalogueItem.findById(params.id).lean();
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await connectDB();
  const body = await req.json();
  const item = await CatalogueItem.findByIdAndUpdate(
    params.id,
    {
      ...(body.name != null && { name: body.name }),
      ...(body.description != null && { description: body.description }),
      ...(body.price != null && { price: Number(body.price) }),
      ...(body.category != null && { category: body.category }),
      ...(body.images != null && { images: body.images }),
      ...(body.isAvailable != null && { isAvailable: body.isAvailable }),
    },
    { new: true }
  );
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await connectDB();
  await CatalogueItem.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true });
}
