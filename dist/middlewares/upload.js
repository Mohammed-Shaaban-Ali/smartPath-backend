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
exports.uploadAny = exports.uploadVideo = exports.uploadImage = void 0;
const multer_1 = __importDefault(require("multer"));
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
// Storage for images
const imageStorage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.default,
    params: (req, file) => __awaiter(void 0, void 0, void 0, function* () {
        const allowedFormats = ["jpg", "jpeg", "png", "webp", "gif"];
        const fileFormat = file.mimetype.split("/")[1];
        if (!allowedFormats.includes(fileFormat)) {
            throw new Error("Invalid image format. Only JPG, PNG, WEBP, and GIF are allowed.");
        }
        return {
            folder: "sections",
            format: fileFormat,
            resource_type: "image",
            public_id: `${Date.now()}-${file.originalname.replace(/\s/g, "-")}`,
            transformation: [{ quality: "auto", fetch_format: "auto" }],
        };
    }),
});
// Storage for videos
const videoStorage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.default,
    params: (req, file) => __awaiter(void 0, void 0, void 0, function* () {
        const allowedFormats = ["mp4", "mov", "avi", "mkv"];
        const fileFormat = file.mimetype.split("/")[1];
        if (!allowedFormats.includes(fileFormat)) {
            throw new Error("Invalid video format. Only MP4, MOV, AVI, and MKV are allowed.");
        }
        return {
            folder: "course_videos",
            resource_type: "video",
            public_id: `${Date.now()}-${file.originalname.replace(/\s/g, "-")}`,
        };
    }),
});
// Multer middleware for images (5MB)
exports.uploadImage = (0, multer_1.default)({
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
        }
        else {
            cb(new Error("Invalid image type. Only JPG, PNG, WEBP, and GIF are allowed."));
        }
    },
});
// Multer middleware for videos (500MB)
exports.uploadVideo = (0, multer_1.default)({
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
        }
        else {
            cb(new Error("Invalid video type. Only MP4, MOV, AVI, and MKV are allowed."));
        }
    },
});
exports.uploadAny = (0, multer_1.default)({
    storage: new multer_storage_cloudinary_1.CloudinaryStorage({
        cloudinary: cloudinary_1.default,
        params: (req, file) => __awaiter(void 0, void 0, void 0, function* () {
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
            }
            else if (isVideo) {
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
            }
            else {
                throw new Error("Unsupported file type.");
            }
        }),
    }),
    limits: { fileSize: 500 * 1024 * 1024 },
});
