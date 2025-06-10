import mongoose, { Schema } from "mongoose";

const videoSchema = new mongoose.Schema({
  title: String,
  videoUrl: String,
  duration: Number,
  videoType: {
    type: String,
    enum: ["upload", "youtube"],
    default: "upload",
  },
  youtubeId: String, // Store YouTube video ID for easier embedding
});

const sectionSchema = new mongoose.Schema({
  title: String,
  totalDuration: Number,
  videos: [videoSchema],
});

const courseSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    image: String,
    totalDuration: Number,
    track: { type: Schema.Types.ObjectId, ref: "Track", required: true },
    sections: [sectionSchema],
    ratings: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rate: Number,
      },
    ],
    enrolledUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Course", courseSchema);
