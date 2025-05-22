import express from "express";
import {
  createGroup,
  getAllGroups,
  getGroupById,
  deleteGroup,
} from "../controllers/group.controller";
import { authMiddleware } from "../middlewares/authentication.middleware";
import { uploadImage } from "../middlewares/upload";

const router = express.Router();

// ✅ Create new group
router.post("/", authMiddleware, uploadImage.single("image"), createGroup);
// ✅ Get all groups
router.get("/", authMiddleware, getAllGroups);

// ✅ Get group by id
router.get("/:groupId", authMiddleware, getGroupById);

// ✅ Delete group
router.delete("/:groupId", authMiddleware, deleteGroup);

export default router;
