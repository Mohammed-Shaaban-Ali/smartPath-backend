import { IUser } from "../models/User";
import User from "../models/User";
import type { UserDTO } from "../types/dtos/user.dto";
import AppError from "../utils/app-error.util";
import bcrypt from "bcrypt";
import { getUserByEmail } from "./authentication.service"; // Corrected import path

export const updateUser = async (
  userId: string,
  updateData: Partial<UserDTO>
): Promise<IUser> => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Update only the fields that are provided
  Object.assign(user, updateData);

  await user.save();
  return user;
};

export const updateUserPassword = async (
  email: string,
  newPassword: string
): Promise<void> => {
  const user = await getUserByEmail(email);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Hash and update new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();
};

export const deleteUser = async (email: string): Promise<IUser> => {
  const user = await User.findOneAndDelete({ email });
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user;
};

export const findUserById = async (userId: string): Promise<IUser | null> => {
  return await User.findById(userId);
};
