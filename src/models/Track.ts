import mongoose, { Schema, Document } from "mongoose";

export interface ITrack extends Document {
  title: string;
  icon: string;
  icon3D: string;
  body: string;
  sectionId: mongoose.Types.ObjectId;
}

const TrackSchema: Schema = new Schema({
  title: { type: String, required: true },
  icon: { type: String, required: true },
  icon3D: { type: String, required: true },
  body: { type: String, required: true },
  sectionId: { type: Schema.Types.ObjectId, ref: "Section", required: true },
});

export default mongoose.model<ITrack>("Track", TrackSchema);
