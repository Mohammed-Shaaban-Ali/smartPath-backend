import { Response, NextFunction } from "express";
import Group from "../models/Group";
import { AuthRequest } from "../middlewares/authentication.middleware";
import asyncHandler from "../utils/async-handler.util";
import formatRes from "../utils/format-res.util";
import cloudinary from "../config/cloudinary";
import { paginateArray } from "../utils/paginate";
import Message from "../models/Message";

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
// ✅ Update Group
export const updateGroup = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { groupId } = req.params;
    const { name } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      res.status(404).json(formatRes("Group not found."));
      return;
    }

    // Check if the new name already exists (and isn't the same as current group's name)
    if (name && name !== group.name) {
      const existingGroup = await Group.findOne({ name });
      if (existingGroup) {
        res.status(400).json(formatRes("Group name already exists."));
        return;
      }
      group.name = name;
    }

    // Upload new image if provided
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "groups",
        resource_type: "image",
      });
      group.image = result.secure_url;
    }

    await group.save();

    res.status(200).json(formatRes("Group updated successfully.", { group }));
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

    await group.deleteOne();

    res.status(200).json(formatRes("Group deleted successfully."));
  }
);

// dashboard
export const getAllGroupsForDashboard = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const groups = await Group.find()
      .populate("createdBy", "name avatar")
      .sort({ createdAt: -1 });
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const paginated = paginateArray(groups, page, limit);

    const dashboardGroups = await Promise.all(
      paginated?.items?.map(async (group) => {
        // number of messages
        const messagesCount = await Message.countDocuments({
          group: group._id,
        });

        // number of users
        const uniqueUsers = await Message.distinct("sender", {
          group: group._id,
        });
        const usersCount = uniqueUsers.length;

        return {
          _id: group._id,
          name: group.name,
          image: group.image,
          createdBy: group.createdBy,
          createdAt: group.createdAt,
          messagesCount,
          usersCount,
        };
      })
    );

    res.status(200).json(
      formatRes("Groups fetched successfully.", {
        items: dashboardGroups,
        currentPage: paginated.currentPage,
        perPage: paginated.perPage,
        totalItems: paginated.totalItems,
        totalPages: paginated.totalPages,
      })
    );
  }
);
