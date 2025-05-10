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
exports.deleteRoadmap = exports.updateRoadmap = exports.createRoadmap = exports.getRoadmapById = exports.getRoadmaps = void 0;
const Roadmap_1 = __importDefault(require("../models/Roadmap"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const app_error_util_1 = __importDefault(require("../utils/app-error.util"));
const format_res_util_1 = __importDefault(require("../utils/format-res.util"));
/**
 * Get all roadmaps
 */
const getRoadmaps = (_req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roadmaps = yield Roadmap_1.default.find().populate("framework"); // Populate Framework details
        res.json((0, format_res_util_1.default)("Roadmaps fetched successfully", { roadmaps }));
    }
    catch (err) {
        next(err);
    }
});
exports.getRoadmaps = getRoadmaps;
/**
 * Get a roadmap by ID
 */
const getRoadmapById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roadmap = yield Roadmap_1.default.findById(req.params.id).populate("framework");
        if (!roadmap)
            throw new app_error_util_1.default("Roadmap not found", 404);
        res.json((0, format_res_util_1.default)("Roadmap fetched successfully", { roadmap }));
    }
    catch (err) {
        next(err);
    }
});
exports.getRoadmapById = getRoadmapById;
/**
 * Create a new roadmap with Cloudinary icon upload
 */
const createRoadmap = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, link, framework } = req.body;
        if (!title || !link || !framework) {
            throw new app_error_util_1.default("Title, link, and framework are required", 400);
        }
        let iconUrl = "";
        // Upload icon image if available
        if (req.file) {
            const result = yield cloudinary_1.default.uploader.upload(req.file.path, {
                folder: "roadmaps",
                resource_type: "image",
            });
            iconUrl = result.secure_url;
        }
        const roadmap = new Roadmap_1.default({ title, link, framework, icon: iconUrl });
        yield roadmap.save();
        res
            .status(201)
            .json((0, format_res_util_1.default)("Roadmap created successfully", { roadmap }));
    }
    catch (err) {
        next(err);
    }
});
exports.createRoadmap = createRoadmap;
/**
 * Update a roadmap by ID
 */
const updateRoadmap = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, link, framework } = req.body;
        let updateData = { title, link, framework };
        // Upload new icon image if provided
        if (req.file) {
            const result = yield cloudinary_1.default.uploader.upload(req.file.path, {
                folder: "roadmaps",
                resource_type: "image",
            });
            updateData.icon = result.secure_url;
        }
        const roadmap = yield Roadmap_1.default.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
        });
        if (!roadmap)
            throw new app_error_util_1.default("Roadmap not found", 404);
        res.json((0, format_res_util_1.default)("Roadmap updated successfully", { roadmap }));
    }
    catch (err) {
        next(err);
    }
});
exports.updateRoadmap = updateRoadmap;
/**
 * Delete a roadmap by ID
 */
const deleteRoadmap = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roadmap = yield Roadmap_1.default.findByIdAndDelete(req.params.id);
        if (!roadmap)
            throw new app_error_util_1.default("Roadmap not found", 404);
        res.json((0, format_res_util_1.default)("Roadmap deleted successfully", {}));
    }
    catch (err) {
        next(err);
    }
});
exports.deleteRoadmap = deleteRoadmap;
