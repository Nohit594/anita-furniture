import mongoose, { Schema, models, model, Document, Types } from "mongoose";

export type UserRole = "customer" | "admin";

export interface IAddress {
  _id?: Types.ObjectId;
  label: string; // Home / Work / Other
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  lat?: number;
  lng?: number;
  isDefault: boolean;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string; // bcrypt hash; absent for Google-only accounts
  image?: string;
  role: UserRole;
  isActive: boolean;
  phone?: string;
  addresses: IAddress[];
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    label: { type: String, default: "Home" },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    lat: { type: Number },
    lng: { type: Number },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, select: false },
    image: { type: String },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    isActive: { type: Boolean, default: true },
    phone: { type: String },
    addresses: { type: [AddressSchema], default: [] },
  },
  { timestamps: true }
);

export const User = models.User || model<IUser>("User", UserSchema);
