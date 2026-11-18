import { Request, Response, NextFunction } from "express";
import * as newsletterService from "../services/newsletter.service";
import { sendSuccess } from "../utils/response";

export const subscribe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await newsletterService.subscribeNewsletter(req.body.email);
    sendSuccess(
      res,
      result.alreadySubscribed ? 200 : 201,
      result.alreadySubscribed
        ? "This email is already subscribed to CallAmbulance safety updates."
        : "Subscribed successfully to CallAmbulance safety updates!",
      result
    );
  } catch (error) {
    next(error);
  }
};

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const result = await newsletterService.getNewsletterSubscribers(page, limit);
    sendSuccess(res, 200, "Subscribers fetched successfully", result);
  } catch (error) {
    next(error);
  }
};
