import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { Order } from "@/lib/models/Order";
import { requireAdmin } from "@/lib/session";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await connectDB();

  const user = await User.findById(params.id).lean();
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const orderCount = await Order.countDocuments({ userId: params.id });
  const recentOrders = await Order.find({ userId: params.id })
    .sort({ createdAt: -1 })
    .limit(5)
    .select("status createdAt adminPrice type")
    .lean();

  return NextResponse.json({ ...user, orderCount, recentOrders });
}
