import { Request, Response, NextFunction } from "express";
import * as adminService from "../services/admin.service";
import { sendSuccess } from "../utils/response";

export const stats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await adminService.getDashboardStats();
    sendSuccess(res, 200, "Dashboard stats fetched", stats);
  } catch (error) {
    next(error);
  }
};

export const changeRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, role } = req.body;
    const user = await adminService.changeUserRole(userId, role);
    sendSuccess(res, 200, "User role updated", user);
  } catch (error) {
    next(error);
  }
};

export const logs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await adminService.getAuditLogs(page, limit);
    sendSuccess(res, 200, "Audit logs retrieved", result);
  } catch (error) {
    next(error);
  }
};
