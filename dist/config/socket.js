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
exports.setupSocket = void 0;
const socket_io_1 = require("socket.io");
const Message_1 = __importDefault(require("../models/Message"));
const cloudinary_1 = __importDefault(require("./cloudinary"));
const setupSocket = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });
    io.on("connection", (socket) => {
        console.log("🔌 New client connected:", socket.id);
        socket.on("sendMessage", (data) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                let imageUrl = null;
                if (data.imageBase64) {
                    const result = yield cloudinary_1.default.uploader.upload(data.imageBase64, {
                        folder: "messages",
                        resource_type: "image",
                    });
                    imageUrl = result.secure_url;
                }
                const message = yield Message_1.default.create({
                    // now the senderId i send the token and the id in the token => req.userId
                    sender: data.senderId,
                    content: data.content,
                    image: imageUrl,
                });
                const populatedMessage = yield message.populate("sender", "name");
                io.emit("newMessage", populatedMessage);
            }
            catch (error) {
                console.error("❌ Error saving message:", error);
            }
        }));
        socket.on("disconnect", () => {
            console.log("❌ Client disconnected:", socket.id);
        });
    });
    return io;
};
exports.setupSocket = setupSocket;
