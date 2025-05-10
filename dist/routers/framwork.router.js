"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const framework_controller_1 = require("../controllers/framework.controller");
const upload_1 = __importDefault(require("../middlewares/upload"));
const router = express_1.default.Router();
// Get all frameworks
router.get("/", framework_controller_1.getFrameworks);
// Get framework by ID
router.get("/:id", framework_controller_1.getFrameworkById);
// Create a new framework (supports icon and icon3D)
router.post("/", upload_1.default.fields([
    { name: "icon", maxCount: 1 },
    { name: "icon3D", maxCount: 1 },
]), framework_controller_1.createFramework);
// Update framework (supports optional icon and icon3D update)
router.put("/:id", upload_1.default.fields([
    { name: "icon", maxCount: 1 },
    { name: "icon3D", maxCount: 1 },
]), framework_controller_1.updateFramework);
// Delete framework
router.delete("/:id", framework_controller_1.deleteFramework);
exports.default = router;
