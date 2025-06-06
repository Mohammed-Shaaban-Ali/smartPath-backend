import { Request, Response, NextFunction } from "express";
import Course from "../models/Course";
import User from "../models/User";
import formatRes from "../utils/format-res.util";
import asyncHandler from "../utils/async-handler.util";
import { AuthRequest } from "../middlewares/authentication.middleware";
import mongoose from "mongoose";
import Track from "../models/Track";
import { paginateArray } from "../utils/paginate";
import { markItemAsCompleted } from "./user.controller";

// types
interface Video {
  title: string;
  duration: number;
  videoUrl?: string;
}

interface Section {
  title: string;
  videos: Video[];
}

interface CreateCourseRequest extends Request {
  files?:
    | Express.Multer.File[]
    | {
        [fieldname: string]: Express.Multer.File[];
      };
  body: {
    title: string;
    description: string;
    sections: string;
    track: string; // Assuming track is a string ID
  };
}

// Create Course with videos and image upload
export const createCourse = async (
  req: CreateCourseRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, description, sections, track } = req.body;
    if (!title || !description || !sections || !track) {
      res.status(400).json(formatRes("All fields are required"));
      return;
    }

    const trackExists = await Track.findById(track);
    if (!trackExists) {
      res.status(404).json(formatRes("Track not found"));
      return;
    }

    let imageUrl;
    let videoUrl: string[] = [];
    (req.files as Express.Multer.File[])?.forEach(
      (file: Express.Multer.File) => {
        if (file.fieldname === "image") {
          imageUrl = file.path;
        } else if (file.fieldname.includes("video")) {
          videoUrl.push(file.path);
        }
      }
    );

    if (!imageUrl) {
      console.log("Image not uploaded correctly");
    }

    const parsedSections: Section[] = JSON.parse(sections);

    let totalCourseDuration = 0;

    const finalSections = parsedSections.map((section, index) => {
      let sectionDuration = 0;

      const videos = section.videos.map((vid, vidIndex) => {
        if (!videoUrl[vidIndex]) {
          console.log(
            `Video not uploaded correctly for section-${index}-video-${vidIndex}`
          );
        }

        sectionDuration += vid.duration;

        return {
          ...vid,
          videoUrl: videoUrl[vidIndex] || "",
        };
      });

      totalCourseDuration += sectionDuration;

      return {
        title: section.title,
        totalDuration: sectionDuration,
        videos,
      };
    });

    const course = await Course.create({
      title,
      description,
      image: imageUrl,
      totalDuration: totalCourseDuration,
      track: trackExists._id,
      sections: finalSections,
    });

    res.status(201).json({
      message: "Course created",
      course,
    });
  } catch (err) {
    next(err);
  }
};

// Get All Courses
export const getCourses = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthRequest).userId;
  const user = await User.findById(userId).lean();
  // check if user exists
  if (!user) {
    throw new Error("User not found");
  }
  const { search } = req.query;
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 10;
  const searchRegex = search ? new RegExp(search as string, "i") : null;

  const courses = await Course.aggregate([
    {
      $lookup: {
        from: "tracks",
        localField: "track",
        foreignField: "_id",
        as: "track",
      },
    },
    { $unwind: "$track" },
    {
      $match: searchRegex
        ? {
            $or: [
              { title: searchRegex },
              { description: searchRegex },
              { "track.title": searchRegex },
            ],
          }
        : {},
    },
    {
      $project: {
        title: 1,
        image: 1,
        description: 1,
        totalDuration: 1,
        ratings: 1,
        "track.title": 1,
      },
    },
  ]);

  const formattedCourses = courses.map((course) => {
    const ratings = course.ratings || [];
    const averageRating =
      ratings.length > 0
        ? ratings.reduce(
            (sum: number, rate: any) => sum + (rate?.rate || 0),
            0
          ) / ratings.length
        : 0;

    const isEnrollment = user?.enrolledCourses.some(
      (id) => id.toString() === course._id.toString()
    );

    return {
      id: course._id,
      title: course.title,
      image: course.image,
      description: course.description,
      totalDuration: course.totalDuration,
      averageRating: averageRating.toFixed(1),
      track: course.track,
      isEnrollment, // 🔥 added here
    };
  });

  const coursesWithPageination = paginateArray(formattedCourses, page, limit);
  res.status(200).json(
    formatRes("Courses fetched successfully", {
      coursesWithPageination,
    })
  );
});

// Enroll in course
export const enrollInCourse = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { courseId } = req.params;
    const userId = req.userId as string;
    await User.findByIdAndUpdate(userId, {
      $addToSet: { enrolledCourses: courseId },
    });
    await Course.findByIdAndUpdate(courseId, {
      $addToSet: { enrolledUsers: userId },
    });

    res.status(200).json(formatRes("Enrolled in course successfully"));
  }
);

// Get user courses
export const getUserCourses = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.userId as string;

    const user = await User.findById(userId).populate({
      path: "enrolledCourses",
      select: "title description image totalDuration ratings",
    });
    // check if user exists
    if (!user) {
      return res.status(404).json(formatRes("User not found"));
    }
    const formattedCourses = user?.enrolledCourses?.map((course: any) => {
      const ratings = course.ratings || [];
      const averageRating =
        ratings.length > 0
          ? ratings.reduce(
              (sum: number, rate: any) => sum + (rate.rating ?? 0),
              0
            ) / ratings.length
          : 0;

      return {
        _id: course._id,
        title: course.title,
        description: course.description,
        image: course.image,
        totalDuration: course.totalDuration,
        averageRating,
      };
    });

    res.status(200).json(
      formatRes("User courses fetched successfully", {
        courses: formattedCourses,
      })
    );
  }
);

// Get course with progress
export const getCourseWithProgress = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { courseId } = req.params;
    const userId = (req as AuthRequest).userId as string;

    const user = await User.findById(userId);
    const course = await Course.findById(courseId).populate({
      path: "track",
      select: "title",
    });

    if (!user || !course) {
      res.status(404).json(formatRes("User or course not found"));
      return;
    }

    // Check if user enrolled in course
    const isEnrolled = course.enrolledUsers.some(
      (id: any) => id.toString() === userId
    );

    if (!isEnrolled) {
      res.status(403).json(formatRes("User not enrolled in course"));
      return;
    }

    const progress = user.progress.find(
      (p: any) => p.course.toString() === courseId
    );

    const sections = course.sections.map((section: any) => {
      const videos = section.videos.map((video: any) => {
        const watched =
          progress?.watchedVideos.includes(video._id.toString()) || false;
        return { ...video.toObject(), watched };
      });

      const allWatched = videos.every((v: any) => v.watched);
      return { ...section.toObject(), videos, allWatched };
    });

    // Get top 3 ratings (by latest added — reverse order)
    const top3Ratings = course.ratings
      .slice(-3) // last 3
      .reverse();

    // Calculate average rating
    const averageRating =
      course.ratings.length > 0
        ? (
            course.ratings.reduce(
              (acc: number, r: any) => acc + (r.rate ?? 0),
              0
            ) / course.ratings.length
          ).toFixed(1)
        : 5;

    // Prepare final course data without enrolledUsers
    const { enrolledUsers, ratings, ...courseData } = course.toObject();

    res.status(200).json(
      formatRes("Course with progress fetched successfully", {
        course: {
          ...courseData,
          sections,
          topRatings: top3Ratings,
          averageRating,
        },
      })
    );
  }
);

// Mark video as watched
export const markVideoAsWatched = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.userId as string;
    const { courseId, videoId } = req.body;

    const user = await User.findById(userId);
    const course = await Course.findById(courseId);
    if (!user) {
      res.status(404).json(formatRes("User not found"));
      return;
    }
    if (!course) {
      res.status(404).json(formatRes("Course not found"));
      return;
    }

    // Check if user enrolled in course
    const isEnrolled = course.enrolledUsers.some(
      (id: any) => id.toString() === userId
    );
    if (!isEnrolled) {
      res.status(403).json(formatRes("User not enrolled in course"));
      return;
    }

    // Find progress for this course
    let progress = user.progress.find(
      (p: any) => p.course.toString() === courseId
    );

    // If no progress, create one
    if (!progress) {
      user.progress.push({
        course: courseId,
        watchedVideos: [],
      });
      progress = user.progress.find(
        (p: any) => p.course.toString() === courseId
      );
    }

    // If video not already watched, add it
    if (!progress!.watchedVideos.some((id: any) => id.toString() === videoId)) {
      progress!.watchedVideos.push(new mongoose.Types.ObjectId(videoId));
    }

    await user.save();

    res.status(200).json(
      formatRes("Video marked as watched successfully", {
        progress,
      })
    );
  }
);

//
/**
 * ------------Dashboard Controller------------
 */
export const getAllCourses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    const courses = await Course.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "enrolledCourses",
          as: "enrolledUsers",
        },
      },
      {
        $lookup: {
          from: "users",
          let: { courseId: "$_id", sections: "$sections" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$$courseId", "$enrolledCourses"],
                },
              },
            },
            {
              $addFields: {
                progressForCourse: {
                  $filter: {
                    input: "$progress",
                    as: "prog",
                    cond: {
                      $eq: ["$$prog.course", "$$courseId"],
                    },
                  },
                },
              },
            },
            {
              $addFields: {
                totalVideos: {
                  $sum: {
                    $map: {
                      input: "$$sections",
                      as: "section",
                      in: { $size: "$$section.videos" },
                    },
                  },
                },
              },
            },
            {
              $addFields: {
                isCompleted: {
                  $map: {
                    input: "$progressForCourse",
                    as: "prog",
                    in: {
                      $eq: [{ $size: "$$prog.watchedVideos" }, "$totalVideos"],
                    },
                  },
                },
              },
            },
            {
              $match: {
                isCompleted: { $in: [true] },
              },
            },
          ],
          as: "completedUsers",
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    // Pagination manually for aggregation result
    const paginatedCourses = paginateArray(courses, page, limit);

    res.json(
      formatRes("Courses fetched successfully", {
        items: paginatedCourses?.items?.map((c) => ({
          _id: c._id,
          title: c.title,
          enrolledCount: c.enrolledUsers.length,
          completedCount: c.completedUsers.length,
          image: c.image,
          totalDuration: c.totalDuration,
          numberOfSections: c.sections.length,
        })),
        totalItems: paginatedCourses?.totalItems,
        totalPages: paginatedCourses?.totalPages,
        currentPage: paginatedCourses?.currentPage,
      })
    );
  } catch (err) {
    next(err);
  }
};

// get single course for dashboard
export const getSingleCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const course = await Course.findById(req.params.id).populate(
      "sections.videos"
    );
    res.json(formatRes("Course fetched successfully", course));
  } catch (err) {
    next(err);
  }
};
