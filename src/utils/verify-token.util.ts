import jwt from "jsonwebtoken";
import { ITokenData } from "../types/interfaces/token-data.interface";
import AppError from "./app-error.util";

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET as string) as ITokenData;
  } catch (error) {
    throw new AppError("Token is not valid", 401);
  }
};
