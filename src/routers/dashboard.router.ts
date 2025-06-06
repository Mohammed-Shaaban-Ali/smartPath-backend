import express from "express";

import { authMiddleware } from "../middlewares/authentication.middleware";
import { getDashboardController } from "../controllers/dashboard.controller";

const router = express.Router();

router.get("/", authMiddleware, getDashboardController);

export default router;
