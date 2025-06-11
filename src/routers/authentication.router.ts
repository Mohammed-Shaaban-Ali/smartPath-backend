import { Router } from "express";
import {
  registerController,
  loginController,
  socialMediaController,
  verifyEmailController,
  forgotPasswordController,
  verifyOTPPasswordController,
  resendOtpController,
  loginAdminController,
} from "../controllers/authentication.controller";
import passport from "passport";
import { uploadImage } from "../middlewares/upload";

const router = Router();

// register
router.post("/register", uploadImage.single("avatar"), registerController);

// login
router.post("/login", loginController);
router.post("/login-admin", loginAdminController);

// verify email
router.post("/verify-email", verifyEmailController);

// resend OTP
router.post("/resend-otp", resendOtpController);

// forgot password
router.post("/forgot-password", forgotPasswordController);

// reset password ( with OTP )
router.post("/verify-password-OTP", verifyOTPPasswordController);

// Google Auth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  socialMediaController
);

export default router;
