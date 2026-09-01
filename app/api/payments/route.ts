import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Payment from "@/lib/models/Payment";
import { Order } from "@/lib/models/Order";
import { CatalogueItem } from "@/lib/models/CatalogueItem";
import { getSession } from "@/lib/session";

/**
 * GET /api/payments
 * Customer → own transactions (success + failed).
 * Admin    → all transactions.
 */
export async function GET(_req: NextRequest) {
  const session = await getSession();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  // Ensure referenced models are registered for populate()
  void Order;
  void CatalogueItem;

  const isAdmin = session.user.role === "admin";
  const filter = isAdmin ? {} : { userId: session.user.id };

  const payments = await Payment.find(filter)
    .sort({ createdAt: -1 })
    .populate({
      path: "orderId",
      select: "type description catalogueItemId",
      populate: { path: "catalogueItemId", select: "name" },
    })
    .lean();

  return NextResponse.json(payments);
}
