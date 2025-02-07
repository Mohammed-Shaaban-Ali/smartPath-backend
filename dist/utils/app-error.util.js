"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/utils/AppError.ts
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.default = AppError;
