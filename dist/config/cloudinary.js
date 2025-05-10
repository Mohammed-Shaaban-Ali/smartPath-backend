"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary_1 = require("cloudinary");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
cloudinary_1.v2.config({
    cloud_name: "dwhzpccfb", // process.env.CLOUDINARY_CLOUD_NAME,
    api_key: "538121778672572", //process.env.CLOUDINARY_API_KEY,
    api_secret: "aZU0XkVHWlO62Cw8oqpE_jR5YVE", //process.env.CLOUDINARY_API_SECRET,
    secure: true,
});
exports.default = cloudinary_1.v2;
