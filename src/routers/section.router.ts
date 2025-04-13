import express from "express";
import {
  createSection,
  deleteSection,
  getSectionById,
  getSections,
  updateSection,
} from "../controllers/sectionController.controller";
import upload from "../middlewares/upload";

const router = express.Router();

router.post("/", upload.single("icon"), createSection);
router.get("/", getSections);
router.get("/:id", getSectionById);
router.put("/:id", upload.single("icon"), updateSection);
router.delete("/:id", deleteSection);

export default router;
