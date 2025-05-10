import express from "express";

import upload from "../middlewares/upload";
import { getAllMessages, sendMessage } from "../controllers/message.controller";
import { authMiddleware } from "../middlewares/authentication.middleware";

const router = express.Router();
router.post("/", authMiddleware, upload.single("image"), sendMessage);
router.get("/", authMiddleware, getAllMessages);

export default router;
