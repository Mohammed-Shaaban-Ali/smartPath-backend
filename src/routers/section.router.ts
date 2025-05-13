import express from "express";
import {
  createSection,
  deleteSection,
  getSectionById,
  getSections,
  updateSection,
} from "../controllers/sectionController.controller";
import { uploadImage } from "../middlewares/upload";

const router = express.Router();

router.post("/", uploadImage.single("icon"), createSection);
router.get("/", getSections);
router.get("/:id", getSectionById);
router.put("/:id", uploadImage.single("icon"), updateSection);
router.delete("/:id", deleteSection);

export default router;
