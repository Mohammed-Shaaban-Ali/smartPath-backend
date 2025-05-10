import { Response, NextFunction } from "express";
import Message from "../models/Message";
import { AuthRequest } from "../middlewares/authentication.middleware";
import cloudinary from "../config/cloudinary";

export const sendMessage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { content } = req.body;
    const sender = req.userId;

    if (!content) {
      res.status(400).json({ message: "Content is required." });
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

    const message = await Message.create({
      sender,
      content,
      image: imageUrl,
    });

    const populatedMessage = await message.populate("sender", "name");

    res.status(201).json(populatedMessage);
  } catch (error) {
    next(error);
  }
};

export const getAllMessages = async (
  req: AuthRequest, // Use the extended `AuthRequest` type here if `userId` is needed
  res: Response,
  next: NextFunction
) => {
  try {
    const messages = await Message.find({ sender: req.userId }) // Optional: Filtering based on the userId
      .populate("sender", "name")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};
