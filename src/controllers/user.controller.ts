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
import cloudinary from "../config/cloudinary";
import { roadmapSchema } from "../Schema/Roadmap";
import { User } from "../models";
import { paginateArray } from "../utils/paginate";
export const updateUserController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId as string;

    const updateData: Partial<UserDTO> = req.body; // Use Partial to allow optional fields

    // Upload new image if provided
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "users",
        resource_type: "image",
      });
      updateData.avatar = result.secure_url;
    }

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
    const { password, progress, enrolledCourses, ...userWithoutPassword } =
      updatedUser.toObject();

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

// add roadmap
export const addRoadmapToUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId as string;
    const { roadmap } = req.body;

    // Validate roadmap
    const parsedRoadmap = roadmapSchema.parse(roadmap); // Throws if invalid

    const user = await findUserById(userId);
    if (!user) throw new AppError("User not found", 404);

    user.roadmap = parsedRoadmap;
    await user.save();

    res.status(200).json(formatRes("Roadmap added successfully", user.roadmap));
  } catch (err) {
    next(err);
  }
};

export const markItemAsCompleted = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId as string;
    const { stepNumber, categoryTitle, itemTitle } = req.body;

    const user = await findUserById(userId);
    if (!user) throw new AppError("User not found", 404);

    const step = user.roadmap.steps.find((s) => s.step_number == stepNumber);
    if (!step) throw new AppError("Step not found", 404);
    const category = step.categories.find(
      (c) => c.category_title == categoryTitle
    );
    if (!category) throw new AppError("Category not found", 404);
    const item = category.items.find((i) => i.title == itemTitle);
    if (!item) throw new AppError("Item not found", 404);
    item.completed = true;

    // Check if all items in category are completed
    const allItemsCompleted = category.items.every((i) => i.completed);
    if (allItemsCompleted) {
      // Optionally: mark step as completed if all items in all categories are done
      const allCategoriesCompleted = step.categories.every((cat) =>
        cat.items.every((it) => it.completed)
      );
      if (allCategoriesCompleted) {
        step.completed = true;
      }
    }
    user.markModified("roadmap");
    await user.save();
    res.status(200).json(formatRes("Item marked as completed", user.roadmap));
  } catch (err) {
    next(err);
  }
};

function parseDurationToMinutes(durationStr: string): number {
  durationStr = durationStr.trim().toLowerCase();

  let parts = durationStr.split("-").map((s) => s.trim());

  function extractNumAndUnit(str: string) {
    const match = str.match(
      /([\d\.]+)\s*(minute|minutes|hour|hours|week|weeks)/
    );
    if (!match) return null;
    return {
      value: parseFloat(match[1]),
      unit: match[2],
    };
  }

  if (parts.length === 2) {
    const start = extractNumAndUnit(parts[0]);
    const end = extractNumAndUnit(parts[1]);

    if (start && end) {
      if (start.unit === end.unit) {
        const avg = (start.value + end.value) / 2;
        return convertToMinutes(avg, start.unit);
      } else {
        const startMin = convertToMinutes(start.value, start.unit);
        const endMin = convertToMinutes(end.value, end.unit);
        return (startMin + endMin) / 2;
      }
    }
  } else {
    const single = extractNumAndUnit(durationStr);
    if (single) {
      return convertToMinutes(single.value, single.unit);
    }
  }
  return 0;
}

function convertToMinutes(value: number, unit: string): number {
  switch (unit) {
    case "minute":
    case "minutes":
      return value;
    case "hour":
    case "hours":
      return value * 60;
    case "week":
    case "weeks":
      return value * 7 * 8 * 60; // 7 أيام × 8 ساعات دراسة × 60 دقيقة
    default:
      return 0;
  }
}

export const getUserRoadmapController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId as string;

    const user = await findUserById(userId);
    if (!user) throw new AppError("User not found", 404);

    let totalDuration = 0; // بالدقائق
    let completedDuration = 0; // بالدقائق

    // نمر على كل steps، كل category، كل item ونجمع المدد ونحسب المكتمل
    user.roadmap.steps.forEach((step) => {
      step.categories.forEach((category) => {
        category.items.forEach((item) => {
          const dur = parseDurationToMinutes(item.duration || "0 minutes");
          totalDuration += dur;
          if (item.completed) {
            completedDuration += dur;
          }
        });
      });
    });

    // نحسب النسبة
    const progressPercent =
      totalDuration > 0 ? (completedDuration / totalDuration) * 100 : 0;

    // ممكن تضيف النسبة مع الرد
    res.status(200).json(
      formatRes("User roadmap fetched successfully", {
        ...user.roadmap,
        progressPercent: Math.round(progressPercent * 100) / 100, // تقريب لـ 2 رقم عشري
      })
    );
  } catch (err) {
    next(err);
  }
};

// get all users for dashboard
export const getAllUsersController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await User.find().select("_id name avatar email");
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const usersWithPageination = paginateArray(users, page, limit);

    res
      .status(200)
      .json(
        formatRes("User updated successfully",   usersWithPageination )
      );
  } catch (err) {
    next(err);
  }
};
