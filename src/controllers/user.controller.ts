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
      const allCategoriesCompleted = step.categories.every((cat) =>
        cat.items.every((it) => it.completed)
      );
      if (allCategoriesCompleted) {
        step.completed = true;
      }
    }

    user.markModified("roadmap");
    await user.save();

    // احسب progress لكل step
    const stepsWithProgress = user.roadmap.steps.map((s) => {
      let stepTotalDuration = 0;
      let stepCompletedDuration = 0;

      s.categories.forEach((cat) => {
        cat.items.forEach((it) => {
          const dur = parseDurationToMinutes(it.duration || "0 minutes");
          stepTotalDuration += dur;
          if (it.completed) {
            stepCompletedDuration += dur;
          }
        });
      });

      const stepProgress =
        stepTotalDuration > 0
          ? (stepCompletedDuration / stepTotalDuration) * 100
          : 0;

      return {
        step_number: s.step_number,
        progressPercent: Math.round(stepProgress * 100) / 100,
      };
    });

    // احسب total progress
    let totalDuration = 0;
    let completedDuration = 0;
    user.roadmap.steps.forEach((s) => {
      s.categories.forEach((cat) => {
        cat.items.forEach((it) => {
          const dur = parseDurationToMinutes(it.duration || "0 minutes");
          totalDuration += dur;
          if (it.completed) {
            completedDuration += dur;
          }
        });
      });
    });

    const totalProgress =
      totalDuration > 0 ? (completedDuration / totalDuration) * 100 : 0;

    res.status(200).json(
      formatRes("Item marked as completed", {
        roadmap: user.roadmap,
        progresspercent: Math.round(totalProgress * 100) / 100,
        stepsProgress: stepsWithProgress,
      })
    );
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
    if (!user.roadmap) throw new AppError("User roadmap not found", 404);

    let totalDuration = 0;
    let completedDuration = 0;

    const stepsWithProgress = user.roadmap.steps.map((step) => {
      let stepTotalDuration = 0;
      let stepCompletedDuration = 0;

      step.categories.forEach((category) => {
        category.items.forEach((item) => {
          const dur = parseDurationToMinutes(item.duration || "0 minutes");
          totalDuration += dur;
          stepTotalDuration += dur;

          if (item.completed) {
            completedDuration += dur;
            stepCompletedDuration += dur;
          }
        });
      });

      const stepProgress =
        stepTotalDuration > 0
          ? (stepCompletedDuration / stepTotalDuration) * 100
          : 0;

      return {
        step_number: step.step_number,
        progressPercent: Math.round(stepProgress * 100) / 100,
      };
    });

    const totalProgress =
      totalDuration > 0 ? (completedDuration / totalDuration) * 100 : 0;

    res.status(200).json(
      formatRes("User roadmap fetched successfully", {
        roadmap: user.roadmap,
        progresspercent: Math.round(totalProgress * 100) / 100,
        stepsProgress: stepsWithProgress,
      })
    );
  } catch (err) {
    next(err);
  }
};

// ------------dashboard--------------
// get all users for dashboard
export const getAllUsersController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Fetch all users with roadmap field populated
    const users = await User.find()
      .select(
        "_id name avatar email roadmap enrolledCourses progress isBlocked createdAt"
      )
      .populate("enrolledCourses");

    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const paginatedUsers = paginateArray(users, page, limit);

    const usersWithProgress = await Promise.all(
      paginatedUsers?.items?.map(async (user) => {
        // Roadmap progress
        let progressPercent = null;

        if (
          user.roadmap &&
          user.roadmap.steps &&
          user.roadmap.steps.length > 0
        ) {
          let totalDuration = 0;
          let completedDuration = 0;

          user.roadmap.steps.forEach((step) => {
            step.categories.forEach((category) => {
              category.items.forEach((item) => {
                const dur = parseDurationToMinutes(
                  item.duration || "0 minutes"
                );
                totalDuration += dur;
                if (item.completed) {
                  completedDuration += dur;
                }
              });
            });
          });

          progressPercent =
            totalDuration > 0
              ? Math.round((completedDuration / totalDuration) * 10000) / 100
              : 0;
        }

        const trackName =
          user?.roadmap?.title?.replace("Learning Roadmap for ", "") || null;

        // Course Progress
        const courseProgress = await Promise.all(
          user.enrolledCourses.map(async (course: any) => {
            // Count total videos in course
            const totalVideos = course.sections.reduce(
              (acc: number, section: any) => acc + section.videos.length,
              0
            );

            // Find user's watched videos for this course from progress[]
            const userCourseProgress = user.progress.find(
              (p) => p.course.toString() === course._id.toString()
            );

            const watchedVideosCount = userCourseProgress
              ? userCourseProgress.watchedVideos.length
              : 0;

            const coursePercent =
              totalVideos > 0
                ? Math.round((watchedVideosCount / totalVideos) * 10000) / 100
                : 0;

            return {
              _id: course._id,
              title: course.title,
              image: course.image,
              totalVideos,
              watchedVideos: watchedVideosCount,
              progress: coursePercent,
            };
          })
        );

        // Final formatted user
        return {
          _id: user._id,
          name: user.name,
          avatar: user.avatar,
          email: user.email,
          roadmap: {
            progress: progressPercent,
            trackName,
          },
          enrolledCourses: courseProgress,
          isBlocked: user.isBlocked,
          createdAt: user.createdAt,
        };
      })
    );

    res.status(200).json(
      formatRes("Users fetched successfully", {
        items: usersWithProgress,
        totalItems: paginatedUsers.totalItems,
        totalPages: paginatedUsers.totalPages,
        currentPage: paginatedUsers.currentPage,
        perPage: paginatedUsers.perPage,
      })
    );
  } catch (err) {
    next(err);
  }
};

export const getSingleUserDashboardController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).populate("enrolledCourses");
    // .populate("progress.course");
    // .populate("progress.watchedVideos");
    if (!user) {
      res.status(404).json(formatRes("User not found"));
      return;
    }

    // Roadmap progress calculation
    let progressPercent = null;
    let totalItems = 0;
    let completedItems = 0;

    if (user.roadmap && user.roadmap.steps && user.roadmap.steps.length > 0) {
      user.roadmap.steps.forEach((step) => {
        step.categories.forEach((category) => {
          category.items.forEach((item) => {
            totalItems += 1;
            if (item.completed) {
              completedItems += 1;
            }
          });
        });
      });

      progressPercent =
        totalItems > 0
          ? Math.round((completedItems / totalItems) * 10000) / 100
          : 0;
    }

    const trackName =
      user?.roadmap?.title?.replace("Learning Roadmap for ", "") || null;

    // Enrolled courses & course progress
    const courseProgress = await Promise.all(
      user.enrolledCourses.map(async (course: any) => {
        const totalVideos = course.sections.reduce(
          (acc: number, section: any) => acc + section.videos.length,
          0
        );

        const userCourseProgress = user.progress.find(
          (p) => p.course._id.toString() === course._id.toString()
        );

        const watchedVideosCount = userCourseProgress
          ? userCourseProgress.watchedVideos.length
          : 0;

        const coursePercent =
          totalVideos > 0
            ? Math.round((watchedVideosCount / totalVideos) * 10000) / 100
            : 0;

        const userRating = course.ratings.find(
          (r: any) => r.user.toString() === user._id.toString()
        )?.rate;

        return {
          _id: course._id,
          title: course.title,
          image: course.image,
          totalVideos,
          watchedVideos: watchedVideosCount,
          progress: coursePercent,
          userRating: userRating || null,
        };
      })
    );

    const totalWatchedVideos = user.progress.reduce(
      (acc, prog) => acc + prog.watchedVideos.length,
      0
    );

    res.status(200).json(
      formatRes("User fetched successfully", {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        roadmap: {
          progress: progressPercent,
          trackName,
          totalItems,
          completedItems,
        },
        enrolledCoursesCount: user.enrolledCourses.length,
        enrolledCourses: courseProgress,
        totalWatchedVideos,
        createdAt: user.createdAt,
      })
    );
  } catch (err) {
    next(err);
  }
};

// make user Blocked
export const blockUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;
    const user = await findUserById(id);
    if (!user) throw new AppError("User not found", 400);
    user.isBlocked = !user.isBlocked;
    await user.save();
    res
      .status(200)
      .json(
        formatRes(
          user.isBlocked ? "Blocked successfully" : "Unblocked successfully",
          user
        )
      );
  } catch (err) {
    next(err);
  }
};
