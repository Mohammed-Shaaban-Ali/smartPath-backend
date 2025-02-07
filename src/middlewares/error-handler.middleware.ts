// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import AppError from "../utils/app-error.util";

const errorHandler = (
  err: AppError | Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let message = err.message || "Internal Server Error";
  let statusCode = 500;
  let data = null;

  // Handle AppError (custom errors)
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Handle Mongoose ValidationError
  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message =
      "Validation failed: " +
      Object.values(err.errors)
        .map((e: any) => e.message)
        .join(", ");
    data = err.errors; // Send back the validation errors
  }

  // Handle Mongoose CastError
  if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value} is not a valid value for ${err.kind === "ObjectId" ? "ObjectId" : err.path}`;
  }

  // Handle MongoDB errors (duplicate keys or other MongoServerErrors)
  if (err instanceof mongoose.mongo.MongoServerError) {
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

export default errorHandler;
