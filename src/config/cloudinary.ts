import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: "dwhzpccfb", // process.env.CLOUDINARY_CLOUD_NAME,
  api_key: "538121778672572", //process.env.CLOUDINARY_API_KEY,
  api_secret: "aZU0XkVHWlO62Cw8oqpE_jR5YVE", //process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;
