import express from "express";
import {
  updateUserController,
  deleteUserController,
  updatePasswordController,
} from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/authentication.middleware";

const router = express.Router();

router.put("/", authMiddleware, updateUserController);
router.delete("/", authMiddleware, deleteUserController);
router.put("/reset-password", updatePasswordController);
export default router;
