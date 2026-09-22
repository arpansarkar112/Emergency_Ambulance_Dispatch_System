import { Request, Response, NextFunction } from "express";
import * as paymentService from "../services/payment.service";
import { sendSuccess } from "../utils/response";

export const initiate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { requestId, amount } = req.body;
    const result = await paymentService.initiatePayment(req.user!.userId, requestId, amount);
    sendSuccess(res, 200, "Payment initiated", result);
  } catch (error) {
    next(error);
  }
};

export const webhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const signature = req.headers["stripe-signature"] as string;
    // Note: Stripe requires raw body. In production, ensure express.raw() is used for this route.
    await paymentService.handleWebhook(req.body, signature);
    res.json({ received: true });
  } catch (error) {
    next(error);
  }
};

export const getStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payment = await paymentService.getPaymentStatus(req.params.id as string);
    sendSuccess(res, 200, "Payment retrieved", payment);
  } catch (error) {
    next(error);
  }
};
