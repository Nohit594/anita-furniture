import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/lib/models/Order";
import { User } from "@/lib/models/User";
import { CatalogueItem } from "@/lib/models/CatalogueItem";
import { requireAdmin } from "@/lib/session";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await connectDB();

  const [
    totalOrders,
    pending,
    paid,
    totalUsers,
    catalogueCount,
    revenueAgg,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ status: "pending" }),
    Order.countDocuments({ status: { $in: ["paid", "in_production", "completed"] } }),
    User.countDocuments(),
    CatalogueItem.countDocuments(),
    Order.aggregate([
      { $match: { status: { $in: ["paid", "in_production", "completed"] } } },
      { $group: { _id: null, total: { $sum: "$finalPrice" } } },
    ]),
  ]);

  return NextResponse.json({
    totalOrders,
    pending,
    paid,
    totalUsers,
    catalogueCount,
    revenue: revenueAgg[0]?.total ?? 0,
  });
}
