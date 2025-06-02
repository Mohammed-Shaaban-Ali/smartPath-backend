"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const blog_controller_1 = require("../controllers/blog.controller");
const upload_1 = require("../middlewares/upload");
const router = express_1.default.Router();
// Get all blogs
router.get("/", blog_controller_1.getBlogs);
// Get a single blog (increments view count)
router.get("/:id", blog_controller_1.getBlogById);
// Create a new blog (supports image upload)
router.post("/", upload_1.uploadImage.single("image"), blog_controller_1.createBlog);
// Update blog (supports optional image update)
router.put("/:id", upload_1.uploadImage.single("image"), blog_controller_1.updateBlog);
// Delete blog
router.delete("/:id", blog_controller_1.deleteBlog);
exports.default = router;
