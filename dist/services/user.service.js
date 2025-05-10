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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserById = exports.deleteUser = exports.updateUserPassword = exports.updateUser = void 0;
const User_1 = __importDefault(require("../models/User"));
const app_error_util_1 = __importDefault(require("../utils/app-error.util"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const authentication_service_1 = require("./authentication.service"); // Corrected import path
const updateUser = (userId, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User_1.default.findById(userId);
    if (!user) {
        throw new app_error_util_1.default("User not found", 404);
    }
    // Update only the fields that are provided
    Object.assign(user, updateData);
    yield user.save();
    return user;
});
exports.updateUser = updateUser;
const updateUserPassword = (email, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield (0, authentication_service_1.getUserByEmail)(email);
    if (!user) {
        throw new app_error_util_1.default("User not found", 404);
    }
    // Hash and update new password
    const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
    user.password = hashedPassword;
    yield user.save();
});
exports.updateUserPassword = updateUserPassword;
const deleteUser = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User_1.default.findOneAndDelete({ email });
    if (!user) {
        throw new app_error_util_1.default("User not found", 404);
    }
    return user;
});
exports.deleteUser = deleteUser;
const findUserById = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield User_1.default.findById(userId);
});
exports.findUserById = findUserById;
