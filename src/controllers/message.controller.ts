import { Response, NextFunction } from "express";
import Message from "../models/Message";
import { AuthRequest } from "../middlewares/authentication.middleware";
import cloudinary from "../config/cloudinary";
import asyncHandler from "../utils/async-handler.util";
import formatRes from "../utils/format-res.util";

export const sendMessage = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { message } = req.body;
    const sender = req.userId;

    if (!message) {
      res.status(400).json(formatRes("message is required."));
      return;
    }

    let imageUrl: string | null = null;

    // Upload image if available
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "messages",
        resource_type: "image",
      });
      imageUrl = result.secure_url;
    }

    const newMessage = await Message.create({
      sender,
      content: message,
      image: imageUrl,
    });

    const populatedMessage = await newMessage.populate("sender", "name");

    res
      .status(201)
      .json(
        formatRes("Message sent successfully", { message: populatedMessage })
      );
  }
);

export const getAllMessages = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { limit = 20, lastMessageId } = req.query;

    let query: any = {};

    if (lastMessageId) {
      const lastMessage = await Message.findById(lastMessageId);
      if (lastMessage) {
        // Get all messages before lastMessage
        query.createdAt = { $lt: lastMessage.createdAt };
      }
    }

    const messages = await Message.find(query)
      .populate("sender", "name avatar")
      .sort({ createdAt: -1 }) // newest first
      .limit(Number(limit));

    res.status(200).json(
      formatRes("Messages fetched successfully", {
        messages,
      })
    );
  }
);
