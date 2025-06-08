import mongoose, { Schema, Document } from "mongoose";

export interface ITrack extends Document {
  title: string;
  icon: string;
  icon3D: string;
  body: string;
  sectionId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TrackSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    icon: { type: String, required: true },
    icon3D: { type: String, required: true },
    body: { type: String, required: true },
    section: { type: Schema.Types.ObjectId, ref: "Section", required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ITrack>("Track", TrackSchema);
