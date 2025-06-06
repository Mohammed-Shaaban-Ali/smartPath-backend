import { NextFunction, Request, Response } from "express";
import Track from "../models/Track";
import cloudinary from "../config/cloudinary";
import AppError from "../utils/app-error.util";
import formatRes from "../utils/format-res.util";
import asyncHandler from "../utils/async-handler.util";
import { paginateArray } from "../utils/paginate";

/**
 * Get all tracks
 */
export const getTracks = asyncHandler(async (_req: Request, res: Response) => {
  const tracks = await Track.find().populate("section");
  res.status(200).json(formatRes("Tracks fetched successfully", { tracks }));
});

/**
 * Get all tracks for sselect return id and title
 */
export const getTracksForSelect = asyncHandler(
  async (_req: Request, res: Response) => {
    const tracks = await Track.find().select("title _id");
    res.status(200).json(formatRes("Tracks fetched successfully", { tracks }));
  }
);

/**
 * Get track by ID
 */
export const getTrackById = asyncHandler(
  async (req: Request, res: Response) => {
    const track = await Track.findById(req.params.id).populate("section");
    if (!track) throw new AppError("Track not found", 404);

    res.status(200).json(formatRes("Track fetched successfully", { track }));
  }
);

/**
 * Create a new track with Cloudinary icon uploads
 */
export const createTrack = asyncHandler(async (req: Request, res: Response) => {
  const { title, body, section } = req.body;
  if (!title || !body || !section)
    throw new AppError("Title, body, and section are required", 400);

  let iconUrl = "";
  let icon3DUrl = "";

  if (req.files) {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    if (files.icon) {
      const result = await cloudinary.uploader.upload(files.icon[0].path, {
        folder: "tracks",
        resource_type: "image",
      });
      iconUrl = result.secure_url;
    }
    if (files.icon3D) {
      const result3D = await cloudinary.uploader.upload(files.icon3D[0].path, {
        folder: "tracks",
        resource_type: "image",
      });
      icon3DUrl = result3D.secure_url;
    }
  }

  const track = await Track.create({
    title,
    icon: iconUrl,
    icon3D: icon3DUrl,
    body,
    section,
  });
  res.status(201).json(formatRes("Track created successfully", { track }));
});

/**
 * Update track by ID
 */
export const updateTrack = asyncHandler(async (req: Request, res: Response) => {
  const { title, body, section } = req.body;
  let updateData: any = { title, body, section };

  if (req.files) {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    if (files.icon) {
      const result = await cloudinary.uploader.upload(files.icon[0].path, {
        folder: "tracks",
        resource_type: "image",
      });
      updateData.icon = result.secure_url;
    }
    if (files.icon3D) {
      const result3D = await cloudinary.uploader.upload(files.icon3D[0].path, {
        folder: "tracks",
        resource_type: "image",
      });
      updateData.icon3D = result3D.secure_url;
    }
  }

  const track = await Track.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!track) throw new AppError("Track not found", 404);
  res.status(200).json(formatRes("Track updated successfully", { track }));
});

/**
 * Delete track by ID
 */
export const deleteTrack = asyncHandler(async (req: Request, res: Response) => {
  const track = await Track.findByIdAndDelete(req.params.id);
  if (!track) throw new AppError("Track not found", 404);

  res.status(200).json(formatRes("Track deleted successfully"));
});

/**
 * ------------Dashboard Controller------------
 */

// get all tracks for dashboard
export const getAllTracks = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    const tracks = await Track.find().populate("section");
    const paginatedTracks = paginateArray(tracks, page, limit);

    res
      .status(200)
      .json(formatRes("Tracks fetched successfully", paginatedTracks));
  }
);

// get single track for dashboard
export const getSingleTrack = asyncHandler(
  async (req: Request, res: Response) => {
    const track = await Track.findById(req.params.id).populate("section");
    if (!track) throw new AppError("Track not found", 404);

    res.status(200).json(formatRes("Track fetched successfully", track));
  }
);
