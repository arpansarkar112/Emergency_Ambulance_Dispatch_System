import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config";
import { sendError } from "../utils/response";
import { Role } from "@prisma/client";

interface AuthPayload {
  userId: string;
  email: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : req.cookies?.accessToken;

  if (!token) {
    return sendError(res, 401, "Authentication required. Please login.");
  }

  try {
    const decoded = jwt.verify(token, config.jwt_access_secret as string) as AuthPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return sendError(res, 401, "Invalid or expired token.");
  }
};

export const authorize = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 401, "Authentication required.");
    }
    if (!roles.includes(req.user.role)) {
      return sendError(res, 403, "You do not have permission to perform this action.");
    }
    next();
  };
};
