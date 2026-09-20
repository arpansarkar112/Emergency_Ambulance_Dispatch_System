import { Router } from "express";
import { getMe, updateMe, getUsers } from "../controllers/user.controller";
import { authenticate, authorize } from "../middlewares/auth";
import { validateRequest } from "../middlewares/validateRequest";
import { updateProfileSchema } from "../schemas/user.schema";

const router = Router();

router.use(authenticate);

router.get("/me", getMe);
router.patch("/me", validateRequest(updateProfileSchema), updateMe);

router.get("/", authorize("ADMIN"), getUsers);

export default router;
