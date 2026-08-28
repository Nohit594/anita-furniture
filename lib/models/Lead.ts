import { Schema, models, model, Document } from "mongoose";

export interface ILead extends Document {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  city: string;
  pincode: string;
  interests: string[]; // e.g. Living Room, Bedroom, Dining Room
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, default: "" },
    email: { type: String, required: true, index: true },
    mobile: { type: String, required: true },
    city: { type: String, default: "" },
    pincode: { type: String, default: "" },
    interests: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Lead = models.Lead || model<ILead>("Lead", LeadSchema);
