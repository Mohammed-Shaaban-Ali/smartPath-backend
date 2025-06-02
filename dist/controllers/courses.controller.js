"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markVideoAsWatched = exports.getCourseWithProgress = exports.getUserCourses = exports.enrollInCourse = exports.getCourses = exports.createCourse = void 0;
const Course_1 = __importDefault(require("../models/Course"));
const User_1 = __importDefault(require("../models/User"));
const format_res_util_1 = __importDefault(require("../utils/format-res.util"));
const async_handler_util_1 = __importDefault(require("../utils/async-handler.util"));
const mongoose_1 = __importDefault(require("mongoose"));
const Track_1 = __importDefault(require("../models/Track"));
const paginate_1 = require("../utils/paginate");
// Create Course with videos and image upload
const createCourse = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { title, description, sections, track } = req.body;
        if (!title || !description || !sections || !track) {
            res.status(400).json((0, format_res_util_1.default)("All fields are required"));
            return;
        }
        const trackExists = yield Track_1.default.findById(track);
        if (!trackExists) {
            res.status(404).json((0, format_res_util_1.default)("Track not found"));
            return;
        }
        let imageUrl;
        let videoUrl = [];
        (_a = req.files) === null || _a === void 0 ? void 0 : _a.forEach((file) => {
            if (file.fieldname === "image") {
                imageUrl = file.path;
            }
            else if (file.fieldname.includes("video")) {
                videoUrl.push(file.path);
            }
        });
        if (!imageUrl) {
            console.log("Image not uploaded correctly");
        }
        const parsedSections = JSON.parse(sections);
        let totalCourseDuration = 0;
        const finalSections = parsedSections.map((section, index) => {
            let sectionDuration = 0;
            const videos = section.videos.map((vid, vidIndex) => {
                if (!videoUrl[vidIndex]) {
                    console.log(`Video not uploaded correctly for section-${index}-video-${vidIndex}`);
                }
                sectionDuration += vid.duration;
                return Object.assign(Object.assign({}, vid), { videoUrl: videoUrl[vidIndex] || "" });
            });
            totalCourseDuration += sectionDuration;
            return {
                title: section.title,
                totalDuration: sectionDuration,
                videos,
            };
        });
        const course = yield Course_1.default.create({
            title,
            description,
            image: imageUrl,
            totalDuration: totalCourseDuration,
            track: trackExists._id,
            sections: finalSections,
        });
        res.status(201).json({
            message: "Course created",
            course,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.createCourse = createCourse;
// Get All Courses
exports.getCourses = (0, async_handler_util_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { search } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const searchRegex = search ? new RegExp(search, "i") : null;
    const courses = yield Course_1.default.aggregate([
        {
            $lookup: {
                from: "tracks",
                localField: "track",
                foreignField: "_id",
                as: "track",
            },
        },
        { $unwind: "$track" },
        {
            $match: searchRegex
                ? {
                    $or: [
                        { title: searchRegex },
                        { description: searchRegex },
                        { "track.title": searchRegex },
                    ],
                }
                : {},
        },
        {
            $project: {
                title: 1,
                image: 1,
                description: 1,
                totalDuration: 1,
                ratings: 1,
                "track.title": 1,
            },
        },
    ]);
    const formattedCourses = courses.map((course) => {
        const ratings = course.ratings || [];
        const averageRating = ratings.length > 0
            ? ratings.reduce((sum, rate) => sum + ((rate === null || rate === void 0 ? void 0 : rate.rate) || 0), 0) / ratings.length
            : 0;
        return {
            id: course._id,
            title: course.title,
            image: course.image,
            description: course.description,
            totalDuration: course.totalDuration,
            averageRating: averageRating.toFixed(1),
            track: course.track,
        };
    });
    const coursesWithPageination = (0, paginate_1.paginateArray)(formattedCourses, page, limit);
    res.status(200).json((0, format_res_util_1.default)("Courses fetched successfully", {
        coursesWithPageination,
    }));
}));
// Enroll in course
exports.enrollInCourse = (0, async_handler_util_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseId } = req.params;
    const userId = req.userId;
    yield User_1.default.findByIdAndUpdate(userId, {
        $addToSet: { enrolledCourses: courseId },
    });
    yield Course_1.default.findByIdAndUpdate(courseId, {
        $addToSet: { enrolledUsers: userId },
    });
    res.status(200).json((0, format_res_util_1.default)("Enrolled in course successfully"));
}));
// Get user courses
exports.getUserCourses = (0, async_handler_util_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = req.userId;
    const user = yield User_1.default.findById(userId).populate({
        path: "enrolledCourses",
        select: "title description image totalDuration ratings",
    });
    // check if user exists
    if (!user) {
        return res.status(404).json((0, format_res_util_1.default)("User not found"));
    }
    const formattedCourses = (_a = user === null || user === void 0 ? void 0 : user.enrolledCourses) === null || _a === void 0 ? void 0 : _a.map((course) => {
        const ratings = course.ratings || [];
        const averageRating = ratings.length > 0
            ? ratings.reduce((sum, rate) => { var _a; return sum + ((_a = rate.rating) !== null && _a !== void 0 ? _a : 0); }, 0) / ratings.length
            : 0;
        return {
            _id: course._id,
            title: course.title,
            description: course.description,
            image: course.image,
            totalDuration: course.totalDuration,
            averageRating,
        };
    });
    res.status(200).json((0, format_res_util_1.default)("User courses fetched successfully", {
        courses: formattedCourses,
    }));
}));
// Get course with progress
exports.getCourseWithProgress = (0, async_handler_util_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseId } = req.params;
    const userId = req.userId;
    const user = yield User_1.default.findById(userId);
    const course = yield Course_1.default.findById(courseId).populate({
        path: "track",
        select: "title",
    });
    if (!user || !course) {
        res.status(404).json((0, format_res_util_1.default)("User or course not found"));
        return;
    }
    // Check if user enrolled in course
    const isEnrolled = course.enrolledUsers.some((id) => id.toString() === userId);
    if (!isEnrolled) {
        res.status(403).json((0, format_res_util_1.default)("User not enrolled in course"));
        return;
    }
    const progress = user.progress.find((p) => p.course.toString() === courseId);
    const sections = course.sections.map((section) => {
        const videos = section.videos.map((video) => {
            const watched = (progress === null || progress === void 0 ? void 0 : progress.watchedVideos.includes(video._id.toString())) || false;
            return Object.assign(Object.assign({}, video.toObject()), { watched });
        });
        const allWatched = videos.every((v) => v.watched);
        return Object.assign(Object.assign({}, section.toObject()), { videos, allWatched });
    });
    // Get top 3 ratings (by latest added — reverse order)
    const top3Ratings = course.ratings
        .slice(-3) // last 3
        .reverse();
    // Calculate average rating
    const averageRating = course.ratings.length > 0
        ? (course.ratings.reduce((acc, r) => { var _a; return acc + ((_a = r.rate) !== null && _a !== void 0 ? _a : 0); }, 0) / course.ratings.length).toFixed(1)
        : 5;
    // Prepare final course data without enrolledUsers
    const _a = course.toObject(), { enrolledUsers, ratings } = _a, courseData = __rest(_a, ["enrolledUsers", "ratings"]);
    res.status(200).json((0, format_res_util_1.default)("Course with progress fetched successfully", {
        course: Object.assign(Object.assign({}, courseData), { sections, topRatings: top3Ratings, averageRating }),
    }));
}));
// Mark video as watched
exports.markVideoAsWatched = (0, async_handler_util_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const { courseId, videoId } = req.body;
    const user = yield User_1.default.findById(userId);
    const course = yield Course_1.default.findById(courseId);
    if (!user) {
        res.status(404).json((0, format_res_util_1.default)("User not found"));
        return;
    }
    if (!course) {
        res.status(404).json((0, format_res_util_1.default)("Course not found"));
        return;
    }
    // Check if user enrolled in course
    const isEnrolled = course.enrolledUsers.some((id) => id.toString() === userId);
    if (!isEnrolled) {
        res.status(403).json((0, format_res_util_1.default)("User not enrolled in course"));
        return;
    }
    // Find progress for this course
    let progress = user.progress.find((p) => p.course.toString() === courseId);
    // If no progress, create one
    if (!progress) {
        user.progress.push({
            course: courseId,
            watchedVideos: [],
        });
        progress = user.progress.find((p) => p.course.toString() === courseId);
    }
    // If video not already watched, add it
    if (!progress.watchedVideos.some((id) => id.toString() === videoId)) {
        progress.watchedVideos.push(new mongoose_1.default.Types.ObjectId(videoId));
    }
    yield user.save();
    res.status(200).json((0, format_res_util_1.default)("Video marked as watched successfully", {
        progress,
    }));
}));
