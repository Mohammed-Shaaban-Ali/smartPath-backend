"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const app_error_util_1 = __importDefault(require("../utils/app-error.util"));
const verify_token_util_1 = require("../utils/verify-token.util");
const authMiddleware = (req, res, next) => {
    var _a;
    const token = (_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", "");
    if (!token)
        throw new app_error_util_1.default("No token, authorization denied", 401);
    try {
        const decoded = (0, verify_token_util_1.verifyToken)(token);
        req.userId = decoded.userId;
        req.email = decoded.email;
        next();
    }
    catch (error) {
        throw new app_error_util_1.default("Token is not valid", 401);
    }
};
exports.authMiddleware = authMiddleware;
