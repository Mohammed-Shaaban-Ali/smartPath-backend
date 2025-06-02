"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const message_controller_1 = require("../controllers/message.controller");
const authentication_middleware_1 = require("../middlewares/authentication.middleware");
const upload_1 = require("../middlewares/upload");
const router = express_1.default.Router();
router.post("/", authentication_middleware_1.authMiddleware, upload_1.uploadImage.single("image"), message_controller_1.sendMessage);
router.get("/", authentication_middleware_1.authMiddleware, message_controller_1.getAllMessages);
router.delete("/:messageId", authentication_middleware_1.authMiddleware, message_controller_1.deleteMessage);
exports.default = router;
