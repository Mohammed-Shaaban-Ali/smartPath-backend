import { Request, Response, NextFunction } from "express";
import AppError from "../utils/app-error.util";
import { verifyToken } from "../utils/verify-token.util";

export interface AuthRequest extends Request {
  userId?: string;
  email?: string;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) throw new AppError("No token, authorization denied", 401);

  try {
    const decoded = verifyToken(token);
    req.userId = decoded.userId;
    req.email = decoded.email;
    next();
  } catch (error) {
    throw new AppError("Token is not valid", 401);
  }
};
