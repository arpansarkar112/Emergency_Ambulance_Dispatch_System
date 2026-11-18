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

export const updatePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await userService.changeMyPassword(
      req.user!.userId,
      currentPassword,
      newPassword
    );
    sendSuccess(res, 200, "Password updated successfully", result);
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 100));
    const role = req.query.role as string | undefined;
    const search = req.query.search as string | undefined;
    const includeDisabled = req.query.includeDisabled === "true";

    const result = await userService.getAllUsers(page, limit, role, search, includeDisabled);
    sendSuccess(res, 200, "Users retrieved successfully", result);
  } catch (error) {
    next(error);
  }
};

export const toggleStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { active } = req.body;
    const updated = await userService.toggleUserStatus(
      req.params.id as string,
      Boolean(active),
      req.user!.userId
    );
    sendSuccess(
      res,
      200,
      active ? "User account restored" : "User account disabled",
      updated
    );
  } catch (error) {
    next(error);
  }
};
