import mongoose, { Schema } from "mongoose";

const videoSchema = new mongoose.Schema({
  title: String,
  videoUrl: String,
  duration: Number,
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
