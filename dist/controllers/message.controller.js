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
exports.getAllMessages = exports.sendMessage = void 0;
const Message_1 = __importDefault(require("../models/Message"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const sendMessage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { content } = req.body;
        const sender = req.userId;
        if (!content) {
            res.status(400).json({ message: "Content is required." });
            return;
        }
        let imageUrl = null;
        // Upload image if available
        if (req.file) {
            const result = yield cloudinary_1.default.uploader.upload(req.file.path, {
                folder: "messages",
                resource_type: "image",
            });
            imageUrl = result.secure_url;
        }
        const message = yield Message_1.default.create({
            sender,
            content,
            image: imageUrl,
        });
        const populatedMessage = yield message.populate("sender", "name");
        res.status(201).json(populatedMessage);
    }
    catch (error) {
        next(error);
    }
});
exports.sendMessage = sendMessage;
const getAllMessages = (req, // Use the extended `AuthRequest` type here if `userId` is needed
res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const messages = yield Message_1.default.find({ sender: req.userId }) // Optional: Filtering based on the userId
            .populate("sender", "name")
            .sort({ createdAt: 1 });
        res.status(200).json(messages);
    }
    catch (error) {
        next(error);
    }
});
exports.getAllMessages = getAllMessages;
