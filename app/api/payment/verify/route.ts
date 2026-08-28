import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { Order } from "@/lib/models/Order";
import { getSession } from "@/lib/session";

/**
 * Verifies the Razorpay payment signature and, if valid, marks the order paid.
 * Signature = HMAC_SHA256(razorpay_order_id + "|" + razorpay_payment_id, KEY_SECRET)
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const {
    orderId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = await req.json();

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expected !== razorpay_signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  await connectDB();
  const order = await Order.findById(orderId);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.userId.toString() !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  order.status = "paid";
  order.razorpayPaymentId = razorpay_payment_id;
  order.razorpayOrderId = razorpay_order_id;
  await order.save();

  return NextResponse.json({ success: true });
}
