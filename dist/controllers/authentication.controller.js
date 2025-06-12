"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOTPPasswordController = exports.forgotPasswordController = exports.socialMediaController = exports.loginAdminController = exports.loginController = exports.resendOtpController = exports.verifyEmailController = exports.registerController = void 0;
const format_res_util_1 = __importDefault(require("../utils/format-res.util"));
const app_error_util_1 = __importDefault(require("../utils/app-error.util"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const authentication_service_1 = require("../services/authentication.service");
const sign_token_util_1 = require("../utils/sign-token.util");
const otp_generator_util_1 = require("../utils/otp-generator.util");
const otp_expiration_util_1 = require("../utils/otp-expiration.util");
const send_email_util_1 = require("../utils/send-email.util");
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
// Store temporary user data while waiting for verification
const pendingUsers = new Map();
// Create a new user in the database
const registerController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        // Input validations
        if (!name)
            throw new app_error_util_1.default("Name is required", 400);
        if (!email)
            throw new app_error_util_1.default("Email is required", 400);
        if (!password)
            throw new app_error_util_1.default("Password is required", 400);
        // Check if user already exists in database
        const userExist = yield (0, authentication_service_1.getUserByEmail)(email);
        if (!!userExist)
            throw new app_error_util_1.default("User already exists", 400);
        // Check if user is pending verification
        if (pendingUsers.has(email)) {
            throw new app_error_util_1.default("User is pending email verification", 400);
        }
        // image
        let imageUrl = "";
        // Upload image if available
        if (req.file) {
            const result = yield cloudinary_1.default.uploader.upload(req.file.path, {
                folder: "users",
                resource_type: "image",
            });
            imageUrl = result.secure_url;
        }
        // Hash the password
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Generate OTP and expiration
        const otp = (0, otp_generator_util_1.generateOtp)();
        const otpExpiration = (0, otp_expiration_util_1.getExpirationTime)();
        // Store user data temporarily
        pendingUsers.set(email, {
            name,
            email,
            password: hashedPassword,
            avatar: imageUrl,
            otp,
            otpExpiration,
        });
        // Send verification email
        yield (0, send_email_util_1.sendVerificationEmail)(name, email, otp);
        // Send success response
        res.status(200).json((0, format_res_util_1.default)("Please verify your email with the sent OTP", {
            email,
            otp,
            message: "Verification email sent",
        }));
    }
    catch (err) {
        next(err);
    }
});
exports.registerController = registerController;
// Verify email and complete registration
const verifyEmailController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, otp } = req.body;
        // Input validations
        if (!email)
            throw new app_error_util_1.default("Email is required", 400);
        if (!otp)
            throw new app_error_util_1.default("OTP is required", 400);
        // Get pending user data
        const pendingUser = pendingUsers.get(email);
        if (!pendingUser) {
            throw new app_error_util_1.default("No pending verification found for this email", 404);
        }
        // Validate OTP and expiration
        if (pendingUser.otp !== otp)
            throw new app_error_util_1.default("Invalid OTP", 400);
        if ((0, otp_expiration_util_1.isOtpExpired)(pendingUser.otpExpiration))
            throw new app_error_util_1.default("OTP has been expired", 400);
        // Create the verified user in database
        const newUser = {
            name: pendingUser.name,
            email: pendingUser.email,
            password: pendingUser.password,
            avatar: pendingUser.avatar,
            isVerified: true,
        };
        // Save user to database
        const createdUser = yield (0, authentication_service_1.createUser)(newUser);
        // Generate JWT token
        const token = (0, sign_token_util_1.signToken)({
            userId: createdUser.id,
            email: createdUser.email,
        });
        // Remove from pending users
        pendingUsers.delete(email);
        // Send success response
        res.status(200).json((0, format_res_util_1.default)("Email verified and registration completed successfully", {
            token,
            user: {
                id: createdUser.id,
                name: createdUser.name,
                email: createdUser.email,
                avatar: createdUser.avatar,
            },
        }));
    }
    catch (err) {
        next(err);
    }
});
exports.verifyEmailController = verifyEmailController;
// Resend OTP for email verification
const resendOtpController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        // Input validation
        if (!email)
            throw new app_error_util_1.default("Email is required", 400);
        // Generate new OTP and expiration
        const newOtp = (0, otp_generator_util_1.generateOtp)();
        const newOtpExpiration = (0, otp_expiration_util_1.getExpirationTime)();
        // Check if user has pending verification
        const pendingUser = pendingUsers.get(email);
        // Check if user exists in the database
        const user = yield (0, authentication_service_1.getUserByEmail)(email);
        if (pendingUser) {
            // Update pending user data with new OTP
            pendingUsers.set(email, Object.assign(Object.assign({}, pendingUser), { otp: newOtp, otpExpiration: newOtpExpiration }));
            console.log("pendingUser", pendingUser);
            // Send new verification email
            yield (0, send_email_util_1.sendVerificationEmail)(user === null || user === void 0 ? void 0 : user.name, email, newOtp);
            console.log("sendVerificationEmail");
        }
        else if (user) {
            // Update user in database with new OTP
            user.otp = newOtp;
            user.otpExpiration = newOtpExpiration;
            yield user.save();
            // Send forgot password email
            yield (0, send_email_util_1.sendForgotPasswordEmail)(email, newOtp);
        }
        else {
            throw new app_error_util_1.default("No user found for this email", 404);
        }
        // Send success response
        res.status(200).json((0, format_res_util_1.default)("New OTP has been sent to your email", {
            email,
            message: "OTP sent successfully",
        }));
    }
    catch (err) {
        next(err);
    }
});
exports.resendOtpController = resendOtpController;
// Login user
const loginController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Input validations
        if (!email)
            throw new app_error_util_1.default("Email is required", 400);
        if (!password)
            throw new app_error_util_1.default("Password is required", 400);
        // Find the user by email
        const user = yield (0, authentication_service_1.getUserByEmail)(email);
        if (!user)
            throw new app_error_util_1.default("User not found", 400);
        // Check if the user is verified
        if (!user.isVerified) {
            throw new app_error_util_1.default("Please verify your email before logging in", 401);
        }
        if (user.isBlocked) {
            throw new app_error_util_1.default("User is blocked", 401);
        }
        // Compare the password with the hashed password
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            throw new app_error_util_1.default("Invalid credentials", 401);
        }
        // Generate JWT token
        const token = (0, sign_token_util_1.signToken)({ userId: user.id, email: user.email });
        // Remove sensitive data (password, OTP) from the user object before sending
        const _a = user.toObject(), { password: storedPassword, otp, otpExpiration } = _a, loginedUser = __rest(_a, ["password", "otp", "otpExpiration"]);
        // Send success response
        res.status(200).json((0, format_res_util_1.default)("Login Done Successfully", {
            user: {
                _id: loginedUser._id,
                email: loginedUser.email,
                name: loginedUser.name,
                avatar: loginedUser.avatar,
            },
            token,
        }));
    }
    catch (err) {
        next(err);
    }
});
exports.loginController = loginController;
const loginAdminController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Input validations
        if (!email)
            throw new app_error_util_1.default("Email is required", 400);
        if (!password)
            throw new app_error_util_1.default("Password is required", 400);
        // Find the user by email
        const user = yield (0, authentication_service_1.getUserByEmail)(email);
        if (!user)
            throw new app_error_util_1.default("User not found", 400);
        // Check if the user is verified
        if (!user.isVerified) {
            throw new app_error_util_1.default("Please verify your email before logging in", 401);
        }
        if (user.isBlocked) {
            throw new app_error_util_1.default("User is blocked", 401);
        }
        if (!user.isAdmin) {
            throw new app_error_util_1.default("User Not Admin", 401);
        }
        // Compare the password with the hashed password
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            throw new app_error_util_1.default("Invalid credentials", 401);
        }
        // Generate JWT token
        const token = (0, sign_token_util_1.signToken)({ userId: user.id, email: user.email });
        // Remove sensitive data (password, OTP) from the user object before sending
        const _a = user.toObject(), { password: storedPassword, otp, otpExpiration } = _a, loginedUser = __rest(_a, ["password", "otp", "otpExpiration"]);
        // Send success response
        res.status(200).json((0, format_res_util_1.default)("Login Done Successfully", {
            user: {
                _id: loginedUser._id,
                email: loginedUser.email,
                name: loginedUser.name,
                avatar: loginedUser.avatar,
            },
            token,
        }));
    }
    catch (err) {
        next(err);
    }
});
exports.loginAdminController = loginAdminController;
const socialMediaController = (req, res, next) => {
    try {
        const user = req.user;
        // console.log(user, "socialMediaController ");
        const token = (0, sign_token_util_1.signToken)({ userId: user._id.toString(), email: user.email });
        res.json((0, format_res_util_1.default)("User authenticated successfully", { token, user }));
    }
    catch (err) {
        next(err);
    }
};
exports.socialMediaController = socialMediaController;
// Forgot password
const forgotPasswordController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        // Find the user by email
        const user = yield (0, authentication_service_1.getUserByEmail)(email);
        if (!user)
            throw new app_error_util_1.default("User not found", 400);
        // Generate OTP and expiration
        const otp = (0, otp_generator_util_1.generateOtp)();
        const otpExpiration = (0, otp_expiration_util_1.getExpirationTime)();
        // Store OTP and expiration on the user object
        user.otp = otp;
        user.otpExpiration = otpExpiration;
        user.isVerifiedotp = false; // Set to unverified
        yield user.save();
        // Send forgot password email
        yield (0, send_email_util_1.sendForgotPasswordEmail)(email, otp);
        // Send success response
        res.status(200).json((0, format_res_util_1.default)("OTP sent to email address", null));
    }
    catch (err) {
        next(err);
    }
});
exports.forgotPasswordController = forgotPasswordController;
const verifyOTPPasswordController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, otp } = req.body;
        // Find the user by email
        const user = yield (0, authentication_service_1.getUserByEmail)(email);
        if (!user)
            throw new app_error_util_1.default("User not found", 400);
        // Validate OTP and expiration
        if (user.otp !== otp || (0, otp_expiration_util_1.isOtpExpired)(user.otpExpiration)) {
            throw new app_error_util_1.default("Invalid OTP or OTP has Expired", 400);
        }
        user.isVerifiedotp = true; // Set to verified
        user.updatedAt = new Date(); // Update updatedAt
        yield user.save();
        // Send success response, indicating that OTP is valid
        res.status(200).json((0, format_res_util_1.default)("OTP Verified Successfully", {
            email,
            message: "OTP is valid. Please enter new password",
        }));
    }
    catch (err) {
        next(err);
    }
});
exports.verifyOTPPasswordController = verifyOTPPasswordController;
