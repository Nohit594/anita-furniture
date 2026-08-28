import { Schema, models, model, Document, Types } from "mongoose";

export type OrderType = "custom" | "catalogue";

export type OrderStatus =
  | "pending" // customer submitted, awaiting admin review
  | "approved" // admin approved, no price yet
  | "rejected" // admin rejected
  | "price_set" // admin set a price, awaiting customer
  | "customer_accepted" // customer accepted price
  | "customer_countered" // customer proposed a different price
  | "paid" // payment completed
  | "in_production" // being manufactured
  | "completed"; // delivered / done

export interface IOrder extends Document {
  userId: Types.ObjectId;
  type: OrderType;
  catalogueItemId?: Types.ObjectId;
  images: string[]; // freeimage.host CDN URLs
  description: string;
  voiceLanguage?: string; // e.g. 'hi-IN', 'en-IN'
  status: OrderStatus;
  adminPrice?: number;
  customerCounterPrice?: number;
  finalPrice?: number;
  adminNotes?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["custom", "catalogue"], required: true },
    catalogueItemId: { type: Schema.Types.ObjectId, ref: "CatalogueItem" },
    images: { type: [String], default: [] },
    description: { type: String, default: "" },
    voiceLanguage: { type: String },
    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "price_set",
        "customer_accepted",
        "customer_countered",
        "paid",
        "in_production",
        "completed",
      ],
      default: "pending",
      index: true,
    },
    adminPrice: { type: Number },
    customerCounterPrice: { type: Number },
    finalPrice: { type: Number },
    adminNotes: { type: String },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
  },
  { timestamps: true }
);

export const Order = models.Order || model<IOrder>("Order", OrderSchema);
