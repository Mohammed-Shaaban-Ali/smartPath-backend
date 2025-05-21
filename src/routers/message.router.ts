import express from "express";

import {
  deleteMessage,
  getAllMessages,
  sendMessage,
} from "../controllers/message.controller";
import { authMiddleware } from "../middlewares/authentication.middleware";
import { uploadImage } from "../middlewares/upload";

const router = express.Router();
router.post("/", authMiddleware, uploadImage.single("image"), sendMessage);
router.get("/", authMiddleware, getAllMessages);
router.delete("/:messageId", authMiddleware, deleteMessage);

export default router;
