import { Router } from "express";

import {
  getTracks,
  getTrackById,
  createTrack,
  updateTrack,
  deleteTrack,
  getTracksForSelect,
} from "../controllers/track.controller";
import { uploadImage } from "../middlewares/upload";

const router = Router();

router.get("/", getTracks);
router.get("/select", getTracksForSelect);

router.get("/:id", getTrackById);
router.post(
  "/",
  uploadImage.fields([
    { name: "icon", maxCount: 1 },
    { name: "icon3D", maxCount: 1 },
  ]),
  createTrack
);
router.put(
  "/:id",
  uploadImage.fields([
    { name: "icon", maxCount: 1 },
    { name: "icon3D", maxCount: 1 },
  ]),
  updateTrack
);
router.delete("/:id", deleteTrack);

export default router;
