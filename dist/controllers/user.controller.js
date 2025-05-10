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
exports.deleteUserController = exports.updatePasswordController = exports.updateUserController = void 0;
const user_service_1 = require("../services/user.service");
const format_res_util_1 = __importDefault(require("../utils/format-res.util"));
const app_error_util_1 = __importDefault(require("../utils/app-error.util"));
const authentication_service_1 = require("../services/authentication.service");
const updateUserController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const updateData = req.body; // Use Partial to allow optional fields
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
        const _a = updatedUser.toObject(), { password } = _a, userWithoutPassword = __rest(_a, ["password"]);
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
