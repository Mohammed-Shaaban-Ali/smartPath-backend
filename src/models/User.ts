import mongoose, { Schema, Document } from "mongoose";

// Define the Progress interface
interface IProgress {
  course: mongoose.Types.ObjectId;
  watchedVideos: mongoose.Types.ObjectId[];
}

// Define the User interface
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  googleId?: string;
  password?: string;
  isVerified?: boolean;
  isVerifiedotp?: boolean;
  otp?: string;
  otpExpiration?: Date;
  avatar?: string; // Cloudinary Image URL

  enrolledCourses: mongoose.Types.ObjectId[];
  progress: IProgress[];
  createdAt: Date;
  updatedAt: Date;
}

// Progress Schema
const progressSchema = new mongoose.Schema<IProgress>({
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  watchedVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
});

// User Schema
const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
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
    avatar: {
      type: String,
      required: false,
      default:
        "https://cdn3d.iconscout.com/3d/premium/thumb/graduate-student-avatar-3d-icon-download-in-png-blend-fbx-gltf-file-formats--education-study-school-job-and-profession-pack-professionals-icons-7825922.png?f=webp",
    }, // Cloudinary Image URL
    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    progress: [progressSchema],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
