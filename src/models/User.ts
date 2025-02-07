import mongoose, { Schema, Document } from "mongoose";

// Define the interface
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  facebookId?: string;
  googleId?: string;
  password?: string;
  isVerified?: boolean;
  isVerifiedotp?: boolean;
  otp?: string;
  otpExpiration?: Date;
  updatedAt: Date;
  createdAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    facebookId: {
      type: String,
      unique: true,
      sparse: true,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
    isVerifiedotp: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
    },
    otpExpiration: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);
const User = mongoose.model<IUser>("User", UserSchema);
export default User;
