import { Request, Response, NextFunction } from "express";
import * as paymentService from "../services/payment.service";
import { sendSuccess } from "../utils/response";

export const adminCreatePayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { requestId, amount } = req.body;
    const payment = await paymentService.createPaymentByAdmin(requestId, Number(amount));
    sendSuccess(res, 201, "Payment bill generated successfully", payment);
  } catch (error) {
    next(error);
  }
};

export const initiate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { requestId, originUrl } = req.body;
    const patientEmail = req.user!.email || "patient@example.com";
    const resolvedOrigin = originUrl || req.headers.origin || undefined;
    const result = await paymentService.initiatePayment(req.user!.userId, patientEmail, requestId, resolvedOrigin);
    sendSuccess(res, 200, "Payment initiated", result);
  } catch (error) {
    next(error);
  }
};

export const listPayments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payments = await paymentService.getAllPayments(req.user!.userId, req.user!.role);
    sendSuccess(res, 200, "Payments retrieved", payments);
  } catch (error) {
    next(error);
  }
};

export const webhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const signature = req.headers["stripe-signature"] as string;
    await paymentService.handleWebhook(req.body, signature);
    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
};

export const getStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payment = await paymentService.getPaymentStatus(req.body.paymentId);
    sendSuccess(res, 200, "Payment retrieved", payment);
  } catch (error) {
    next(error);
  }
};

export const verifySession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payment = await paymentService.verifySession(req.body.sessionId);
    sendSuccess(res, 200, "Payment verified manually", payment);
  } catch (error) {
    next(error);
  }
};
