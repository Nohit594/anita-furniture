import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/lib/models/Order";
import { getSession } from "@/lib/session";
import { getRazorpay } from "@/lib/razorpay";

/**
 * Creates a Razorpay order for an internal order that is ready to pay.
 * The payable amount is the finalPrice (catalogue) or the accepted price.
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { orderId } = await req.json();
  const order = await Order.findById(orderId);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  if (order.userId.toString() !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const amount = order.finalPrice ?? order.adminPrice;
  if (!amount || amount <= 0)
    return NextResponse.json(
      { error: "This order has no payable price yet" },
      { status: 400 }
    );

  if (!["customer_accepted", "price_set"].includes(order.status))
    return NextResponse.json(
      { error: "Order is not ready for payment" },
      { status: 400 }
    );

  try {
    const rzp = getRazorpay();
    const rzpOrder = await rzp.orders.create({
      amount: Math.round(amount * 100), // paise
      currency: "INR",
      receipt: `order_${order._id}`,
      notes: { internalOrderId: order._id.toString() },
    });

    order.razorpayOrderId = rzpOrder.id;
    if (order.status === "price_set") {
      order.finalPrice = amount;
      order.status = "customer_accepted";
    }
    await order.save();

    return NextResponse.json({
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
    });
  } catch (err) {
    console.error("Razorpay create-order error:", err);
    return NextResponse.json(
      { error: "Could not create payment order" },
      { status: 500 }
    );
  }
}
