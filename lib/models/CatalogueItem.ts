import { Schema, models, model, Document } from "mongoose";

export interface ICatalogueItem extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[]; // freeimage.host CDN URLs
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CatalogueItemSchema = new Schema<ICatalogueItem>(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    category: { type: String, default: "General", index: true },
    images: { type: [String], default: [] },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const CatalogueItem =
  models.CatalogueItem || model<ICatalogueItem>("CatalogueItem", CatalogueItemSchema);
