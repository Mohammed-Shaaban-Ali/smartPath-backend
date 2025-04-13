import { Request, Response, NextFunction } from "express";
import Blog from "../models/Blog";
import cloudinary from "../config/cloudinary";
import AppError from "../utils/app-error.util";
import formatRes from "../utils/format-res.util";

/**
 * Get all blogs
 */
export const getBlogs = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 }); // Sort by latest blogs
    res.json(formatRes("Blogs fetched successfully", { blogs }));
  } catch (err) {
    next(err);
  }
};

/**
 * Get a blog by ID and increase views count
 */
export const getBlogById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) throw new AppError("Blog not found", 404);

    // Increment views count
    blog.views += 1;
    await blog.save();

    res.json(formatRes("Blog fetched successfully", { blog }));
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new blog with Cloudinary image upload
 */
export const createBlog = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, body } = req.body;
    if (!title || !body) {
      throw new AppError("Title and body are required", 400);
    }

    let imageUrl = "";

    // Upload image if available
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "blogs",
        resource_type: "image",
      });
      imageUrl = result.secure_url;
    }

    const blog = new Blog({ title, body, image: imageUrl });
    await blog.save();
    res.status(201).json(formatRes("Blog created successfully", { blog }));
  } catch (err) {
    next(err);
  }
};

/**
 * Update a blog by ID
 */
export const updateBlog = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, body } = req.body;
    let updateData: any = { title, body };

    // Upload new image if provided
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "blogs",
        resource_type: "image",
      });
      updateData.image = result.secure_url;
    }

    const blog = await Blog.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!blog) throw new AppError("Blog not found", 404);
    res.json(formatRes("Blog updated successfully", { blog }));
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a blog by ID
 */
export const deleteBlog = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) throw new AppError("Blog not found", 404);
    res.json(formatRes("Blog deleted successfully", {}));
  } catch (err) {
    next(err);
  }
};
