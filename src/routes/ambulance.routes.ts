import { Router } from "express";
import {
  create,
  getAll,
  getOne,
  update,
  remove,
  createReview,
  recentReviews,
} from "../controllers/ambulance.controller";
import { authenticate, authorize } from "../middlewares/auth";
import { validateRequest } from "../middlewares/validateRequest";
import {
  createAmbulanceSchema,
  updateAmbulanceSchema,
  createReviewSchema,
} from "../schemas/ambulance.schema";

const router = Router();

// Public fleet catalog, details & testimonials
router.get("/public", getAll);
router.get("/public/:id", getOne);
router.get("/reviews/recent", recentReviews);

router.use(authenticate);

// Admin can create and delete ambulances
router.post("/", authorize("ADMIN"), validateRequest(createAmbulanceSchema), create);
router.delete("/:id", authorize("ADMIN"), remove);

// Authenticated users can post verified reviews for an ambulance
router.post("/:id/reviews", validateRequest(createReviewSchema), createReview);

// Admin, Driver, and Patient can view ambulances
router.get("/", getAll);
router.get("/:id", getOne);

// Admin and Driver can update
router.patch("/", authorize("ADMIN", "DRIVER"), validateRequest(updateAmbulanceSchema), update);
router.patch("/:id", authorize("ADMIN", "DRIVER"), validateRequest(updateAmbulanceSchema), update);

export default router;
