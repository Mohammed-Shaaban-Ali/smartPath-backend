"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const authentication_middleware_1 = require("../middlewares/authentication.middleware");
const upload_1 = require("../middlewares/upload");
const router = express_1.default.Router();
router.put("/", authentication_middleware_1.authMiddleware, upload_1.uploadImage.single("avatar"), user_controller_1.updateUserController);
router.delete("/", authentication_middleware_1.authMiddleware, user_controller_1.deleteUserController);
router.put("/reset-password", user_controller_1.updatePasswordController);
//rodmap
router.get("/get-roadmap", authentication_middleware_1.authMiddleware, user_controller_1.getUserRoadmapController);
router.post("/add-roadmap", authentication_middleware_1.authMiddleware, user_controller_1.addRoadmapToUser);
router.post("/complete-item", authentication_middleware_1.authMiddleware, user_controller_1.markItemAsCompleted);
// dashboard
// getAllUsersController
router.get("/dashboard/users", authentication_middleware_1.authMiddleware, user_controller_1.getAllUsersController);
// get single user
router.get("/dashboard/users/:id", authentication_middleware_1.authMiddleware, user_controller_1.getSingleUserDashboardController);
// block user by id
router.put("/dashboard/users/block/:id", authentication_middleware_1.authMiddleware, user_controller_1.blockUserController);
exports.default = router;
