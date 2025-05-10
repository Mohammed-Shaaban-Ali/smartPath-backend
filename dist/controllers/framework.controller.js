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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFramework = exports.updateFramework = exports.createFramework = exports.getFrameworkById = exports.getFrameworks = void 0;
const Framework_1 = __importDefault(require("../models/Framework"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const app_error_util_1 = __importDefault(require("../utils/app-error.util"));
const format_res_util_1 = __importDefault(require("../utils/format-res.util"));
/**
 * Get all frameworks
 */
const getFrameworks = (_req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const frameworks = yield Framework_1.default.find().populate("track"); // Populate Track details
        res.json((0, format_res_util_1.default)("Frameworks fetched successfully", { frameworks }));
    }
    catch (err) {
        next(err);
    }
});
exports.getFrameworks = getFrameworks;
/**
 * Get a framework by ID
 */
const getFrameworkById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const framework = yield Framework_1.default.findById(req.params.id).populate("track");
        if (!framework)
            throw new app_error_util_1.default("Framework not found", 404);
        res.json((0, format_res_util_1.default)("Framework fetched successfully", { framework }));
    }
    catch (err) {
        next(err);
    }
});
exports.getFrameworkById = getFrameworkById;
/**
 * Create a new framework with Cloudinary icon upload
 */
const createFramework = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, body, track } = req.body;
        if (!title || !body || !track) {
            throw new app_error_util_1.default("Title, body, and track are required", 400);
        }
        let iconUrl = "";
        let icon3DUrl = "";
        // Upload icon image if available
        if (req.files && req.files.icon) {
            const result = yield cloudinary_1.default.uploader.upload(req.files.icon[0].path, {
                folder: "frameworks",
                resource_type: "image",
            });
            iconUrl = result.secure_url;
        }
        // Upload 3D icon if available
        if (req.files && req.files.icon3D) {
            const result = yield cloudinary_1.default.uploader.upload(req.files.icon3D[0].path, {
                folder: "frameworks/3dicons",
                resource_type: "image",
            });
            icon3DUrl = result.secure_url;
        }
        const framework = new Framework_1.default({
            title,
            body,
            track,
            icon: iconUrl,
            icon3D: icon3DUrl,
        });
        yield framework.save();
        res
            .status(201)
            .json((0, format_res_util_1.default)("Framework created successfully", { framework }));
    }
    catch (err) {
        next(err);
    }
});
exports.createFramework = createFramework;
/**
 * Update a framework by ID
 */
const updateFramework = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, body, track } = req.body;
        let updateData = { title, body, track };
        // Upload new icon image if provided
        if (req.files && req.files.icon) {
            const result = yield cloudinary_1.default.uploader.upload(req.files.icon[0].path, {
                folder: "frameworks",
                resource_type: "image",
            });
            updateData.icon = result.secure_url;
        }
        // Upload new 3D icon if provided
        if (req.files && req.files.icon3D) {
            const result = yield cloudinary_1.default.uploader.upload(req.files.icon3D[0].path, {
                folder: "frameworks/3dicons",
                resource_type: "image",
            });
            updateData.icon3D = result.secure_url;
        }
        const framework = yield Framework_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!framework)
            throw new app_error_util_1.default("Framework not found", 404);
        res.json((0, format_res_util_1.default)("Framework updated successfully", { framework }));
    }
    catch (err) {
        next(err);
    }
});
exports.updateFramework = updateFramework;
/**
 * Delete a framework by ID
 */
const deleteFramework = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const framework = yield Framework_1.default.findByIdAndDelete(req.params.id);
        if (!framework)
            throw new app_error_util_1.default("Framework not found", 404);
        res.json((0, format_res_util_1.default)("Framework deleted successfully", {}));
    }
    catch (err) {
        next(err);
    }
});
exports.deleteFramework = deleteFramework;
