import { Router } from "express";
import { create, getAll, getOne, assign, updateStatus, cancel } from "../controllers/request.controller";
import { authenticate, authorize } from "../middlewares/auth";
import { validateRequest } from "../middlewares/validateRequest";
import { createRequestSchema, assignRequestSchema, updateRequestStatusSchema } from "../schemas/request.schema";

const router = Router();

router.use(authenticate);

// Patient
router.post("/", authorize("PATIENT"), validateRequest(createRequestSchema), create);
router.delete("/:id", authorize("PATIENT", "ADMIN"), cancel);

// Admin & Driver
router.get("/", authorize("ADMIN", "DRIVER"), getAll);
router.get("/:id", getOne);

// Admin Action
router.patch("/:id/assign", authorize("ADMIN"), validateRequest(assignRequestSchema), assign);

// Driver Action
router.patch("/status", authorize("DRIVER"), validateRequest(updateRequestStatusSchema), updateStatus);

export default router;
