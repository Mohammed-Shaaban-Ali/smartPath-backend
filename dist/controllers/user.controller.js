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
exports.blockUserController = exports.getSingleUserDashboardController = exports.getAllUsersController = exports.getUserRoadmapController = exports.markItemAsCompleted = exports.addRoadmapToUser = exports.deleteUserController = exports.updatePasswordController = exports.updateUserController = void 0;
const user_service_1 = require("../services/user.service");
const format_res_util_1 = __importDefault(require("../utils/format-res.util"));
const app_error_util_1 = __importDefault(require("../utils/app-error.util"));
const authentication_service_1 = require("../services/authentication.service");
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const Roadmap_1 = require("../Schema/Roadmap");
const models_1 = require("../models");
const paginate_1 = require("../utils/paginate");
const updateUserController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const updateData = req.body; // Use Partial to allow optional fields
        // Upload new image if provided
        if (req.file) {
            const result = yield cloudinary_1.default.uploader.upload(req.file.path, {
                folder: "users",
                resource_type: "image",
            });
            updateData.avatar = result.secure_url;
        }
        // Check if the user is trying to update the password
        if (updateData.password) {
            throw new app_error_util_1.default("Password updates must be done through the dedicated update password endpoint.", 400);
        }
        // Fetch the existing user to ensure it exists
        const existingUser = yield (0, user_service_1.findUserById)(userId);
        if (!existingUser) {
            throw new app_error_util_1.default("User not found.", 400);
        }
        // Update the user with the provided data
        const updatedUser = yield (0, user_service_1.updateUser)(userId, updateData);
        // Remove the password from the response
        const _a = updatedUser.toObject(), { password, progress, enrolledCourses } = _a, userWithoutPassword = __rest(_a, ["password", "progress", "enrolledCourses"]);
        res
            .status(200)
            .json((0, format_res_util_1.default)("User updated successfully", { user: userWithoutPassword }));
    }
    catch (err) {
        next(err);
    }
});
exports.updateUserController = updateUserController;
const updatePasswordController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, newPassword } = req.body;
        const user = yield (0, authentication_service_1.getUserByEmail)(email);
        if (!user)
            throw new app_error_util_1.default("User not found", 400);
        if (!email)
            throw new app_error_util_1.default("Email are required", 400);
        if (!newPassword)
            throw new app_error_util_1.default("new password are required", 400);
        // Check if user is verified and updatedAt is within the allowed time frame
        const allowedTimeFrame = 60 * 60 * 1000; // 60 minutes
        const timeDiff = new Date().getTime() - user.updatedAt.getTime();
        if (!user.isVerifiedotp)
            throw new app_error_util_1.default("User is not verified", 400);
        if (timeDiff > allowedTimeFrame) {
            user.isVerifiedotp = false;
            throw new app_error_util_1.default(" time frame has expired", 400);
        }
        yield (0, user_service_1.updateUserPassword)(email, newPassword);
        res.status(200).json((0, format_res_util_1.default)("Password updated successfully", null));
    }
    catch (err) {
        next(err);
    }
});
exports.updatePasswordController = updatePasswordController;
const deleteUserController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = req.email;
        // Find the user by email
        const user = yield (0, authentication_service_1.getUserByEmail)(email);
        if (!user)
            throw new app_error_util_1.default("User not found", 400);
        yield (0, user_service_1.deleteUser)(email);
        res.status(200).json((0, format_res_util_1.default)("User deleted successfully", null));
    }
    catch (err) {
        next(err);
    }
});
exports.deleteUserController = deleteUserController;
// add roadmap
const addRoadmapToUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const { roadmap } = req.body;
        // Validate roadmap
        const parsedRoadmap = Roadmap_1.roadmapSchema.parse(roadmap); // Throws if invalid
        const user = yield (0, user_service_1.findUserById)(userId);
        if (!user)
            throw new app_error_util_1.default("User not found", 404);
        user.roadmap = parsedRoadmap;
        yield user.save();
        res.status(200).json((0, format_res_util_1.default)("Roadmap added successfully", user.roadmap));
    }
    catch (err) {
        next(err);
    }
});
exports.addRoadmapToUser = addRoadmapToUser;
const markItemAsCompleted = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const { stepNumber, categoryTitle, itemTitle } = req.body;
        const user = yield (0, user_service_1.findUserById)(userId);
        if (!user)
            throw new app_error_util_1.default("User not found", 404);
        const step = user.roadmap.steps.find((s) => s.step_number == stepNumber);
        if (!step)
            throw new app_error_util_1.default("Step not found", 404);
        const category = step.categories.find((c) => c.category_title == categoryTitle);
        if (!category)
            throw new app_error_util_1.default("Category not found", 404);
        const item = category.items.find((i) => i.title == itemTitle);
        if (!item)
            throw new app_error_util_1.default("Item not found", 404);
        item.completed = true;
        // Check if all items in category are completed
        const allItemsCompleted = category.items.every((i) => i.completed);
        if (allItemsCompleted) {
            const allCategoriesCompleted = step.categories.every((cat) => cat.items.every((it) => it.completed));
            if (allCategoriesCompleted) {
                step.completed = true;
            }
        }
        user.markModified("roadmap");
        yield user.save();
        // احسب progress لكل step
        const stepsWithProgress = user.roadmap.steps.map((s) => {
            let stepTotalDuration = 0;
            let stepCompletedDuration = 0;
            s.categories.forEach((cat) => {
                cat.items.forEach((it) => {
                    const dur = parseDurationToMinutes(it.duration || "0 minutes");
                    stepTotalDuration += dur;
                    if (it.completed) {
                        stepCompletedDuration += dur;
                    }
                });
            });
            const stepProgress = stepTotalDuration > 0
                ? (stepCompletedDuration / stepTotalDuration) * 100
                : 0;
            return {
                step_number: s.step_number,
                progressPercent: Math.round(stepProgress * 100) / 100,
            };
        });
        // احسب total progress
        let totalDuration = 0;
        let completedDuration = 0;
        user.roadmap.steps.forEach((s) => {
            s.categories.forEach((cat) => {
                cat.items.forEach((it) => {
                    const dur = parseDurationToMinutes(it.duration || "0 minutes");
                    totalDuration += dur;
                    if (it.completed) {
                        completedDuration += dur;
                    }
                });
            });
        });
        const totalProgress = totalDuration > 0 ? (completedDuration / totalDuration) * 100 : 0;
        res.status(200).json((0, format_res_util_1.default)("Item marked as completed", {
            roadmap: user.roadmap,
            progresspercent: Math.round(totalProgress * 100) / 100,
            stepsProgress: stepsWithProgress,
        }));
    }
    catch (err) {
        next(err);
    }
});
exports.markItemAsCompleted = markItemAsCompleted;
function parseDurationToMinutes(durationStr) {
    durationStr = durationStr.trim().toLowerCase();
    let parts = durationStr.split("-").map((s) => s.trim());
    function extractNumAndUnit(str) {
        const match = str.match(/([\d\.]+)\s*(minute|minutes|hour|hours|week|weeks)/);
        if (!match)
            return null;
        return {
            value: parseFloat(match[1]),
            unit: match[2],
        };
    }
    if (parts.length == 2) {
        const end = extractNumAndUnit(parts[1]);
        const start = {
            value: parseFloat(parts[0]),
            unit: end ? end.unit : "minutes",
        };
        if (start && end) {
            if (start.unit === end.unit) {
                const avg = (start.value + end.value) / 2;
                return convertToMinutes(avg, start.unit);
            }
            else {
                const startMin = convertToMinutes(start.value, start.unit);
                console.log(startMin, "startMin for ", start.value, " unit ", start.unit);
                const endMin = convertToMinutes(end.value, end.unit);
                return (startMin + endMin) / 2;
            }
        }
    }
    else {
        const single = extractNumAndUnit(durationStr);
        if (single) {
            return convertToMinutes(single.value, single.unit);
        }
    }
    return 0;
}
function convertToMinutes(value, unit) {
    switch (unit) {
        case "minute":
        case "minutes":
            return value;
        case "hour":
        case "hours":
            return value * 60;
        case "week":
        case "weeks":
            return value * 5 * 8 * 60; // 7 أيام × 8 ساعات دراسة × 60 دقيقة
        default:
            return 0;
    }
}
const getUserRoadmapController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const user = yield (0, user_service_1.findUserById)(userId);
        if (!user)
            throw new app_error_util_1.default("User not found", 404);
        if (!user.roadmap)
            throw new app_error_util_1.default("User roadmap not found", 404);
        let totalDuration = 0;
        let completedDuration = 0;
        const stepsWithProgress = user.roadmap.steps.map((step) => {
            let stepTotalDuration = 0;
            let stepCompletedDuration = 0;
            step.categories.forEach((category) => {
                category.items.forEach((item) => {
                    const dur = parseDurationToMinutes(item.duration || "0 minutes");
                    totalDuration += dur;
                    stepTotalDuration += dur;
                    if (item.completed) {
                        completedDuration += dur;
                        stepCompletedDuration += dur;
                    }
                });
            });
            const stepProgress = stepTotalDuration > 0
                ? (stepCompletedDuration / stepTotalDuration) * 100
                : 0;
            return {
                step_number: step.step_number,
                progressPercent: Math.round(stepProgress * 100) / 100,
            };
        });
        const totalProgress = totalDuration > 0 ? (completedDuration / totalDuration) * 100 : 0;
        res.status(200).json((0, format_res_util_1.default)("User roadmap fetched successfully", {
            roadmap: user.roadmap,
            progresspercent: Math.round(totalProgress * 100) / 100,
            stepsProgress: stepsWithProgress,
        }));
    }
    catch (err) {
        next(err);
    }
});
exports.getUserRoadmapController = getUserRoadmapController;
// ------------dashboard--------------
// get all users for dashboard
const getAllUsersController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Fetch all users with roadmap field populated
        const users = yield models_1.User.find()
            .select("_id name avatar email roadmap enrolledCourses progress isBlocked createdAt")
            .populate("enrolledCourses");
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const paginatedUsers = (0, paginate_1.paginateArray)(users, page, limit);
        const usersWithProgress = yield Promise.all((_a = paginatedUsers === null || paginatedUsers === void 0 ? void 0 : paginatedUsers.items) === null || _a === void 0 ? void 0 : _a.map((user) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            // Roadmap progress
            let progressPercent = null;
            if (user.roadmap &&
                user.roadmap.steps &&
                user.roadmap.steps.length > 0) {
                let totalDuration = 0;
                let completedDuration = 0;
                user.roadmap.steps.forEach((step) => {
                    step.categories.forEach((category) => {
                        category.items.forEach((item) => {
                            const dur = parseDurationToMinutes(item.duration || "0 minutes");
                            totalDuration += dur;
                            if (item.completed) {
                                completedDuration += dur;
                            }
                        });
                    });
                });
                progressPercent =
                    totalDuration > 0
                        ? Math.round((completedDuration / totalDuration) * 10000) / 100
                        : 0;
            }
            const trackName = ((_b = (_a = user === null || user === void 0 ? void 0 : user.roadmap) === null || _a === void 0 ? void 0 : _a.title) === null || _b === void 0 ? void 0 : _b.replace("Learning Roadmap for ", "")) || null;
            // Course Progress
            const courseProgress = yield Promise.all(user.enrolledCourses.map((course) => __awaiter(void 0, void 0, void 0, function* () {
                // Count total videos in course
                const totalVideos = course.sections.reduce((acc, section) => acc + section.videos.length, 0);
                // Find user's watched videos for this course from progress[]
                const userCourseProgress = user.progress.find((p) => p.course.toString() === course._id.toString());
                const watchedVideosCount = userCourseProgress
                    ? userCourseProgress.watchedVideos.length
                    : 0;
                const coursePercent = totalVideos > 0
                    ? Math.round((watchedVideosCount / totalVideos) * 10000) / 100
                    : 0;
                return {
                    _id: course._id,
                    title: course.title,
                    image: course.image,
                    totalVideos,
                    watchedVideos: watchedVideosCount,
                    progress: coursePercent,
                };
            })));
            // Final formatted user
            return {
                _id: user._id,
                name: user.name,
                avatar: user.avatar,
                email: user.email,
                roadmap: {
                    progress: progressPercent,
                    trackName,
                },
                enrolledCourses: courseProgress,
                isBlocked: user.isBlocked,
                createdAt: user.createdAt,
            };
        })));
        res.status(200).json((0, format_res_util_1.default)("Users fetched successfully", {
            items: usersWithProgress,
            totalItems: paginatedUsers.totalItems,
            totalPages: paginatedUsers.totalPages,
            currentPage: paginatedUsers.currentPage,
            perPage: paginatedUsers.perPage,
        }));
    }
    catch (err) {
        next(err);
    }
});
exports.getAllUsersController = getAllUsersController;
const getSingleUserDashboardController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
        const user = yield models_1.User.findById(id).populate("enrolledCourses");
        // .populate("progress.course");
        // .populate("progress.watchedVideos");
        if (!user) {
            res.status(404).json((0, format_res_util_1.default)("User not found"));
            return;
        }
        // Roadmap progress calculation
        let progressPercent = null;
        let totalItems = 0;
        let completedItems = 0;
        if (user.roadmap && user.roadmap.steps && user.roadmap.steps.length > 0) {
            user.roadmap.steps.forEach((step) => {
                step.categories.forEach((category) => {
                    category.items.forEach((item) => {
                        totalItems += 1;
                        if (item.completed) {
                            completedItems += 1;
                        }
                    });
                });
            });
            progressPercent =
                totalItems > 0
                    ? Math.round((completedItems / totalItems) * 10000) / 100
                    : 0;
        }
        const trackName = ((_b = (_a = user === null || user === void 0 ? void 0 : user.roadmap) === null || _a === void 0 ? void 0 : _a.title) === null || _b === void 0 ? void 0 : _b.replace("Learning Roadmap for ", "")) || null;
        // Enrolled courses & course progress
        const courseProgress = yield Promise.all(user.enrolledCourses.map((course) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const totalVideos = course.sections.reduce((acc, section) => acc + section.videos.length, 0);
            const userCourseProgress = user.progress.find((p) => p.course._id.toString() === course._id.toString());
            const watchedVideosCount = userCourseProgress
                ? userCourseProgress.watchedVideos.length
                : 0;
            const coursePercent = totalVideos > 0
                ? Math.round((watchedVideosCount / totalVideos) * 10000) / 100
                : 0;
            const userRating = (_a = course.ratings.find((r) => r.user.toString() === user._id.toString())) === null || _a === void 0 ? void 0 : _a.rate;
            return {
                _id: course._id,
                title: course.title,
                image: course.image,
                totalVideos,
                watchedVideos: watchedVideosCount,
                progress: coursePercent,
                userRating: userRating || null,
            };
        })));
        const totalWatchedVideos = user.progress.reduce((acc, prog) => acc + prog.watchedVideos.length, 0);
        res.status(200).json((0, format_res_util_1.default)("User fetched successfully", {
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            roadmap: {
                progress: progressPercent,
                trackName,
                totalItems,
                completedItems,
            },
            enrolledCoursesCount: user.enrolledCourses.length,
            enrolledCourses: courseProgress,
            totalWatchedVideos,
            createdAt: user.createdAt,
        }));
    }
    catch (err) {
        next(err);
    }
});
exports.getSingleUserDashboardController = getSingleUserDashboardController;
// make user Blocked
const blockUserController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const user = yield (0, user_service_1.findUserById)(id);
        if (!user)
            throw new app_error_util_1.default("User not found", 400);
        user.isBlocked = !user.isBlocked;
        yield user.save();
        res
            .status(200)
            .json((0, format_res_util_1.default)(user.isBlocked ? "Blocked successfully" : "Unblocked successfully", user));
    }
    catch (err) {
        next(err);
    }
});
exports.blockUserController = blockUserController;
