import mongoose, { Schema, Document } from "mongoose";

export interface IBlog extends Document {
  title: string;
  image: string;
  body: string;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    image: { type: String, required: false }, // Cloudinary Image URL
    body: { type: String, required: true },
    views: { type: Number, default: 0 }, // Tracks blog views
  },
  { timestamps: true }
);

export default mongoose.model<IBlog>("Blog", BlogSchema);
