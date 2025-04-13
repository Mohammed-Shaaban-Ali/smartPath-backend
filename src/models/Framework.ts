import mongoose, { Schema, Document } from "mongoose";

export interface IFramework extends Document {
  title: string;
  icon: string;
  icon3D: string;
  body: string;
  track: mongoose.Schema.Types.ObjectId; // Reference to Track
}

const FrameworkSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    icon: { type: String, required: false }, // Cloudinary Image URL
    icon3D: { type: String, required: false }, // 3D Icon URL (optional)
    body: { type: String, required: true },
    track: { type: Schema.Types.ObjectId, ref: "Track", required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IFramework>("Framework", FrameworkSchema);
