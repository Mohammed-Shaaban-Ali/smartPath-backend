import express from "express";
import {
  createSection,
  deleteSection,
  getAllSections,
  getSectionById,
  getSections,
  getSectionsForSelect,
  getSingleSection,
  updateSection,
} from "../controllers/sectionController.controller";
import { uploadImage } from "../middlewares/upload";
import { authMiddleware } from "../middlewares/authentication.middleware";

const router = express.Router();

router.post("/", uploadImage.single("icon"), createSection);

// dashboard
// get all sections
router.get("/dashboard", authMiddleware, getAllSections);
// get single section
router.get("/dashboard/:id", authMiddleware, getSingleSection);
// get sections for select
router.get("/select", getSectionsForSelect);
router.get("/", getSections);
router.get("/:id", getSectionById);
router.put("/:id", uploadImage.single("icon"), updateSection);
router.delete("/:id", deleteSection);

export default router;
