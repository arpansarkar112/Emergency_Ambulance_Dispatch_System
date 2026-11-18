import { Router } from "express";
import { getMe, updateMe, updatePassword, getUsers, toggleStatus } from "../controllers/user.controller";
import { authenticate, authorize } from "../middlewares/auth";
import { validateRequest } from "../middlewares/validateRequest";
import { updateProfileSchema, changePasswordSchema } from "../schemas/user.schema";

const router = Router();

router.use(authenticate);

router.get("/me", getMe);
router.patch("/me", validateRequest(updateProfileSchema), updateMe);
router.patch("/me/password", validateRequest(changePasswordSchema), updatePassword);

router.get("/", authorize("ADMIN"), getUsers);
router.patch("/:id/status", authorize("ADMIN"), toggleStatus);

export default router;
