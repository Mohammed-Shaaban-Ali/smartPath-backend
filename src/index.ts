import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./app";
import AppError from "./utils/app-error.util";
// const cloudinary = require("cloudinary").v2;

dotenv.config();
const PORT = process.env.PORT as string;
const MONGO_URI = process.env.MONGO_URI as string;

// cloudinary configuration
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });
// DB connection
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("DB is connected"))
  .catch(() => {
    throw new AppError("DB Can't connect", 500);
  });

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
