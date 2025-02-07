import jwt from "jsonwebtoken";
import { ITokenData } from "../types/interfaces/token-data.interface";

export const signToken = (data: ITokenData, expiresIn?: string) => {
  return jwt.sign(data, process.env.JWT_SECRET as string, {
    expiresIn: expiresIn || "1y",
  });
};
