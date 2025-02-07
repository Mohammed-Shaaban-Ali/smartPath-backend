import User, { IUser } from "../models/User";
import { UserDTO } from "../types/dtos/user.dto";
import AppError from "../utils/app-error.util";

// Retrieves a user from the database by their email address.
export const getUserByEmail = async (email: string): Promise<IUser | null> => {
  try {
    const user = await User.findOne({ email });
    return user;
  } catch (error) {
    throw new AppError("Error fetching user", 500);
  }
};

// Creates a new user in the database.
export const createUser = async (userData: UserDTO): Promise<IUser> => {
  try {
    if (!userData.email) {
      throw new AppError("Missing required fields", 400);
    }
    const user = new User(userData);
    const createdUser = await user.save();
    return createdUser;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Error creating user", 500);
  }
};
