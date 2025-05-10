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
exports.deleteSection = exports.updateSection = exports.createSection = exports.getSectionById = exports.getSections = void 0;
const Section_1 = __importDefault(require("../models/Section"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const app_error_util_1 = __importDefault(require("../utils/app-error.util"));
const format_res_util_1 = __importDefault(require("../utils/format-res.util"));
const async_handler_util_1 = __importDefault(require("../utils/async-handler.util"));
/**
 * Get all sections
 */
exports.getSections = (0, async_handler_util_1.default)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sections = yield Section_1.default.find();
    res
        .status(200)
        .json((0, format_res_util_1.default)("Sections fetched successfully", { sections }));
}));
/**
 * Get section by ID
 */
exports.getSectionById = (0, async_handler_util_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const section = yield Section_1.default.findById(req.params.id);
    if (!section)
        throw new app_error_util_1.default("Section not found", 404);
    res
        .status(200)
        .json((0, format_res_util_1.default)("Section fetched successfully", { section }));
}));
/**
 * Create a new section with Cloudinary icon upload
 */
exports.createSection = (0, async_handler_util_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, body } = req.body;
    if (!title || !body)
        throw new app_error_util_1.default("Title and body are required", 400);
    let iconUrl = "";
    if (req.file) {
        const result = yield cloudinary_1.default.uploader.upload(req.file.path, {
            folder: "sections",
            resource_type: "image",
        });
        iconUrl = result.secure_url;
    }
    const section = yield Section_1.default.create({ title, icon: iconUrl, body });
    res
        .status(201)
        .json((0, format_res_util_1.default)("Section created successfully", { section }));
}));
/**
 * Update section by ID
 */
exports.updateSection = (0, async_handler_util_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, body } = req.body;
    let updateData = { title, body };
    if (req.file) {
        const result = yield cloudinary_1.default.uploader.upload(req.file.path, {
            folder: "sections",
            resource_type: "image",
        });
        updateData.icon = result.secure_url;
    }
    const section = yield Section_1.default.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
    });
    if (!section)
        throw new app_error_util_1.default("Section not found", 404);
    res
        .status(200)
        .json((0, format_res_util_1.default)("Section updated successfully", { section }));
}));
/**
 * Delete section by ID
 */
exports.deleteSection = (0, async_handler_util_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const section = yield Section_1.default.findByIdAndDelete(req.params.id);
    if (!section)
        throw new app_error_util_1.default("Section not found", 404);
    res.status(200).json((0, format_res_util_1.default)("Section deleted successfully"));
}));
