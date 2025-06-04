import express from "express";
import {
  createCourse,
  enrollInCourse,
  getCourses,
  getCourseWithProgress,
  getUserCourses,
  markVideoAsWatched,
} from "../controllers/courses.controller";
import { uploadAny, uploadImage, uploadVideo } from "../middlewares/upload";
import { authMiddleware } from "../middlewares/authentication.middleware";

const router = express.Router();

// Create course
router.post("/", uploadAny.any(), createCourse);
// Get all courses
router.get("/", authMiddleware, getCourses);

// Enroll in course
router.post("/enroll/:courseId", authMiddleware, enrollInCourse);

// Get user courses
router.get("/user", authMiddleware, getUserCourses);

// makr video as watched
router.post("/mark-video-watched", authMiddleware, markVideoAsWatched);

// Get course with progress
router.get("/:courseId", authMiddleware, getCourseWithProgress);

export default router;
