import { Router } from "express";
import { register, login, socialLogin } from "../controllers/auth.controller";
import { validateRequest } from "../middlewares/validateRequest";
import { registerSchema, loginSchema, socialLoginSchema } from "../schemas/auth.schema";

const router = Router();

router.post("/register", validateRequest(registerSchema), register);
router.post("/login", validateRequest(loginSchema), login);
router.post("/social-login", validateRequest(socialLoginSchema), socialLogin);

export default router;
