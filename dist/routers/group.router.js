"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const group_controller_1 = require("../controllers/group.controller");
const authentication_middleware_1 = require("../middlewares/authentication.middleware");
const upload_1 = require("../middlewares/upload");
const router = express_1.default.Router();
// ✅ Create new group
router.post("/", authentication_middleware_1.authMiddleware, upload_1.uploadImage.single("image"), group_controller_1.createGroup);
// ✅ Get all groups
router.get("/", authentication_middleware_1.authMiddleware, group_controller_1.getAllGroups);
// ✅ Get group by id
router.get("/:groupId", authentication_middleware_1.authMiddleware, group_controller_1.getGroupById);
// ✅ Delete group
router.delete("/:groupId", authentication_middleware_1.authMiddleware, group_controller_1.deleteGroup);
exports.default = router;
