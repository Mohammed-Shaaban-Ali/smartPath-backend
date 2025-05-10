"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
// Configure Multer to use Cloudinary
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.default,
    params: (req, file) => __awaiter(void 0, void 0, void 0, function* () {
        const allowedFormats = ["jpg", "jpeg", "png", "webp", "gif"];
        const fileFormat = file.mimetype.split("/")[1]; // Extract file format
        if (!allowedFormats.includes(fileFormat)) {
            throw new Error("Invalid file format. Only JPG, PNG, WEBP, and GIF are allowed.");
        }
        return {
            folder: "sections", // Cloudinary folder name
            format: fileFormat, // Use the detected file format
            resource_type: "image", // Ensure it's an image
            public_id: `${Date.now()}-${file.originalname.replace(/\s/g, "-")}`, // Unique filename
            transformation: [{ quality: "auto", fetch_format: "auto" }], // Optimize images
        };
    }),
});
// Multer middleware with limits (max file size 5MB)
const upload = (0, multer_1.default)({
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
        }
        else {
            cb(new Error("Invalid file type. Only JPG, PNG, WEBP, and GIF are allowed."));
        }
    },
});
exports.default = upload;
