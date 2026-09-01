import mongoose, { Schema, model, models } from "mongoose";

export type PaymentStatus = "success" | "failed";

export interface IPayment {
  _id: string;
  userId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  amount: number; // in rupees
  currency: string;
  status: PaymentStatus;
  method?: string;
  reason?: string; // failure reason
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: { type: String, enum: ["success", "failed"], required: true },
    method: { type: String },
    reason: { type: String },
  },
  { timestamps: true }
);

const Payment = models.Payment || model<IPayment>("Payment", PaymentSchema);

export default Payment;
