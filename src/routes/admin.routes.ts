import { Router } from "express";
import { stats, changeRole, logs } from "../controllers/admin.controller";
import { authenticate, authorize } from "../middlewares/auth";
import { validateRequest } from "../middlewares/validateRequest";
import { changeRoleSchema } from "../schemas/admin.schema";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/dashboard-stats", stats);
router.patch("/users/role", validateRequest(changeRoleSchema), changeRole);
router.get("/audit-logs", logs);

export default router;
