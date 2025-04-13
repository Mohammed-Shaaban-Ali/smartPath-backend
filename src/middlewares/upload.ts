import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";

// Configure Multer to use Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const allowedFormats = ["jpg", "jpeg", "png", "webp", "gif"];
    const fileFormat = file.mimetype.split("/")[1]; // Extract file format

    if (!allowedFormats.includes(fileFormat)) {
      throw new Error(
        "Invalid file format. Only JPG, PNG, WEBP, and GIF are allowed."
      );
    }

    return {
      folder: "sections", // Cloudinary folder name
      format: fileFormat, // Use the detected file format
      resource_type: "image", // Ensure it's an image
      public_id: `${Date.now()}-${file.originalname.replace(/\s/g, "-")}`, // Unique filename
      transformation: [{ quality: "auto", fetch_format: "auto" }], // Optimize images
    };
  },
});

// Multer middleware with limits (max file size 5MB)
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only JPG, PNG, WEBP, and GIF are allowed."
        )
      );
    }
  },
});

export default upload;
