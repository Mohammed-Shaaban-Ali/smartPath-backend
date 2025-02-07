"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authentication_controller_1 = require("../controllers/authentication.controller");
const passport_1 = __importDefault(require("passport"));
const router = (0, express_1.Router)();
// register
router.post("/register", authentication_controller_1.registerController);
// login
router.post("/login", authentication_controller_1.loginController);
// Facebook Auth
router.get("/facebook", passport_1.default.authenticate("facebook", { scope: ["email"] }));
router.get("/facebook/callback", passport_1.default.authenticate("facebook", { session: false }), authentication_controller_1.socialMediaController);
// Google Auth
router.get("/google", passport_1.default.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport_1.default.authenticate("google", { session: false }), authentication_controller_1.socialMediaController);
// verify email
router.post("/verify-email", authentication_controller_1.verifyEmailController);
// resend OTP
router.post("/resend-otp", authentication_controller_1.resendOtpController);
// forgot password
router.post("/forgot-password", authentication_controller_1.forgotPasswordController);
// reset password
router.post("/reset-password", authentication_controller_1.resetPasswordController);
// delete user by email
router.delete("/del", authentication_controller_1.deleteUserByEmailController);
exports.default = router;
