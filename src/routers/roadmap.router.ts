import express from "express";
import {
  getRoadmaps,
  getRoadmapById,
  createRoadmap,
  updateRoadmap,
  deleteRoadmap,
} from "../controllers/roadmap.controller";
import upload from "../middlewares/upload";

const router = express.Router();

// Get all roadmaps
router.get("/", getRoadmaps);

// Get roadmap by ID
router.get("/:id", getRoadmapById);

// Create a new roadmap (supports icon upload)
router.post("/", upload.single("icon"), createRoadmap);

// Update roadmap (supports optional icon update)
router.put("/:id", upload.single("icon"), updateRoadmap);

// Delete roadmap
router.delete("/:id", deleteRoadmap);

export default router;
