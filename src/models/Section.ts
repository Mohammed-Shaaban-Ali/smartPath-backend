import mongoose, { Schema, Document } from "mongoose";

export interface ISection extends Document {
  title: string;
  icon: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

const SectionSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    icon: { type: String, required: true },
    body: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ISection>("Section", SectionSchema);
