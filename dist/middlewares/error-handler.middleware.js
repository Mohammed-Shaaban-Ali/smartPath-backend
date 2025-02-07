"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const app_error_util_1 = __importDefault(require("../utils/app-error.util"));
const errorHandler = (err, req, res, next) => {
    let message = err.message || "Internal Server Error";
    let statusCode = 500;
    let data = null;
    // Handle AppError (custom errors)
    if (err instanceof app_error_util_1.default) {
        statusCode = err.statusCode;
        message = err.message;
    }
    // Handle Mongoose ValidationError
    if (err instanceof mongoose_1.default.Error.ValidationError) {
        statusCode = 400;
        message =
            "Validation failed: " +
                Object.values(err.errors)
                    .map((e) => e.message)
                    .join(", ");
        data = err.errors; // Send back the validation errors
    }
    // Handle Mongoose CastError
    if (err instanceof mongoose_1.default.Error.CastError) {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value} is not a valid value for ${err.kind === "ObjectId" ? "ObjectId" : err.path}`;
    }
    // Handle MongoDB errors (duplicate keys or other MongoServerErrors)
    if (err instanceof mongoose_1.default.mongo.MongoServerError) {
        statusCode = 400;
        message = "Database error occurred. Likely a duplicate key.";
        data = err; // Send back the error details
    }
    // Send the response
    res.status(statusCode).json({
        success: false,
        message,
        data,
    });
};
exports.default = errorHandler;
