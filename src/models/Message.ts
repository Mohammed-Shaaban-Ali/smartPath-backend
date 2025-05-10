import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  sender: mongoose.Types.ObjectId;
  content: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    image: { type: String, default: null },
    content: {
      type: String,
      required: function (this: any) {
        return !this.image;
      },
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model<IMessage>("Message", MessageSchema);
export default Message;
