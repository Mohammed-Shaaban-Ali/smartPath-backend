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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsersAndUsersWithRoadmaps = exports.getAllUserWithUserEnrollMentIncourse = void 0;
exports.getMonthName = getMonthName;
const models_1 = require("../models");
// Helper function for month names
function getMonthName(monthNumber) {
    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];
    return months[monthNumber - 1];
}
const getAllUserWithUserEnrollMentIncourse = () => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Aggregate users per month
    const stats = yield models_1.User.aggregate([
        {
            $group: {
                _id: {
                    year: { $year: "$createdAt" },
                    month: { $month: "$createdAt" },
                },
                totalUsers: { $sum: 1 },
                enrolledUsers: {
                    $sum: {
                        $cond: [{ $gt: [{ $size: "$enrolledCourses" }, 0] }, 1, 0],
                    },
                },
            },
        },
    ]);
    const currentYear = new Date().getFullYear();
    // 2. Prepare months data from 1 to 12 with default 0s
    const monthlyStats = [];
    for (let m = 1; m <= 12; m++) {
        const found = stats.find((s) => s._id.month === m && s._id.year === currentYear);
        monthlyStats.push({
            month: getMonthName(m),
            totalUsers: found ? found.totalUsers : 0,
            enrolledUsers: found ? found.enrolledUsers : 0,
        });
    }
    // 3. Combine every two months
    const twoMonthsStats = [];
    for (let i = 0; i < 12; i += 2) {
        const firstMonth = monthlyStats[i];
        const secondMonth = monthlyStats[i + 1] || {
            totalUsers: 0,
            enrolledUsers: 0,
        };
        twoMonthsStats.push({
            period: firstMonth.month, // name of the first month
            totalUsers: firstMonth.totalUsers + secondMonth.totalUsers,
            enrolledUsers: firstMonth.enrolledUsers + secondMonth.enrolledUsers,
        });
    }
    return twoMonthsStats;
});
exports.getAllUserWithUserEnrollMentIncourse = getAllUserWithUserEnrollMentIncourse;
const getAllUsersAndUsersWithRoadmaps = () => __awaiter(void 0, void 0, void 0, function* () {
    const stats = yield models_1.User.aggregate([
        {
            $group: {
                _id: {
                    year: { $year: "$createdAt" },
                    month: { $month: "$createdAt" },
                },
                totalUsers: { $sum: 1 },
                usersWithRoadmaps: {
                    $sum: {
                        $cond: [{ $ifNull: ["$roadmap", false] }, 1, 0],
                    },
                },
            },
        },
    ]);
    const currentYear = new Date().getFullYear();
    const monthlyStats = [];
    for (let m = 1; m <= 12; m++) {
        const found = stats.find((s) => s._id.month === m && s._id.year === currentYear);
        monthlyStats.push({
            month: getMonthName(m),
            totalUsers: found ? found.totalUsers : 0,
            usersWithRoadmaps: found ? found.usersWithRoadmaps : 0,
        });
    }
    const twoMonthsStats = [];
    for (let i = 0; i < 12; i += 2) {
        const firstMonth = monthlyStats[i];
        const secondMonth = monthlyStats[i + 1] || {
            totalUsers: 0,
            usersWithRoadmaps: 0,
        };
        twoMonthsStats.push({
            period: firstMonth.month,
            totalUsers: firstMonth.totalUsers + secondMonth.totalUsers,
            usersWithRoadmaps: firstMonth.usersWithRoadmaps + secondMonth.usersWithRoadmaps,
        });
    }
    return twoMonthsStats;
});
exports.getAllUsersAndUsersWithRoadmaps = getAllUsersAndUsersWithRoadmaps;
