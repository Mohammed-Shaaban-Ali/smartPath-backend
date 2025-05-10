"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_1 = __importDefault(require("../middlewares/upload")); // Multer middleware for file upload
const track_controller_1 = require("../controllers/track.controller");
const router = (0, express_1.Router)();
router.get("/", track_controller_1.getTracks);
router.get("/:id", track_controller_1.getTrackById);
router.post("/", upload_1.default.fields([
    { name: "icon", maxCount: 1 },
    { name: "icon3D", maxCount: 1 },
]), track_controller_1.createTrack);
router.put("/:id", upload_1.default.fields([
    { name: "icon", maxCount: 1 },
    { name: "icon3D", maxCount: 1 },
]), track_controller_1.updateTrack);
router.delete("/:id", track_controller_1.deleteTrack);
exports.default = router;
