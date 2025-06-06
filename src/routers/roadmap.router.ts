import express from "express";
import {
  getRoadmaps,
  getRoadmapById,
  createRoadmap,
  updateRoadmap,
  deleteRoadmap,
  getAllRoadmaps,
  getSingleRoadmap,
} from "../controllers/roadmap.controller";
import { uploadImage } from "../middlewares/upload";
import { authMiddleware } from "../middlewares/authentication.middleware";

const router = express.Router();

// Get all roadmaps
router.get("/", getRoadmaps);

// get all roadmaps for dashboard
router.get("/dashboard", authMiddleware, getAllRoadmaps);
// get single roadmap for dashboard
router.get("/dashboard/:id", authMiddleware, getSingleRoadmap);
// Get roadmap by ID
router.get("/:id", getRoadmapById);

// Create a new roadmap (supports icon upload)
router.post("/", uploadImage.single("icon"), createRoadmap);

// Update roadmap (supports optional icon update)
router.put("/:id", uploadImage.single("icon"), updateRoadmap);

// Delete roadmap
router.delete("/:id", deleteRoadmap);

export default router;
