// authentication.controller.ts
import { NextFunction, Request, Response } from "express";
import formatRes from "../utils/format-res.util";
import AppError from "../utils/app-error.util";
import bcrypt from "bcrypt";
import { createUser, getUserByEmail } from "../services/authentication.service";
import { signToken } from "../utils/sign-token.util";
import { IUser } from "../models/User";
import { generateOtp } from "../utils/otp-generator.util";
import { getExpirationTime, isOtpExpired } from "../utils/otp-expiration.util";
import {
  sendVerificationEmail,
  sendForgotPasswordEmail,
} from "../utils/send-email.util";
import cloudinary from "../config/cloudinary";

// Store temporary user data while waiting for verification
const pendingUsers = new Map<
  string,
  {
    name: string;
    email: string;
    avatar: string;
    password: string;
    otp: string;
    otpExpiration: Date;
  }
>();

// Create a new user in the database
export const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password } = req.body;

    // Input validations
    if (!name) throw new AppError("Name is required", 400);
    if (!email) throw new AppError("Email is required", 400);
    if (!password) throw new AppError("Password is required", 400);

    // Check if user already exists in database
    const userExist = await getUserByEmail(email);
    if (!!userExist) throw new AppError("User already exists", 400);

    // Check if user is pending verification
    if (pendingUsers.has(email)) {
      throw new AppError("User is pending email verification", 400);
    }

    // image
    let imageUrl = "";
    // Upload image if available
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "users",
        resource_type: "image",
      });
      imageUrl = result.secure_url;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP and expiration
    const otp = generateOtp();
    const otpExpiration = getExpirationTime();

    // Store user data temporarily
    pendingUsers.set(email, {
      name,
      email,
      password: hashedPassword,
      avatar: imageUrl,
      otp,
      otpExpiration,
    });

    // Schedule deletion after 15 minutes
    setTimeout(
      () => {
        pendingUsers.delete(email);
      },
      15 * 60 * 1000
    );
    // Send verification email
    await sendVerificationEmail(name, email, otp);

    // Send success response
    res.status(200).json(
      formatRes("Please verify your email with the sent OTP", {
        email,
        otp,
        message: "Verification email sent",
      })
    );
  } catch (err) {
    next(err);
  }
};

// Verify email and complete registration
export const verifyEmailController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp } = req.body;

    // Input validations
    if (!email) throw new AppError("Email is required", 400);
    if (!otp) throw new AppError("OTP is required", 400);

    // Get pending user data
    const pendingUser = pendingUsers.get(email);
    if (!pendingUser) {
      throw new AppError("No pending verification found for this email", 404);
    }

    // Validate OTP and expiration
    if (pendingUser.otp !== otp) throw new AppError("Invalid OTP", 400);
    if (isOtpExpired(pendingUser.otpExpiration))
      throw new AppError("OTP has been expired", 400);

    // Create the verified user in database
    const newUser = {
      name: pendingUser.name,
      email: pendingUser.email,
      password: pendingUser.password,
      avatar: pendingUser.avatar,
      isVerified: true,
    };

    // Save user to database
    const createdUser = await createUser(newUser);

    // Generate JWT token
    const token = signToken({
      userId: createdUser.id,
      email: createdUser.email,
    });

    // Remove from pending users
    pendingUsers.delete(email);

    // Send success response
    res.status(200).json(
      formatRes("Email verified and registration completed successfully", {
        token,
        user: {
          id: createdUser.id,
          name: createdUser.name,
          email: createdUser.email,
          avatar: createdUser.avatar,
        },
      })
    );
  } catch (err) {
    next(err);
  }
};

// Resend OTP for email verification
export const resendOtpController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    // Input validation
    if (!email) throw new AppError("Email is required", 400);

    // Generate new OTP and expiration
    const newOtp = generateOtp();
    const newOtpExpiration = getExpirationTime();

    // Check if user has pending verification
    const pendingUser = pendingUsers.get(email);

    // Check if user exists in the database
    const user = await getUserByEmail(email);
    if (pendingUser) {
      // Update pending user data with new OTP
      pendingUsers.set(email, {
        ...pendingUser,
        otp: newOtp,
        otpExpiration: newOtpExpiration,
      });
      console.log("pendingUser", pendingUser);
      // Send new verification email
      await sendVerificationEmail(user?.name!, email, newOtp);
    } else if (user) {
      // Update user in database with new OTP
      user.otp = newOtp;
      user.otpExpiration = newOtpExpiration;
      await user.save();

      // Send forgot password email
      await sendForgotPasswordEmail(email, newOtp);
    } else {
      throw new AppError("No user found for this email", 404);
    }

    // Send success response
    res.status(200).json(
      formatRes("New OTP has been sent to your email", {
        email,
        message: "OTP sent successfully",
      })
    );
  } catch (err) {
    next(err);
  }
};

// Login user
export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // Input validations
    if (!email) throw new AppError("Email is required", 400);
    if (!password) throw new AppError("Password is required", 400);

    // Find the user by email
    const user = await getUserByEmail(email);
    if (!user) throw new AppError("User not found", 400);

    // Check if the user is verified
    if (!user.isVerified) {
      throw new AppError("Please verify your email before logging in", 401);
    }
    if (user.isBlocked) {
      throw new AppError("User is blocked", 401);
    }

    // Compare the password with the hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password!);

    if (!isPasswordValid) {
      throw new AppError("Invalid credentials", 401);
    }

    // Generate JWT token
    const token = signToken({ userId: user.id, email: user.email });

    // Remove sensitive data (password, OTP) from the user object before sending
    const {
      password: storedPassword,
      otp,
      otpExpiration,
      ...loginedUser
    } = user.toObject();

    // Send success response
    res.status(200).json(
      formatRes("Login Done Successfully", {
        user: {
          _id: loginedUser._id,
          email: loginedUser.email,
          name: loginedUser.name,
          avatar: loginedUser.avatar,
        },
        token,
      })
    );
  } catch (err) {
    next(err);
  }
};

export const loginAdminController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // Input validations
    if (!email) throw new AppError("Email is required", 400);
    if (!password) throw new AppError("Password is required", 400);

    // Find the user by email
    const user = await getUserByEmail(email);
    if (!user) throw new AppError("User not found", 400);

    // Check if the user is verified
    if (!user.isVerified) {
      throw new AppError("Please verify your email before logging in", 401);
    }
    if (user.isBlocked) {
      throw new AppError("User is blocked", 401);
    }
    if (!user.isAdmin) {
      throw new AppError("User Not Admin", 401);
    }
    // Compare the password with the hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password!);

    if (!isPasswordValid) {
      throw new AppError("Invalid credentials", 401);
    }

    // Generate JWT token
    const token = signToken({ userId: user.id, email: user.email });

    // Remove sensitive data (password, OTP) from the user object before sending
    const {
      password: storedPassword,
      otp,
      otpExpiration,
      ...loginedUser
    } = user.toObject();

    // Send success response
    res.status(200).json(
      formatRes("Login Done Successfully", {
        user: {
          _id: loginedUser._id,
          email: loginedUser.email,
          name: loginedUser.name,
          avatar: loginedUser.avatar,
        },
        token,
      })
    );
  } catch (err) {
    next(err);
  }
};

export const socialMediaController = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user as IUser;
    // console.log(user, "socialMediaController ");
    const token = signToken({ userId: user._id.toString(), email: user.email });
    res.json(formatRes("User authenticated successfully", { token, user }));
  } catch (err) {
    next(err);
  }
};

// Forgot password
export const forgotPasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    // Find the user by email
    const user = await getUserByEmail(email);
    if (!user) throw new AppError("User not found", 400);

    // Generate OTP and expiration
    const otp = generateOtp();
    const otpExpiration = getExpirationTime();

    // Store OTP and expiration on the user object
    user.otp = otp;
    user.otpExpiration = otpExpiration;
    user.isVerifiedotp = false; // Set to unverified
    await user.save();

    // Send forgot password email
    await sendForgotPasswordEmail(email, otp);

    // Send success response
    res.status(200).json(formatRes("OTP sent to email address", null));
  } catch (err) {
    next(err);
  }
};

export const verifyOTPPasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp } = req.body;

    // Find the user by email
    const user = await getUserByEmail(email);
    if (!user) throw new AppError("User not found", 400);

    // Validate OTP and expiration
    if (user.otp !== otp || isOtpExpired(user.otpExpiration!)) {
      throw new AppError("Invalid OTP or OTP has Expired", 400);
    }
    user.isVerifiedotp = true; // Set to verified
    user.updatedAt = new Date(); // Update updatedAt
    await user.save();
    // Send success response, indicating that OTP is valid
    res.status(200).json(
      formatRes("OTP Verified Successfully", {
        email,
        message: "OTP is valid. Please enter new password",
      })
    );
  } catch (err) {
    next(err);
  }
};
