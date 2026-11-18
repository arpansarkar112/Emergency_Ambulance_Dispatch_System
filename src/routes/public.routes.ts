import { Router } from "express";
import { publicStats } from "../controllers/admin.controller";
import { recentReviews } from "../controllers/ambulance.controller";

const router = Router();

router.get("/stats", publicStats);
router.get("/reviews", recentReviews);

export default router;
