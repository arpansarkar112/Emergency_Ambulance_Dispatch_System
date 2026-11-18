import { Request, Response, NextFunction } from "express";
import * as categoryService from "../services/category.service";
import { sendSuccess } from "../utils/response";

export const getAll = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await categoryService.getCategories();
    sendSuccess(res, 200, "Categories fetched successfully", categories);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await categoryService.createCategory(req.body);
    sendSuccess(res, 201, "Category created successfully", category);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await categoryService.updateCategory(req.params.id as string, req.body);
    sendSuccess(res, 200, "Category updated successfully", category);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await categoryService.deleteCategory(req.params.id as string);
    sendSuccess(res, 200, "Category deleted successfully", null);
  } catch (error) {
    next(error);
  }
};
