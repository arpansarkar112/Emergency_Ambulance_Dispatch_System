import { Request, Response, NextFunction } from "express";
import * as ambulanceService from "../services/ambulance.service";
import { sendSuccess } from "../utils/response";

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ambulance = await ambulanceService.createAmbulance(req.body);
    sendSuccess(res, 201, "Ambulance created successfully", ambulance);
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 12));
    const search = req.query.search as string | undefined;
    const status = req.query.status as string | undefined;
    const type = req.query.type as string | undefined;
    const categoryId = req.query.categoryId as string | undefined;
    const minPrice = req.query.minPrice !== undefined && req.query.minPrice !== "" ? Number(req.query.minPrice) : undefined;
    const maxPrice = req.query.maxPrice !== undefined && req.query.maxPrice !== "" ? Number(req.query.maxPrice) : undefined;
    const minRating = req.query.minRating !== undefined && req.query.minRating !== "" ? Number(req.query.minRating) : undefined;
    const featured = req.query.featured === "true" ? true : undefined;
    const sortBy = req.query.sortBy as string | undefined;
    const sortOrder = (req.query.sortOrder as "asc" | "desc" | undefined) || "desc";

    const result = await ambulanceService.getAmbulances({
      page,
      limit,
      search,
      status,
      type,
      categoryId,
      minPrice,
      maxPrice,
      minRating,
      featured,
      sortBy,
      sortOrder,
    });
    sendSuccess(res, 200, "Ambulances retrieved successfully", result);
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ambulance = await ambulanceService.getAmbulanceById(req.params.id as string);
    sendSuccess(res, 200, "Ambulance fetched successfully", ambulance);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ambulanceId, ...data } = req.body;
    const targetId = (req.params.id as string) || ambulanceId;
    if (!targetId) {
      throw Object.assign(new Error("Ambulance ID is required"), { statusCode: 400 });
    }
    const ambulance = await ambulanceService.updateAmbulance(
      targetId,
      data,
      req.user!.userId,
      req.user!.role
    );
    sendSuccess(res, 200, "Ambulance updated successfully", ambulance);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ambulanceService.deleteAmbulance(req.params.id as string);
    sendSuccess(res, 200, "Ambulance deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

export const createReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const review = await ambulanceService.addAmbulanceReview(
      req.params.id as string,
      req.user!.userId,
      req.body
    );
    sendSuccess(res, 201, "Review submitted successfully", review);
  } catch (error) {
    next(error);
  }
};

export const recentReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit as string) || 6));
    const reviews = await ambulanceService.getRecentReviews(limit);
    sendSuccess(res, 200, "Recent reviews fetched successfully", reviews);
  } catch (error) {
    next(error);
  }
};
