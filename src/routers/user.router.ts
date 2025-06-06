import express from "express";
import {
  updateUserController,
  deleteUserController,
  updatePasswordController,
  addRoadmapToUser,
  markItemAsCompleted,
  getUserRoadmapController,
  getAllUsersController,
  getSingleUserDashboardController,
} from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/authentication.middleware";
import { uploadImage } from "../middlewares/upload";

const router = express.Router();

router.put(
  "/",
  authMiddleware,
  uploadImage.single("avatar"),
  updateUserController
);
router.delete("/", authMiddleware, deleteUserController);
router.put("/reset-password", updatePasswordController);

//rodmap
router.get("/get-roadmap", authMiddleware, getUserRoadmapController);
router.post("/add-roadmap", authMiddleware, addRoadmapToUser);
router.post("/complete-item", authMiddleware, markItemAsCompleted);

// dashboard
// getAllUsersController
router.get("/dashboard/users", authMiddleware, getAllUsersController);
// get single user
router.get(
  "/dashboard/users/:id",
  authMiddleware,
  getSingleUserDashboardController
);

export default router;
