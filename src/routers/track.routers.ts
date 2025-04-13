import { Router } from "express";

import upload from "../middlewares/upload"; // Multer middleware for file upload
import {
  getTracks,
  getTrackById,
  createTrack,
  updateTrack,
  deleteTrack,
} from "../controllers/track.controller";

const router = Router();

router.get("/", getTracks);
router.get("/:id", getTrackById);
router.post(
  "/",
  upload.fields([
    { name: "icon", maxCount: 1 },
    { name: "icon3D", maxCount: 1 },
  ]),
  createTrack
);
router.put(
  "/:id",
  upload.fields([
    { name: "icon", maxCount: 1 },
    { name: "icon3D", maxCount: 1 },
  ]),
  updateTrack
);
router.delete("/:id", deleteTrack);

export default router;
