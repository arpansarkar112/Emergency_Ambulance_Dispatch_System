import { Router } from "express";
import { subscribe, list } from "../controllers/newsletter.controller";
import { authenticate, authorize } from "../middlewares/auth";
import { validateRequest } from "../middlewares/validateRequest";
import { subscribeNewsletterSchema } from "../schemas/newsletter.schema";

const router = Router();

router.post("/", validateRequest(subscribeNewsletterSchema), subscribe);
router.get("/", authenticate, authorize("ADMIN"), list);

export default router;
