import mongoose, { Schema, Document } from "mongoose";

export interface IGroup extends Document {
  name: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const GroupSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  }
);

const Group = mongoose.model<IGroup>("Group", GroupSchema);
export default Group;
