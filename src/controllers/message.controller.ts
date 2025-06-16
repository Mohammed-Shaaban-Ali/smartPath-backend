import { Response, NextFunction } from "express";
import Message from "../models/Message";
import { AuthRequest } from "../middlewares/authentication.middleware";
import cloudinary from "../config/cloudinary";
import asyncHandler from "../utils/async-handler.util";
import formatRes from "../utils/format-res.util";
import Group from "../models/Group";
import { paginateArray } from "../utils/paginate";

// ✅ Send Message (HTTP)
export const sendMessage = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { message, groupId } = req.body;
    const sender = req.userId;

    if (!message && !req.file) {
      res.status(400).json(formatRes("Message content or image is required."));
      return;
    }

    if (!groupId) {
      res.status(400).json(formatRes("groupId is required."));
      return;
    }

    const groupExists = await Group.findById(groupId);
    if (!groupExists) {
      res.status(404).json(formatRes("Group not found."));
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
      group: groupId,
      image: imageUrl,
    });

    const populatedMessage = await newMessage.populate("sender", "name avatar");

    res
      .status(201)
      .json(
        formatRes("Message sent successfully", { message: populatedMessage })
      );
  }
);

// ✅ Get All Messages of a Group
export const getAllMessages = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { groupId, limit = 20, lastMessageId } = req.query;

    if (!groupId) {
      res.status(400).json(formatRes("groupId is required."));
      return;
    }

    const groupExists = await Group.findById(groupId);
    if (!groupExists) {
      res.status(404).json(formatRes("Group not found."));
      return;
    }

    let query: any = { group: groupId };

    if (lastMessageId) {
      const lastMessage = await Message.findById(lastMessageId);
      if (lastMessage) {
        query.createdAt = { $lt: lastMessage.createdAt };
      }
    }

    const messages = await Message.find(query)
      .populate("sender", "name avatar")
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.status(200).json(
      formatRes("Messages fetched successfully", {
        messages,
      })
    );
  }
);

// ✅ Delete a Message (Optional)
export const deleteMessage = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      res.status(404).json(formatRes("Message not found."));
      return;
    }

    // Allow only sender to delete
    if (message.sender.toString() !== req.userId) {
      res.status(403).json(formatRes("Not authorized to delete this message."));
      return;
    }

    await message.deleteOne();

    res.status(200).json(formatRes("Message deleted successfully."));
  }
);

// ✅ Get all messages for dashboard of a group
export const getAllMessagesForDashboard = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { groupId } = req.params;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    if (!groupId) {
      res.status(400).json(formatRes("groupId is required."));
      return;
    }

    const groupExists = await Group.findById(groupId);
    if (!groupExists) {
      res.status(404).json(formatRes("Group not found."));
      return;
    }

    const messages = await Message.find({ group: groupId })
      .populate("sender", "name avatar isBlocked")
      .populate("group", "name")
      .sort({ createdAt: -1 });
    const paginated = paginateArray(messages, page, limit);

    res
      .status(200)
      .json(formatRes("Messages fetched successfully.", paginated));
  }
);
