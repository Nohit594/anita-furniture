import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/lib/models/Order";
import Payment from "@/lib/models/Payment";
import { getSession } from "@/lib/session";

/**
 * Records a FAILED payment attempt on the customer side.
 * Called from the frontend when the gateway reports payment.failed.
 * Does not change the order status — the order stays payable so the
 * customer can retry.
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { orderId, reason, razorpayOrderId, razorpayPaymentId } =
    await req.json();

  const order = await Order.findById(orderId);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.userId.toString() !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await Payment.create({
    userId: order.userId,
    orderId: order._id,
    razorpayOrderId: razorpayOrderId ?? order.razorpayOrderId,
    razorpayPaymentId,
    amount: order.finalPrice ?? order.adminPrice ?? 0,
    status: "failed",
    reason: typeof reason === "string" ? reason.slice(0, 200) : "Payment failed",
  });

  return NextResponse.json({ success: true });
}
