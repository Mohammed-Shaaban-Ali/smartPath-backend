import mongoose, { Schema, Document } from "mongoose";

export interface IRoadmap extends Document {
  title: string;
  icon: string;
  link: string;
  Track: mongoose.Schema.Types.ObjectId; // Reference to Framework
  createdAt: Date;
  updatedAt: Date;
}

const RoadmapSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    icon: { type: String, required: false }, // Cloudinary Image URL
    link: { type: String, required: true }, // External roadmap link
    Track: {
      type: Schema.Types.ObjectId,
      ref: "Track",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IRoadmap>("Roadmap", RoadmapSchema);
