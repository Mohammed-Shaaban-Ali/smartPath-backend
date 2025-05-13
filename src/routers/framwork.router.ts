import express from "express";
import {
  getFrameworks,
  getFrameworkById,
  createFramework,
  updateFramework,
  deleteFramework,
} from "../controllers/framework.controller";
import { uploadImage } from "../middlewares/upload";

const router = express.Router();

// Get all frameworks
router.get("/", getFrameworks);

// Get framework by ID
router.get("/:id", getFrameworkById);

// Create a new framework (supports icon and icon3D)
router.post(
  "/",
  uploadImage.fields([
    { name: "icon", maxCount: 1 },
    { name: "icon3D", maxCount: 1 },
  ]),
  createFramework
);

// Update framework (supports optional icon and icon3D update)
router.put(
  "/:id",
  uploadImage.fields([
    { name: "icon", maxCount: 1 },
    { name: "icon3D", maxCount: 1 },
  ]),
  updateFramework
);

// Delete framework
router.delete("/:id", deleteFramework);

export default router;
