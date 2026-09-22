import { Request, Response, NextFunction } from "express";
import * as requestService from "../services/request.service";
import { sendSuccess } from "../utils/response";

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const request = await requestService.createEmergencyRequest(req.user!.userId, req.body);
    sendSuccess(res, 201, "Emergency request created", request);
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    
    const result = await requestService.getRequests(page, limit, status);
    sendSuccess(res, 200, "Requests retrieved", result);
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const request = await requestService.getRequestById(req.params.id as string);
    sendSuccess(res, 200, "Request fetched", request);
  } catch (error) {
    next(error);
  }
};

export const assign = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { requestId, ambulanceId } = req.body;
    const result = await requestService.assignAmbulance(requestId, ambulanceId, req.user!.userId);
    sendSuccess(res, 200, "Ambulance assigned successfully", result);
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { requestId, status } = req.body;
    const result = await requestService.updateStatus(requestId, status, req.user!.userId);
    sendSuccess(res, 200, "Request status updated", result);
  } catch (error) {
    next(error);
  }
};

export const cancel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await requestService.cancelRequest(req.params.id as string);
    sendSuccess(res, 200, "Request cancelled successfully", null);
  } catch (error) {
    next(error);
  }
};
