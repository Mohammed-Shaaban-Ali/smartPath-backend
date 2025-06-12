"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authentication_controller_1 = require("../controllers/authentication.controller");
const passport_1 = __importDefault(require("passport"));
const upload_1 = require("../middlewares/upload");
const router = (0, express_1.Router)();
// register
router.post("/register", upload_1.uploadImage.single("avatar"), authentication_controller_1.registerController);
// login
router.post("/login", authentication_controller_1.loginController);
router.post("/login-admin", authentication_controller_1.loginAdminController);
// verify email
router.post("/verify-email", authentication_controller_1.verifyEmailController);
// resend OTP
router.post("/resend-otp", authentication_controller_1.resendOtpController);
// forgot password
router.post("/forgot-password", authentication_controller_1.forgotPasswordController);
// reset password ( with OTP )
router.post("/verify-password-OTP", authentication_controller_1.verifyOTPPasswordController);
// Google Auth
router.get("/google", passport_1.default.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport_1.default.authenticate("google", { session: false }), authentication_controller_1.socialMediaController);
exports.default = router;
