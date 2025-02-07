import type { NextFunction, Request, Response } from "express";
import {
  updateUser,
  deleteUser,
  updateUserPassword,
  findUserById,
} from "../services/user.service";
import formatRes from "../utils/format-res.util";
import AppError from "../utils/app-error.util";
import type { UserDTO } from "../types/dtos/user.dto";
import { getUserByEmail } from "../services/authentication.service";
import { AuthRequest } from "../middlewares/authentication.middleware";
import { IUser } from "../models/User";
export const updateUserController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId as string;

    const updateData: Partial<UserDTO> = req.body; // Use Partial to allow optional fields

    // Check if the user is trying to update the password
    if (updateData.password) {
      throw new AppError(
        "Password updates must be done through the dedicated update password endpoint.",
        400
      );
    }

    // Fetch the existing user to ensure it exists
    const existingUser = await findUserById(userId);
    if (!existingUser) {
      throw new AppError("User not found.", 400);
    }

    // Update the user with the provided data
    const updatedUser = await updateUser(userId, updateData);

    // Remove the password from the response
    const { password, ...userWithoutPassword } = updatedUser.toObject();

    res
      .status(200)
      .json(
        formatRes("User updated successfully", { user: userWithoutPassword })
      );
  } catch (err) {
    next(err);
  }
};

export const updatePasswordController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, newPassword } = req.body;

    const user = await getUserByEmail(email);
    if (!user) throw new AppError("User not found", 400);

    if (!email) throw new AppError("Email are required", 400);
    if (!newPassword) throw new AppError("new password are required", 400);

    // Check if user is verified and updatedAt is within the allowed time frame
    const allowedTimeFrame = 60 * 60 * 1000; // 60 minutes
    const timeDiff = new Date().getTime() - user.updatedAt.getTime();

    if (!user.isVerifiedotp) throw new AppError("User is not verified", 400);

    if (timeDiff > allowedTimeFrame) {
      user.isVerifiedotp = false;
      throw new AppError(" time frame has expired", 400);
    }

    await updateUserPassword(email, newPassword);

    res.status(200).json(formatRes("Password updated successfully", null));
  } catch (err) {
    next(err);
  }
};

export const deleteUserController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const email = req.email as string;

    // Find the user by email
    const user = await getUserByEmail(email);
    if (!user) throw new AppError("User not found", 400);
    await deleteUser(email);

    res.status(200).json(formatRes("User deleted successfully", null));
  } catch (err) {
    next(err);
  }
};
