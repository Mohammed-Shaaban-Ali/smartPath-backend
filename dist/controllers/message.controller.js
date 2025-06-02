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
exports.deleteMessage = exports.getAllMessages = exports.sendMessage = void 0;
const Message_1 = __importDefault(require("../models/Message"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const async_handler_util_1 = __importDefault(require("../utils/async-handler.util"));
const format_res_util_1 = __importDefault(require("../utils/format-res.util"));
const Group_1 = __importDefault(require("../models/Group"));
// ✅ Send Message (HTTP)
exports.sendMessage = (0, async_handler_util_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { message, groupId } = req.body;
    const sender = req.userId;
    if (!message && !req.file) {
        res.status(400).json((0, format_res_util_1.default)("Message content or image is required."));
        return;
    }
    if (!groupId) {
        res.status(400).json((0, format_res_util_1.default)("groupId is required."));
        return;
    }
    const groupExists = yield Group_1.default.findById(groupId);
    if (!groupExists) {
        res.status(404).json((0, format_res_util_1.default)("Group not found."));
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
    const newMessage = yield Message_1.default.create({
        sender,
        content: message,
        group: groupId,
        image: imageUrl,
    });
    const populatedMessage = yield newMessage.populate("sender", "name avatar");
    res
        .status(201)
        .json((0, format_res_util_1.default)("Message sent successfully", { message: populatedMessage }));
}));
// ✅ Get All Messages of a Group
exports.getAllMessages = (0, async_handler_util_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { groupId, limit = 20, lastMessageId } = req.query;
    if (!groupId) {
        res.status(400).json((0, format_res_util_1.default)("groupId is required."));
        return;
    }
    const groupExists = yield Group_1.default.findById(groupId);
    if (!groupExists) {
        res.status(404).json((0, format_res_util_1.default)("Group not found."));
        return;
    }
    let query = { group: groupId };
    if (lastMessageId) {
        const lastMessage = yield Message_1.default.findById(lastMessageId);
        if (lastMessage) {
            query.createdAt = { $lt: lastMessage.createdAt };
        }
    }
    const messages = yield Message_1.default.find(query)
        .populate("sender", "name avatar")
        .sort({ createdAt: -1 })
        .limit(Number(limit));
    res.status(200).json((0, format_res_util_1.default)("Messages fetched successfully", {
        messages,
    }));
}));
// ✅ Delete a Message (Optional)
exports.deleteMessage = (0, async_handler_util_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { messageId } = req.params;
    const message = yield Message_1.default.findById(messageId);
    if (!message) {
        res.status(404).json((0, format_res_util_1.default)("Message not found."));
        return;
    }
    // Allow only sender to delete
    if (message.sender.toString() !== req.userId) {
        res.status(403).json((0, format_res_util_1.default)("Not authorized to delete this message."));
        return;
    }
    yield message.deleteOne();
    res.status(200).json((0, format_res_util_1.default)("Message deleted successfully."));
}));
