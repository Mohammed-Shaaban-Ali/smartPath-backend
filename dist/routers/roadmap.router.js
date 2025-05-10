"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const roadmap_controller_1 = require("../controllers/roadmap.controller");
const upload_1 = __importDefault(require("../middlewares/upload"));
const router = express_1.default.Router();
// Get all roadmaps
router.get("/", roadmap_controller_1.getRoadmaps);
// Get roadmap by ID
router.get("/:id", roadmap_controller_1.getRoadmapById);
// Create a new roadmap (supports icon upload)
router.post("/", upload_1.default.single("icon"), roadmap_controller_1.createRoadmap);
// Update roadmap (supports optional icon update)
router.put("/:id", upload_1.default.single("icon"), roadmap_controller_1.updateRoadmap);
// Delete roadmap
router.delete("/:id", roadmap_controller_1.deleteRoadmap);
exports.default = router;
