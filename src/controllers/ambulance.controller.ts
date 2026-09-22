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
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    
    const result = await ambulanceService.getAmbulances(page, limit, status);
    sendSuccess(res, 200, "Ambulances retrieved successfully", result);
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ambulance = await ambulanceService.getAmbulanceById(Number(req.params.id));
    sendSuccess(res, 200, "Ambulance fetched successfully", ambulance);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ambulanceId, ...data } = req.body;
    const ambulance = await ambulanceService.updateAmbulance(ambulanceId, data);
    sendSuccess(res, 200, "Ambulance updated successfully", ambulance);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ambulanceService.deleteAmbulance(Number(req.params.id));
    sendSuccess(res, 200, "Ambulance soft deleted successfully", null);
  } catch (error) {
    next(error);
  }
};
