import { Request, Response, NextFunction } from "express";
import * as userService from "../services/user.service";
import { sendSuccess } from "../utils/response";

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userService.getMyProfile(req.user!.userId);
    sendSuccess(res, 200, "Profile fetched successfully", user);
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await userService.updateMyProfile(req.user!.userId, req.body);
    sendSuccess(res, 200, "Profile updated successfully", profile);
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const role = req.query.role as string;
    
    const result = await userService.getAllUsers(page, limit, role);
    sendSuccess(res, 200, "Users retrieved successfully", result);
  } catch (error) {
    next(error);
  }
};
