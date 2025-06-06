import { NextFunction, Request, Response } from "express";
import Section from "../models/Section";
import cloudinary from "../config/cloudinary";
import AppError from "../utils/app-error.util";
import formatRes from "../utils/format-res.util";
import asyncHandler from "../utils/async-handler.util";
import { paginateArray } from "../utils/paginate";

/**
 * Get all sections
 */
export const getSections = asyncHandler(
  async (_req: Request, res: Response) => {
    const sections = await Section.find();
    res
      .status(200)
      .json(formatRes("Sections fetched successfully", { sections }));
  }
);

/**
 * Get section by ID
 */
export const getSectionById = asyncHandler(
  async (req: Request, res: Response) => {
    const section = await Section.findById(req.params.id);
    if (!section) throw new AppError("Section not found", 404);

    res
      .status(200)
      .json(formatRes("Section fetched successfully", { section }));
  }
);

/**
 * Create a new section with Cloudinary icon upload
 */
export const createSection = asyncHandler(
  async (req: Request, res: Response) => {
    const { title, body } = req.body;
    if (!title || !body) throw new AppError("Title and body are required", 400);

    let iconUrl = "";
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "sections",
        resource_type: "image",
      });
      iconUrl = result.secure_url;
    }

    const section = await Section.create({ title, icon: iconUrl, body });
    res
      .status(201)
      .json(formatRes("Section created successfully", { section }));
  }
);

/**
 * Update section by ID
 */
export const updateSection = asyncHandler(
  async (req: Request, res: Response) => {
    const { title, body } = req.body;
    let updateData: any = { title, body };

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "sections",
        resource_type: "image",
      });
      updateData.icon = result.secure_url;
    }

    const section = await Section.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!section) throw new AppError("Section not found", 404);
    res
      .status(200)
      .json(formatRes("Section updated successfully", { section }));
  }
);

/**
 * Delete section by ID
 */
export const deleteSection = asyncHandler(
  async (req: Request, res: Response) => {
    const section = await Section.findByIdAndDelete(req.params.id);
    if (!section) throw new AppError("Section not found", 404);

    res.status(200).json(formatRes("Section deleted successfully"));
  }
);

/**
 * ------------Dashboard Controller------------
 */
export const getAllSections = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    const sections = await Section.find().sort({ createdAt: -1 }); // Sort by latest blogs
    const paginatedSections = paginateArray(sections, page, limit);

    res.json(formatRes("Sections fetched successfully", paginatedSections));
  } catch (err) {
    next(err);
  }
};

// get single section for dashboard
export const getSingleSection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const section = await Section.findById(req.params.id);
    res.json(formatRes("Section fetched successfully", section));
  } catch (err) {
    next(err);
  }
};

// get sections for select
export const getSectionsForSelect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sections = await Section.find()
      .sort({ createdAt: -1 })
      .select("title _id"); // Sort by latest blogs
    res.json(formatRes("Sections fetched successfully", sections));
  } catch (err) {
    next(err);
  }
};
