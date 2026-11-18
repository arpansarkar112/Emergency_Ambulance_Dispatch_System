import { Request, Response, NextFunction } from "express";
import * as contactService from "../services/contact.service";
import { sendSuccess } from "../utils/response";

export const submit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const message = await contactService.createContactMessage(req.body);
    sendSuccess(res, 201, "Your message has been received by our dispatch desk.", message);
  } catch (error) {
    next(error);
  }
};

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const status = req.query.status as string | undefined;
    const result = await contactService.getContactMessages(page, limit, status);
    sendSuccess(res, 200, "Contact messages fetched successfully", result);
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await contactService.updateContactMessageStatus(
      req.params.id as string,
      req.body.status
    );
    sendSuccess(res, 200, "Message status updated", updated);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await contactService.deleteContactMessage(req.params.id as string);
    sendSuccess(res, 200, "Message deleted successfully", null);
  } catch (error) {
    next(error);
  }
};
