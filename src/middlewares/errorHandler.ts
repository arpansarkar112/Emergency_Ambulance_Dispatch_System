import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { sendError } from "../utils/response";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong";
  let errors: any[] = [];

  if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation Error";
    errors = (err.issues || []).map((e: any) => ({
      path: Array.isArray(e.path) ? e.path.join(".") : String(e.path),
      message: e.message,
    }));
  }

  return sendError(res, statusCode, message, errors);
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  return sendError(res, 404, "API endpoint not found");
};
