"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const courses_controller_1 = require("../controllers/courses.controller");
const upload_1 = require("../middlewares/upload");
const authentication_middleware_1 = require("../middlewares/authentication.middleware");
const router = express_1.default.Router();
// Create course
router.post("/", upload_1.uploadAny.any(), courses_controller_1.createCourse);
// Get all courses
router.get("/", authentication_middleware_1.authMiddleware, courses_controller_1.getCourses);
// get all courses for dashboard
router.get("/dashboard", authentication_middleware_1.authMiddleware, courses_controller_1.getAllCourses);
router.post("/dashboard/:id", upload_1.uploadAny.any(), courses_controller_1.updateCourse);
router.get("/dashboard/:id", authentication_middleware_1.authMiddleware, courses_controller_1.getSingleCourse);
router.delete("/dashboard/:id", authentication_middleware_1.authMiddleware, courses_controller_1.deleteCourse);
// Enroll in course
router.post("/enroll/:courseId", authentication_middleware_1.authMiddleware, courses_controller_1.enrollInCourse);
// Get user courses
router.get("/user", authentication_middleware_1.authMiddleware, courses_controller_1.getUserCourses);
// makr video as watched
router.post("/mark-video-watched", authentication_middleware_1.authMiddleware, courses_controller_1.markVideoAsWatched);
// Get course with progress
router.get("/:courseId", authentication_middleware_1.authMiddleware, courses_controller_1.getCourseWithProgress);
exports.default = router;
