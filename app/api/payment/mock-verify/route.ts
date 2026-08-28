import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/lib/models/Order";
import { getSession } from "@/lib/session";

// Only active when NEXT_PUBLIC_MOCK_PAYMENTS=true
export async function POST(req: NextRequest) {
  if (process.env.NEXT_PUBLIC_MOCK_PAYMENTS !== "true") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  const session = await getSession();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { orderId, razorpayOrderId } = await req.json();

  if (!razorpayOrderId?.startsWith("mock_order_")) {
    return NextResponse.json({ error: "Invalid mock order" }, { status: 400 });
  }

  const order = await Order.findById(orderId);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.userId.toString() !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  order.status = "paid";
  order.razorpayPaymentId = `mock_pay_${Date.now()}`;
  await order.save();

  return NextResponse.json({ success: true });
}
