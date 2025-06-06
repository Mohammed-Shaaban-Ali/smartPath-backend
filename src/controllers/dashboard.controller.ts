import type { NextFunction, Response } from "express";
import formatRes from "../utils/format-res.util";
import { AuthRequest } from "../middlewares/authentication.middleware";
import { User } from "../models";
import Course from "../models/Course";
import Message from "../models/Message";
import Track from "../models/Track";
import {
  getAllUsersAndUsersWithRoadmaps,
  getAllUserWithUserEnrollMentIncourse,
} from "../services/dashboard.service";

export const getDashboardController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await User.countDocuments();
    const courses = await Course.countDocuments();
    const messages = await Message.countDocuments();
    const tracks = await Track.countDocuments();

    const userEnroolment = await getAllUserWithUserEnrollMentIncourse();
    const usersWithRoadmaps = await getAllUsersAndUsersWithRoadmaps();
    res.status(200).json(
      formatRes("dashboard fetched successfully", {
        counts: { users, courses, messages, tracks },
        UsersVSUsersEnrolled: userEnroolment,
        UsersVSUsersWithRoadmaps: usersWithRoadmaps,
      })
    );
  } catch (err) {
    next(err);
  }
};
