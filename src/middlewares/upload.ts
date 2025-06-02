import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";

// Storage for images
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const allowedFormats = ["jpg", "jpeg", "png", "webp", "gif"];
    const fileFormat = file.mimetype.split("/")[1];

    if (!allowedFormats.includes(fileFormat)) {
      throw new Error(
        "Invalid image format. Only JPG, PNG, WEBP, and GIF are allowed."
      );
    }

    return {
      folder: "sections",
      format: fileFormat,
      resource_type: "image",
      public_id: `${Date.now()}-${file.originalname.replace(/\s/g, "-")}`,
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    };
  },
});

// Storage for videos
const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const allowedFormats = ["mp4", "mov", "avi", "mkv"];
    const fileFormat = file.mimetype.split("/")[1];

    if (!allowedFormats.includes(fileFormat)) {
      throw new Error(
        "Invalid video format. Only MP4, MOV, AVI, and MKV are allowed."
      );
    }

    return {
      folder: "course_videos",
      resource_type: "video",
      public_id: `${Date.now()}-${file.originalname.replace(/\s/g, "-")}`,
    };
  },
});

// Multer middleware for images (5MB)
export const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
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
          "Invalid image type. Only JPG, PNG, WEBP, and GIF are allowed."
        )
      );
    }
  },
});

// Multer middleware for videos (500MB)
export const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "video/mp4",
      "video/quicktime",
      "video/x-msvideo",
      "video/x-matroska",
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid video type. Only MP4, MOV, AVI, and MKV are allowed."
        )
      );
    }
  },
});
export const uploadAny = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
      const isImage = file.mimetype.startsWith("image/");
      const isVideo = file.mimetype.startsWith("video/");

      if (isImage) {
        const allowedFormats = ["jpg", "jpeg", "png", "webp", "gif"];
        const fileFormat = file.mimetype.split("/")[1];
        if (!allowedFormats.includes(fileFormat)) {
          throw new Error("Invalid image format.");
        }

        return {
          folder: "sections",
          format: fileFormat,
          resource_type: "image",
          public_id: `${Date.now()}-${file.originalname.replace(/\s/g, "-")}`,
          transformation: [{ quality: "auto", fetch_format: "auto" }],
        };
      } else if (isVideo) {
        const allowedFormats = ["mp4", "mov", "avi", "mkv"];
        const fileFormat = file.mimetype.split("/")[1];
        if (!allowedFormats.includes(fileFormat)) {
          throw new Error("Invalid video format.");
        }

        return {
          folder: "course_videos",
          resource_type: "video",
          public_id: `${Date.now()}-${Math.floor(Math.random() * 1000)}-${file.originalname
            .replace(/\s/g, "-")
            .replace(/[^a-zA-Z0-9.\-_]/g, "")}`,
        };
      } else {
        throw new Error("Unsupported file type.");
      }
    },
  }),
  limits: { fileSize: 500 * 1024 * 1024 },
});
