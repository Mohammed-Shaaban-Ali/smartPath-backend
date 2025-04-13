import { Request, Response, NextFunction } from "express";
import Framework from "../models/Framework";
import cloudinary from "../config/cloudinary";
import AppError from "../utils/app-error.util";
import formatRes from "../utils/format-res.util";

/**
 * Get all frameworks
 */
export const getFrameworks = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const frameworks = await Framework.find().populate("track"); // Populate Track details
    res.json(formatRes("Frameworks fetched successfully", { frameworks }));
  } catch (err) {
    next(err);
  }
};

/**
 * Get a framework by ID
 */
export const getFrameworkById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const framework = await Framework.findById(req.params.id).populate("track");
    if (!framework) throw new AppError("Framework not found", 404);
    res.json(formatRes("Framework fetched successfully", { framework }));
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new framework with Cloudinary icon upload
 */
export const createFramework = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, body, track } = req.body;
    if (!title || !body || !track) {
      throw new AppError("Title, body, and track are required", 400);
    }

    let iconUrl = "";
    let icon3DUrl = "";

    // Upload icon image if available
    if (req.files && (req.files as any).icon) {
      const result = await cloudinary.uploader.upload(
        (req.files as any).icon[0].path,
        {
          folder: "frameworks",
          resource_type: "image",
        }
      );
      iconUrl = result.secure_url;
    }

    // Upload 3D icon if available
    if (req.files && (req.files as any).icon3D) {
      const result = await cloudinary.uploader.upload(
        (req.files as any).icon3D[0].path,
        {
          folder: "frameworks/3dicons",
          resource_type: "image",
        }
      );
      icon3DUrl = result.secure_url;
    }

    const framework = new Framework({
      title,
      body,
      track,
      icon: iconUrl,
      icon3D: icon3DUrl,
    });
    await framework.save();
    res
      .status(201)
      .json(formatRes("Framework created successfully", { framework }));
  } catch (err) {
    next(err);
  }
};

/**
 * Update a framework by ID
 */
export const updateFramework = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, body, track } = req.body;
    let updateData: any = { title, body, track };

    // Upload new icon image if provided
    if (req.files && (req.files as any).icon) {
      const result = await cloudinary.uploader.upload(
        (req.files as any).icon[0].path,
        {
          folder: "frameworks",
          resource_type: "image",
        }
      );
      updateData.icon = result.secure_url;
    }

    // Upload new 3D icon if provided
    if (req.files && (req.files as any).icon3D) {
      const result = await cloudinary.uploader.upload(
        (req.files as any).icon3D[0].path,
        {
          folder: "frameworks/3dicons",
          resource_type: "image",
        }
      );
      updateData.icon3D = result.secure_url;
    }

    const framework = await Framework.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!framework) throw new AppError("Framework not found", 404);
    res.json(formatRes("Framework updated successfully", { framework }));
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a framework by ID
 */
export const deleteFramework = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const framework = await Framework.findByIdAndDelete(req.params.id);
    if (!framework) throw new AppError("Framework not found", 404);
    res.json(formatRes("Framework deleted successfully", {}));
  } catch (err) {
    next(err);
  }
};
