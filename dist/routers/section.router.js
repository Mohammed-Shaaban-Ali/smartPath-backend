"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sectionController_controller_1 = require("../controllers/sectionController.controller");
const upload_1 = __importDefault(require("../middlewares/upload"));
const router = express_1.default.Router();
router.post("/", upload_1.default.single("icon"), sectionController_controller_1.createSection);
router.get("/", sectionController_controller_1.getSections);
router.get("/:id", sectionController_controller_1.getSectionById);
router.put("/:id", upload_1.default.single("icon"), sectionController_controller_1.updateSection);
router.delete("/:id", sectionController_controller_1.deleteSection);
exports.default = router;
