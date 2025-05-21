import { Response, NextFunction } from "express";
import Group from "../models/Group";
import { AuthRequest } from "../middlewares/authentication.middleware";
import asyncHandler from "../utils/async-handler.util";
import formatRes from "../utils/format-res.util";

// ✅ Create Group
export const createGroup = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { name } = req.body;

    if (!name) {
      res.status(400).json(formatRes("Group name is required."));
      return;
    }

    // Check if group name already exists
    const existingGroup = await Group.findOne({ name });
    if (existingGroup) {
      res.status(400).json(formatRes("Group name already exists."));
      return;
    }

    const newGroup = await Group.create({
      name,
      createdBy: req.userId,
    });

    res
      .status(201)
      .json(formatRes("Group created successfully.", { group: newGroup }));
  }
);

// ✅ Get All Groups
export const getAllGroups = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // i want only return _id , name and createdBy
    const groups = await Group.find({}, { _id: 1, name: 1, createdBy: 1 })
      .populate("createdBy", "name avatar")
      .sort({ createdAt: -1 });

    res.status(200).json(formatRes("Groups fetched successfully.", { groups }));
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
