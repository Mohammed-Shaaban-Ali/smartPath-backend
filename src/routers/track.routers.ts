import { Router } from "express";

import {
  getTracks,
  getTrackById,
  createTrack,
  updateTrack,
  deleteTrack,
  getTracksForSelect,
  getAllTracks,
  getSingleTrack,
} from "../controllers/track.controller";
import { uploadImage } from "../middlewares/upload";
import { authMiddleware } from "../middlewares/authentication.middleware";

const router = Router();

router.get("/", getTracks);
router.get("/select", getTracksForSelect);
router.get("/dashboard", authMiddleware, getAllTracks);
router.get("/dashboard/:id", authMiddleware, getSingleTrack);

router.get("/:id", getTrackById);
router.post(
  "/",
  uploadImage.fields([{ name: "icon", maxCount: 1 }]),
  createTrack
);
router.put(
  "/:id",
  uploadImage.fields([{ name: "icon", maxCount: 1 }]),
  updateTrack
);
router.delete("/:id", deleteTrack);

export default router;
