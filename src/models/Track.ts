import mongoose, { Schema, Document } from "mongoose";

export interface ITrack extends Document {
  title: string;
  icon: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

const TrackSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    icon: { type: String, required: true },
    body: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ITrack>("Track", TrackSchema);
