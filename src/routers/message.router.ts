import express from "express";

import {
  deleteMessage,
  getAllMessages,
  getAllMessagesForDashboard,
  sendMessage,
} from "../controllers/message.controller";
import { authMiddleware } from "../middlewares/authentication.middleware";
import { uploadImage } from "../middlewares/upload";

const router = express.Router();
router.post("/", authMiddleware, uploadImage.single("image"), sendMessage);
router.get("/", authMiddleware, getAllMessages);
router.get("/dashboard/:groupId", authMiddleware, getAllMessagesForDashboard);
router.delete("/:messageId", authMiddleware, deleteMessage);

export default router;
