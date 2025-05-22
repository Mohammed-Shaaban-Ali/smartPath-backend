import { Response, NextFunction } from "express";
import Group from "../models/Group";
import { AuthRequest } from "../middlewares/authentication.middleware";
import asyncHandler from "../utils/async-handler.util";
import formatRes from "../utils/format-res.util";
import cloudinary from "../config/cloudinary";

// ✅ Create Group
export const createGroup = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { name } = req.body;
    const createdBy = req.userId;

    if (!name) {
      res.status(400).json(formatRes("Group name is required."));
      return;
    }

    const existingGroup = await Group.findOne({ name });
    if (existingGroup) {
      res.status(400).json(formatRes("Group name already exists."));
      return;
    }

    let imageUrl: string | null = null;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "groups",
        resource_type: "image",
      });
      imageUrl = result.secure_url;
    }

    const newGroup = await Group.create({
      name,
      image: imageUrl,
      createdBy,
    });

    res
      .status(201)
      .json(formatRes("Group created successfully.", { group: newGroup }));
  }
);

// ✅ Get All Groups
export const getAllGroups = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const groups = await Group.find()
      .populate("createdBy", "name avatar")
      .sort({ createdAt: -1 });

    const formattedGroups = groups.map((group) => ({
      _id: group._id,
      name: group.name,
      image: group.image,
      createdBy: group.createdBy,
      createdAt: group.createdAt,
    }));

    res
      .status(200)
      .json(
        formatRes("Groups fetched successfully.", { groups: formattedGroups })
      );
  }
);

// ✅ Get Group by Id
export const getGroupById = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);

    if (!group) {
      res.status(404).json(formatRes("Group not found."));
      return;
    }

    res.status(200).json(formatRes("Group fetched successfully.", { group }));
  }
);

// ✅ Delete Group
export const deleteGroup = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);

    if (!group) {
      res.status(404).json(formatRes("Group not found."));
      return;
    }

    // Optional: ممكن تخليه اللي أنشأه بس يقدر يمسحه
    if (group.createdBy.toString() !== req.userId) {
      res.status(403).json(formatRes("Not authorized to delete this group."));
      return;
    }

    await group.deleteOne();

    res.status(200).json(formatRes("Group deleted successfully."));
  }
);
