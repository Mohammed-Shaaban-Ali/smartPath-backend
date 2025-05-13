import express from "express";
import {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
} from "../controllers/blog.controller";
import { uploadImage } from "../middlewares/upload";

const router = express.Router();

// Get all blogs
router.get("/", getBlogs);

// Get a single blog (increments view count)
router.get("/:id", getBlogById);

// Create a new blog (supports image upload)
router.post("/", uploadImage.single("image"), createBlog);

// Update blog (supports optional image update)
router.put("/:id", uploadImage.single("image"), updateBlog);

// Delete blog
router.delete("/:id", deleteBlog);

export default router;
