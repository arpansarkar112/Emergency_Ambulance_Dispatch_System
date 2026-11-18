import { Router } from "express";
import {
  create,
  getAll,
  getOne,
  update,
  assign,
  updateStatus,
  cancel,
  getMyRequests,
  getMyStats,
} from "../controllers/request.controller";
import { authenticate, authorize } from "../middlewares/auth";
import { validateRequest } from "../middlewares/validateRequest";
import {
  createRequestSchema,
  updateRequestSchema,
  assignRequestSchema,
  updateRequestStatusSchema,
} from "../schemas/request.schema";

const router = Router();

router.use(authenticate);

// Patient
router.post("/", authorize("PATIENT"), validateRequest(createRequestSchema), create);
router.delete("/:id", authorize("PATIENT", "ADMIN"), cancel);

// Patient & Driver personal queries
router.get("/my-requests", authorize("DRIVER", "PATIENT"), getMyRequests);
router.get("/my-stats", authorize("DRIVER", "PATIENT"), getMyStats);

// Admin & Driver
router.get("/", authorize("ADMIN", "DRIVER"), getAll);

// Admin Action
router.patch("/assign", authorize("ADMIN"), validateRequest(assignRequestSchema), assign);

// Driver Action
router.patch("/status", authorize("DRIVER"), validateRequest(updateRequestStatusSchema), updateStatus);

// Patient edit pending request & get one
router.patch("/:id", authorize("PATIENT"), validateRequest(updateRequestSchema), update);
router.get("/:id", getOne);

export default router;
