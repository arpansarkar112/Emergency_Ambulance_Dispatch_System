import { Router } from "express";
import { create, getAll, getOne, update, remove } from "../controllers/ambulance.controller";
import { authenticate, authorize } from "../middlewares/auth";
import { validateRequest } from "../middlewares/validateRequest";
import { createAmbulanceSchema, updateAmbulanceSchema } from "../schemas/ambulance.schema";

const router = Router();

router.use(authenticate);

// Admin can create and delete ambulances
router.post("/", authorize("ADMIN"), validateRequest(createAmbulanceSchema), create);
router.delete("/:id", authorize("ADMIN"), remove);

// Admin and Patient can view ambulances (e.g. tracking or list)
router.get("/", getAll);
router.get("/:id", getOne);

// Admin and Driver can update (Driver updates location/status)
router.patch("/:id", authorize("ADMIN", "DRIVER"), validateRequest(updateAmbulanceSchema), update);

export default router;
