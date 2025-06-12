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
exports.deleteCourse = exports.getSingleCourse = exports.getAllCourses = exports.markVideoAsWatched = exports.getCourseWithProgress = exports.getUserCourses = exports.enrollInCourse = exports.getCourses = exports.updateCourse = exports.createCourse = void 0;
const Course_1 = __importDefault(require("../models/Course"));
const User_1 = __importDefault(require("../models/User"));
const format_res_util_1 = __importDefault(require("../utils/format-res.util"));
const async_handler_util_1 = __importDefault(require("../utils/async-handler.util"));
const mongoose_1 = __importDefault(require("mongoose"));
const Track_1 = __importDefault(require("../models/Track"));
const paginate_1 = require("../utils/paginate");
const app_error_util_1 = __importDefault(require("../utils/app-error.util"));
// Utility function to extract YouTube video ID from URL
const extractYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
};
// Create Course with videos (uploaded or YouTube) and image upload
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
        let uploadedVideoUrls = [];
        // Process uploaded files
        (_a = req.files) === null || _a === void 0 ? void 0 : _a.forEach((file) => {
            if (file.fieldname === "image") {
                imageUrl = file.path;
            }
            else if (file.fieldname.includes("video")) {
                uploadedVideoUrls.push(file.path);
            }
        });
        if (!imageUrl) {
            console.log("Image not uploaded correctly");
        }
        const parsedSections = JSON.parse(sections);
        let totalCourseDuration = 0;
        let uploadedVideoIndex = 0;
        const finalSections = parsedSections.map((section, sectionIndex) => {
            let sectionDuration = 0;
            const videos = section.videos.map((vid, vidIndex) => {
                sectionDuration += vid.duration;
                // Check if this is a YouTube video or uploaded video
                if (vid.videoType === "youtube" && vid.videoUrl) {
                    // Extract YouTube ID from URL
                    const youtubeId = extractYouTubeId(vid.videoUrl);
                    if (!youtubeId) {
                        console.log(`Invalid YouTube URL for section-${sectionIndex}-video-${vidIndex}`);
                    }
                    return {
                        title: vid.title,
                        duration: vid.duration,
                        videoUrl: vid.videoUrl,
                        videoType: "youtube",
                        youtubeId: youtubeId || "",
                    };
                }
                else {
                    // Handle uploaded video
                    const uploadedUrl = uploadedVideoUrls[uploadedVideoIndex];
                    if (!uploadedUrl) {
                        console.log(`Video not uploaded correctly for section-${sectionIndex}-video-${vidIndex}`);
                    }
                    uploadedVideoIndex++;
                    return {
                        title: vid.title,
                        duration: vid.duration,
                        videoUrl: uploadedUrl || "",
                        videoType: "upload",
                    };
                }
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
// Update Course
const updateCourse = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const courseId = req.params.id;
        const { title, description, sections, track } = req.body;
        const course = yield Course_1.default.findById(courseId);
        if (!course) {
            res.status(404).json((0, format_res_util_1.default)("Course not found"));
            return;
        }
        if (track) {
            const trackExists = yield Track_1.default.findById(track);
            if (!trackExists) {
                res.status(404).json((0, format_res_util_1.default)("Track not found"));
                return;
            }
            course.track = trackExists._id;
        }
        let imageUrl;
        let uploadedVideoUrls = [];
        // Process uploaded files
        (_a = req.files) === null || _a === void 0 ? void 0 : _a.forEach((file) => {
            if (file.fieldname === "image") {
                imageUrl = file.path;
            }
            else if (file.fieldname.includes("video")) {
                uploadedVideoUrls.push(file.path);
            }
        });
        if (title)
            course.title = title;
        if (description)
            course.description = description;
        if (imageUrl)
            course.image = imageUrl;
        if (sections) {
            const parsedSections = JSON.parse(sections);
            let totalCourseDuration = 0;
            let uploadedVideoIndex = 0;
            const finalSections = parsedSections.map((section, sectionIndex) => {
                let sectionDuration = 0;
                const videos = section.videos.map((vid, vidIndex) => {
                    sectionDuration += vid.duration;
                    if (vid.videoType === "youtube" && vid.videoUrl) {
                        // Handle YouTube video
                        const youtubeId = extractYouTubeId(vid.videoUrl);
                        if (!youtubeId) {
                            console.log(`Invalid YouTube URL for section-${sectionIndex}-video-${vidIndex}`);
                        }
                        return {
                            title: vid.title,
                            duration: vid.duration,
                            videoUrl: vid.videoUrl,
                            videoType: "youtube",
                            youtubeId: youtubeId || "",
                        };
                    }
                    else {
                        // Handle uploaded video - use new upload or keep existing
                        const newUploadedUrl = uploadedVideoUrls[uploadedVideoIndex];
                        uploadedVideoIndex++;
                        return {
                            title: vid.title,
                            duration: vid.duration,
                            videoUrl: newUploadedUrl || vid.videoUrl || "",
                            videoType: "upload",
                        };
                    }
                });
                totalCourseDuration += sectionDuration;
                return {
                    title: section.title,
                    totalDuration: sectionDuration,
                    videos,
                };
            });
            course.sections = finalSections;
            course.totalDuration = totalCourseDuration;
        }
        yield course.save();
        res.status(200).json((0, format_res_util_1.default)("Course updated successfully", course));
    }
    catch (err) {
        next(err);
    }
});
exports.updateCourse = updateCourse;
// Get All Courses
exports.getCourses = (0, async_handler_util_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const user = yield User_1.default.findById(userId).lean();
    // check if user exists
    if (!user) {
        throw new Error("User not found");
    }
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
        const isEnrollment = user === null || user === void 0 ? void 0 : user.enrolledCourses.some((id) => id.toString() === course._id.toString());
        return {
            id: course._id,
            title: course.title,
            image: course.image,
            description: course.description,
            totalDuration: course.totalDuration,
            averageRating: averageRating.toFixed(1),
            track: course.track,
            isEnrollment, // 🔥 added here
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
    const isEnrolled = course.enrolledUsers.some((id) => id.toString() === userId);
    if (!isEnrolled) {
        res.status(403).json((0, format_res_util_1.default)("User not enrolled in course"));
        return;
    }
    const progress = user.progress.find((p) => p.course.toString() === courseId);
    let totalVideos = 0;
    let watchedVideosCount = 0;
    const sections = course.sections.map((section) => {
        const videos = section.videos.map((video) => {
            const watched = (progress === null || progress === void 0 ? void 0 : progress.watchedVideos.includes(video._id.toString())) || false;
            if (watched)
                watchedVideosCount++;
            totalVideos++;
            return Object.assign(Object.assign({}, video.toObject()), { watched });
        });
        const allWatched = videos.every((v) => v.watched);
        return Object.assign(Object.assign({}, section.toObject()), { videos, allWatched });
    });
    // Get top 3 ratings (by latest added — reverse order)
    const top3Ratings = course.ratings.slice(-3).reverse();
    // Calculate average rating
    const averageRating = course.ratings.length > 0
        ? (course.ratings.reduce((acc, r) => { var _a; return acc + ((_a = r.rate) !== null && _a !== void 0 ? _a : 0); }, 0) / course.ratings.length).toFixed(1)
        : 5;
    // حساب نسبة الإنجاز
    const progressPercentage = totalVideos > 0
        ? ((watchedVideosCount / totalVideos) * 100).toFixed(1)
        : "0";
    const _a = course.toObject(), { enrolledUsers, ratings } = _a, courseData = __rest(_a, ["enrolledUsers", "ratings"]);
    res.status(200).json((0, format_res_util_1.default)("Course with progress fetched successfully", {
        course: Object.assign(Object.assign({}, courseData), { sections, topRatings: top3Ratings, averageRating,
            progressPercentage }),
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
//
/**
 * ------------Dashboard Controller------------
 */
const getAllCourses = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const courses = yield Course_1.default.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "enrolledCourses",
                    as: "enrolledUsers",
                },
            },
            {
                $lookup: {
                    from: "users",
                    let: { courseId: "$_id", sections: "$sections" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $in: ["$$courseId", "$enrolledCourses"],
                                },
                            },
                        },
                        {
                            $addFields: {
                                progressForCourse: {
                                    $filter: {
                                        input: "$progress",
                                        as: "prog",
                                        cond: {
                                            $eq: ["$$prog.course", "$$courseId"],
                                        },
                                    },
                                },
                            },
                        },
                        {
                            $addFields: {
                                totalVideos: {
                                    $sum: {
                                        $map: {
                                            input: "$$sections",
                                            as: "section",
                                            in: { $size: "$$section.videos" },
                                        },
                                    },
                                },
                            },
                        },
                        {
                            $addFields: {
                                isCompleted: {
                                    $map: {
                                        input: "$progressForCourse",
                                        as: "prog",
                                        in: {
                                            $eq: [{ $size: "$$prog.watchedVideos" }, "$totalVideos"],
                                        },
                                    },
                                },
                            },
                        },
                        {
                            $match: {
                                isCompleted: { $in: [true] },
                            },
                        },
                    ],
                    as: "completedUsers",
                },
            },
            {
                $sort: { createdAt: -1 },
            },
        ]);
        // Pagination manually for aggregation result
        const paginatedCourses = (0, paginate_1.paginateArray)(courses, page, limit);
        res.json((0, format_res_util_1.default)("Courses fetched successfully", {
            items: (_a = paginatedCourses === null || paginatedCourses === void 0 ? void 0 : paginatedCourses.items) === null || _a === void 0 ? void 0 : _a.map((c) => ({
                _id: c._id,
                title: c.title,
                enrolledCount: c.enrolledUsers.length,
                completedCount: c.completedUsers.length,
                image: c.image,
                totalDuration: c.totalDuration,
                numberOfSections: c.sections.length,
                createdAt: c.createdAt,
            })),
            totalItems: paginatedCourses === null || paginatedCourses === void 0 ? void 0 : paginatedCourses.totalItems,
            totalPages: paginatedCourses === null || paginatedCourses === void 0 ? void 0 : paginatedCourses.totalPages,
            currentPage: paginatedCourses === null || paginatedCourses === void 0 ? void 0 : paginatedCourses.currentPage,
        }));
    }
    catch (err) {
        next(err);
    }
});
exports.getAllCourses = getAllCourses;
// get single course for dashboard
const getSingleCourse = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const course = yield Course_1.default.findById(req.params.id).populate("sections.videos");
        res.json((0, format_res_util_1.default)("Course fetched successfully", course));
    }
    catch (err) {
        next(err);
    }
});
exports.getSingleCourse = getSingleCourse;
// delete course
const deleteCourse = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const course = yield Course_1.default.findByIdAndDelete(req.params.id);
        if (!course)
            throw new app_error_util_1.default("Course not found", 404);
        res.json((0, format_res_util_1.default)("Course deleted successfully", {}));
    }
    catch (err) {
        next(err);
    }
});
exports.deleteCourse = deleteCourse;
