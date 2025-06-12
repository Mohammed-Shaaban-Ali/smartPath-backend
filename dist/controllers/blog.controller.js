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
exports.getAllBlogs = exports.deleteBlog = exports.updateBlog = exports.createBlog = exports.getBlogById = exports.getBlogs = void 0;
const Blog_1 = __importDefault(require("../models/Blog"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const app_error_util_1 = __importDefault(require("../utils/app-error.util"));
const format_res_util_1 = __importDefault(require("../utils/format-res.util"));
const paginate_1 = require("../utils/paginate");
/**
 * Get all blogs
 */
const getBlogs = (_req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blogs = yield Blog_1.default.find().sort({ createdAt: -1 }); // Sort by latest blogs
        res.json((0, format_res_util_1.default)("Blogs fetched successfully", { blogs }));
    }
    catch (err) {
        next(err);
    }
});
exports.getBlogs = getBlogs;
/**
 * Get a blog by ID and increase views count
 */
const getBlogById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blog = yield Blog_1.default.findById(req.params.id);
        if (!blog)
            throw new app_error_util_1.default("Blog not found", 404);
        // Increment views count
        blog.views += 1;
        yield blog.save();
        res.json((0, format_res_util_1.default)("Blog fetched successfully", { blog }));
    }
    catch (err) {
        next(err);
    }
});
exports.getBlogById = getBlogById;
/**
 * Create a new blog with Cloudinary image upload
 */
const createBlog = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, body } = req.body;
        if (!title || !body) {
            throw new app_error_util_1.default("Title and body are required", 400);
        }
        let imageUrl = "";
        // Upload image if available
        if (req.file) {
            const result = yield cloudinary_1.default.uploader.upload(req.file.path, {
                folder: "blogs",
                resource_type: "image",
            });
            imageUrl = result.secure_url;
        }
        const blog = new Blog_1.default({ title, body, image: imageUrl });
        yield blog.save();
        res.status(201).json((0, format_res_util_1.default)("Blog created successfully", { blog }));
    }
    catch (err) {
        next(err);
    }
});
exports.createBlog = createBlog;
/**
 * Update a blog by ID
 */
const updateBlog = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, body } = req.body;
        let updateData = { title, body };
        // Upload new image if provided
        if (req.file) {
            const result = yield cloudinary_1.default.uploader.upload(req.file.path, {
                folder: "blogs",
                resource_type: "image",
            });
            updateData.image = result.secure_url;
        }
        const blog = yield Blog_1.default.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
        });
        if (!blog)
            throw new app_error_util_1.default("Blog not found", 404);
        res.json((0, format_res_util_1.default)("Blog updated successfully", { blog }));
    }
    catch (err) {
        next(err);
    }
});
exports.updateBlog = updateBlog;
/**
 * Delete a blog by ID
 */
const deleteBlog = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blog = yield Blog_1.default.findByIdAndDelete(req.params.id);
        if (!blog)
            throw new app_error_util_1.default("Blog not found", 404);
        res.json((0, format_res_util_1.default)("Blog deleted successfully", {}));
    }
    catch (err) {
        next(err);
    }
});
exports.deleteBlog = deleteBlog;
/**
 * ------------Dashboard Controller------------
 */
const getAllBlogs = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const blogs = yield Blog_1.default.find().sort({ createdAt: -1 }); // Sort by latest blogs
        const paginatedBlogs = (0, paginate_1.paginateArray)(blogs, page, limit);
        res.json((0, format_res_util_1.default)("Blogs fetched successfully", paginatedBlogs));
    }
    catch (err) {
        next(err);
    }
});
exports.getAllBlogs = getAllBlogs;
