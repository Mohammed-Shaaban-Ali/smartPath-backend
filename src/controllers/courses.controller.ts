import { Request, Response, NextFunction } from "express";
import Course from "../models/Course";
import User from "../models/User";
import formatRes from "../utils/format-res.util";
import asyncHandler from "../utils/async-handler.util";
import { AuthRequest } from "../middlewares/authentication.middleware";
import mongoose from "mongoose";
import Track from "../models/Track";
import { paginateArray } from "../utils/paginate";

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
) => {
  try {
    const { title, description, sections, track } = req.body;
    if (!title || !description || !sections || !track) {
      return res.status(400).json(formatRes("All fields are required"));
    }

    // Check if track exists
    const trackExists = await Track.findById(track);
    if (!trackExists) {
      return res.status(404).json(formatRes("Track not found"));
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
    // Parse sections
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
      image: imageUrl, // إضافة رابط الصورة
      totalDuration: totalCourseDuration,
      track: trackExists._id, // استخدام معرف المسار
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

    return {
      id: course._id,
      title: course.title,
      image: course.image,
      description: course.description,
      totalDuration: course.totalDuration,
      averageRating: averageRating.toFixed(1),
      track: course.track,
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
