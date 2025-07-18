"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
// Progress Schema
const progressSchema = new mongoose_1.default.Schema({
    course: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Course" },
    watchedVideos: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "Video" }],
});
// User Schema
const UserSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    isVerifiedotp: {
        type: Boolean,
        default: false,
    },
    otp: {
        type: String,
    },
    otpExpiration: {
        type: Date,
    },
    avatar: {
        type: String,
        required: false,
        default: "https://cdn3d.iconscout.com/3d/premium/thumb/graduate-student-avatar-3d-icon-download-in-png-blend-fbx-gltf-file-formats--education-study-school-job-and-profession-pack-professionals-icons-7825922.png?f=webp",
    }, // Cloudinary Image URL
    enrolledCourses: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "Course" }],
    progress: [progressSchema],
    // roadmap
    roadmap: {
        type: Object,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
const User = mongoose_1.default.model("User", UserSchema);
exports.default = User;
