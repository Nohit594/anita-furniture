import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/lib/models/Order";
import { getSession } from "@/lib/session";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const order = await Order.findById(params.id)
    .populate("catalogueItemId", "name price images")
    .populate("userId", "name email image")
    .lean();

  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isAdmin = session.user.role === "admin";
  const ownerId = (order as any).userId?._id?.toString();
  if (!isAdmin && ownerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(order);
}

/**
 * PATCH handles the full negotiation workflow via an `action` field.
 *
 * Admin actions: approve | reject | set_price | respond_counter | set_status
 * Customer actions: accept_price | counter
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const order = await Order.findById(params.id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isAdmin = session.user.role === "admin";
  const isOwner = order.userId.toString() === session.user.id;
  const { action, price, notes } = await req.json();

  // ─── Admin actions ───────────────────────────────
  if (isAdmin) {
    switch (action) {
      case "approve":
        order.status = "approved";
        if (notes != null) order.adminNotes = notes;
        break;
      case "reject":
        order.status = "rejected";
        if (notes != null) order.adminNotes = notes;
        break;
      case "set_price":
        if (price == null)
          return NextResponse.json({ error: "Price required" }, { status: 400 });
        order.adminPrice = Number(price);
        order.status = "price_set";
        if (notes != null) order.adminNotes = notes;
        break;
      case "respond_counter":
        // Admin agrees to (or adjusts to) a new price after customer counter
        if (price == null)
          return NextResponse.json({ error: "Price required" }, { status: 400 });
        order.adminPrice = Number(price);
        order.status = "price_set";
        if (notes != null) order.adminNotes = notes;
        break;
      case "set_status":
        order.status = notes; // notes carries the new status value here
        break;
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
    await order.save();
    return NextResponse.json(order);
  }

  // ─── Customer actions ────────────────────────────
  if (isOwner) {
    switch (action) {
      case "accept_price":
        if (order.status !== "price_set")
          return NextResponse.json(
            { error: "No price to accept" },
            { status: 400 }
          );
        order.finalPrice = order.adminPrice;
        order.status = "customer_accepted";
        break;
      case "counter":
        if (price == null)
          return NextResponse.json({ error: "Price required" }, { status: 400 });
        order.customerCounterPrice = Number(price);
        order.status = "customer_countered";
        break;
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
    await order.save();
    return NextResponse.json(order);
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (session?.user?.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await connectDB();
  await Order.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true });
}
