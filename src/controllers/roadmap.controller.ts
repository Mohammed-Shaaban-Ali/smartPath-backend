import { Request, Response, NextFunction } from "express";
import Roadmap from "../models/Roadmap";
import cloudinary from "../config/cloudinary";
import AppError from "../utils/app-error.util";
import formatRes from "../utils/format-res.util";
import { paginateArray } from "../utils/paginate";

/**
 * Get all roadmaps
 */
export const getRoadmaps = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const search = (req.query.search as string) || "";
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    const pipeline: any[] = [
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
        $match: {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { "track.title": { $regex: search, $options: "i" } },
          ],
        },
      },
    ];

    const roadmaps = await Roadmap.aggregate(pipeline);
    const paginated = paginateArray(roadmaps, page, limit);
    const sendObject = paginated?.items?.map((roadmap: any) => ({
      _id: roadmap._id,
      title: roadmap.title,
      link: roadmap.link,
      icon: roadmap.icon,
      track: roadmap.track?.title,
    }));

    res.json(
      formatRes("Roadmaps fetched successfully", {
        items: sendObject,
        totalPages: paginated?.totalPages,
        totalItems: paginated?.totalItems,
        currentPage: paginated?.currentPage,
      })
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Get a roadmap by ID
 */
export const getRoadmapById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id).populate("track");
    if (!roadmap) throw new AppError("Roadmap not found", 404);
    res.json(formatRes("Roadmap fetched successfully", { roadmap }));
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new roadmap with Cloudinary icon upload
 */
export const createRoadmap = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, link, track } = req.body;
    if (!title || !link || !track) {
      throw new AppError("Title, link, and track are required", 400);
    }

    let iconUrl = "";

    // Upload icon image if available
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "roadmaps",
        resource_type: "image",
      });
      iconUrl = result.secure_url;
    }

    const roadmap = new Roadmap({ title, link, track, icon: iconUrl });
    await roadmap.save();
    res
      .status(201)
      .json(formatRes("Roadmap created successfully", { roadmap }));
  } catch (err) {
    next(err);
  }
};

/**
 * Update a roadmap by ID
 */
export const updateRoadmap = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, link, track } = req.body;
    let updateData: any = { title, link, track };

    // Upload new icon image if provided
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "roadmaps",
        resource_type: "image",
      });
      updateData.icon = result.secure_url;
    }

    const roadmap = await Roadmap.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!roadmap) throw new AppError("Roadmap not found", 404);
    res.json(formatRes("Roadmap updated successfully", { roadmap }));
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a roadmap by ID
 */
export const deleteRoadmap = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const roadmap = await Roadmap.findByIdAndDelete(req.params.id);
    if (!roadmap) throw new AppError("Roadmap not found", 404);
    res.json(formatRes("Roadmap deleted successfully", {}));
  } catch (err) {
    next(err);
  }
};

/**
 * ------------Dashboard Controller------------
 */

// get all roadmaps for dashboard
export const getAllRoadmaps = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    const roadmaps = await Roadmap.find().populate("track"); // Populate track details
    const paginatedRoadmaps = paginateArray(roadmaps, page, limit);

    res.json(formatRes("Roadmaps fetched successfully", paginatedRoadmaps));
  } catch (err) {
    next(err);
  }
};

// get single roadmap for dashboard
export const getSingleRoadmap = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id).populate("track");
    res.json(formatRes("Roadmap fetched successfully", roadmap));
  } catch (err) {
    next(err);
  }
};
