import { Router } from "express";
import express from "express";
import { adminCreatePayment, initiate, webhook, getStatus } from "../controllers/payment.controller";
import { authenticate, authorize } from "../middlewares/auth";
import { validateRequest } from "../middlewares/validateRequest";
import { adminCreatePaymentSchema, initiatePaymentSchema, paymentStatusSchema } from "../schemas/payment.schema";

const router = Router();

// Webhook endpoint (doesn't require our auth, uses stripe signature)
router.post("/webhook", express.raw({ type: 'application/json' }), webhook);

router.use(authenticate);

// Admin creates payment bill
router.post("/create", authorize("ADMIN"), validateRequest(adminCreatePaymentSchema), adminCreatePayment);

// Patient initiates payment
router.post("/initiate", authorize("PATIENT"), validateRequest(initiatePaymentSchema), initiate);

// Get payment status
router.post("/status", validateRequest(paymentStatusSchema), getStatus);

export default router;
