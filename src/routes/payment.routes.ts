import { Router } from "express";
import express from "express";
import { initiate, webhook, getStatus } from "../controllers/payment.controller";
import { authenticate } from "../middlewares/auth";
import { validateRequest } from "../middlewares/validateRequest";
import { initiatePaymentSchema } from "../schemas/payment.schema";

const router = Router();

// Webhook must be raw body, so we bypass normal json parsing if possible
// Assuming app.ts uses express.json() globally, we can configure webhook route appropriately later or assume req.body is raw buffer if configured properly.
router.post("/webhook", express.raw({ type: 'application/json' }), webhook);

router.use(authenticate);

router.post("/initiate", validateRequest(initiatePaymentSchema), initiate);
router.get("/:id", getStatus);

export default router;
