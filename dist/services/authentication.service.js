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
exports.createUser = exports.getUserByEmail = void 0;
const User_1 = __importDefault(require("../models/User"));
const app_error_util_1 = __importDefault(require("../utils/app-error.util"));
// Retrieves a user from the database by their email address.
const getUserByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findOne({ email });
        return user;
    }
    catch (error) {
        throw new app_error_util_1.default("Error fetching user", 500);
    }
});
exports.getUserByEmail = getUserByEmail;
// Creates a new user in the database.
const createUser = (userData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!userData.email || !userData.password) {
            throw new app_error_util_1.default("Missing required fields", 400);
        }
        const user = new User_1.default(userData);
        const createdUser = yield user.save();
        return createdUser;
    }
    catch (error) {
        if (error instanceof app_error_util_1.default)
            throw error;
        throw new app_error_util_1.default("Error creating user", 500);
    }
});
exports.createUser = createUser;
