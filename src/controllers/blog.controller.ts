import { Request, Response, NextFunction } from "express";
import * as blogService from "../services/blog.service";
import { sendSuccess } from "../utils/response";

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 12));
    const search = req.query.search as string | undefined;
    const category = req.query.category as string | undefined;
    const result = await blogService.getBlogs(page, limit, search, category);
    sendSuccess(res, 200, "Blog articles fetched successfully", result);
  } catch (error) {
    next(error);
  }
};

export const getBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const post = await blogService.getBlogBySlug(req.params.slug as string);
    sendSuccess(res, 200, "Article fetched successfully", post);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const post = await blogService.createBlog(req.body);
    sendSuccess(res, 201, "Article created successfully", post);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const post = await blogService.updateBlog(req.params.id as string, req.body);
    sendSuccess(res, 200, "Article updated successfully", post);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await blogService.deleteBlog(req.params.id as string);
    sendSuccess(res, 200, "Article deleted successfully", null);
  } catch (error) {
    next(error);
  }
};
