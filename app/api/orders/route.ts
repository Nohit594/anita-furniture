import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/lib/models/Order";
import { CatalogueItem } from "@/lib/models/CatalogueItem";
import { User } from "@/lib/models/User";
import { getSession } from "@/lib/session";

// GET /api/orders — admin sees all; customer sees their own
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const isAdmin = session.user.role === "admin";
  const filter: Record<string, unknown> = isAdmin
    ? {}
    : { userId: session.user.id };
  if (status && status !== "all") filter.status = status;

  const orders = await Order.find(filter)
    .populate("catalogueItemId", "name price images")
    .populate("userId", "name email image")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(orders);
}

// POST /api/orders — customer creates a custom or catalogue order
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const body = await req.json();

  if (body.type === "catalogue") {
    if (!body.catalogueItemId)
      return NextResponse.json(
        { error: "catalogueItemId required" },
        { status: 400 }
      );
    const item = await CatalogueItem.findById(body.catalogueItemId);
    if (!item)
      return NextResponse.json({ error: "Item not found" }, { status: 404 });

    // Catalogue orders have a fixed price and are ready to pay immediately.
    const order = await Order.create({
      userId: session.user.id,
      type: "catalogue",
      catalogueItemId: item._id,
      images: item.images,
      description: body.description || item.name,
      status: "customer_accepted",
      adminPrice: item.price,
      finalPrice: item.price,
    });
    return NextResponse.json(order, { status: 201 });
  }

  // Custom order: needs 2–3 images + a description
  const images: string[] = Array.isArray(body.images) ? body.images : [];
  if (images.length < 2) {
    return NextResponse.json(
      { error: "Please upload at least 2 images" },
      { status: 400 }
    );
  }
  if (!body.description || body.description.trim().length < 5) {
    return NextResponse.json(
      { error: "Please add a description of what you want" },
      { status: 400 }
    );
  }

  const order = await Order.create({
    userId: session.user.id,
    type: "custom",
    images: images.slice(0, 3),
    description: body.description.trim(),
    voiceLanguage: body.voiceLanguage || "en-IN",
    status: "pending",
  });

  return NextResponse.json(order, { status: 201 });
}
