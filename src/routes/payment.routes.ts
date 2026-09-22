import { Router } from "express";
import { adminCreatePayment, initiate, getStatus, verifySession } from "../controllers/payment.controller";
import { authenticate, authorize } from "../middlewares/auth";
import { validateRequest } from "../middlewares/validateRequest";
import { adminCreatePaymentSchema, initiatePaymentSchema, paymentStatusSchema, verifySessionSchema } from "../schemas/payment.schema";

const router = Router();

router.use(authenticate);

// Admin creates payment bill
router.post("/create", authorize("ADMIN"), validateRequest(adminCreatePaymentSchema), adminCreatePayment);

// Patient initiates payment
router.post("/initiate", authorize("PATIENT"), validateRequest(initiatePaymentSchema), initiate);

// Get payment status
router.post("/status", validateRequest(paymentStatusSchema), getStatus);

// Manually verify session (useful if webhooks aren't working locally)
router.post("/verify-session", validateRequest(verifySessionSchema), verifySession);

export default router;
