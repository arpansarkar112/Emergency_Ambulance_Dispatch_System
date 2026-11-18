import { Router } from "express";
import { submit, list, updateStatus, remove } from "../controllers/contact.controller";
import { authenticate, authorize } from "../middlewares/auth";
import { validateRequest } from "../middlewares/validateRequest";
import { createContactSchema, updateContactStatusSchema } from "../schemas/contact.schema";

const router = Router();

router.post("/", validateRequest(createContactSchema), submit);
router.get("/", authenticate, authorize("ADMIN"), list);
router.patch("/:id", authenticate, authorize("ADMIN"), validateRequest(updateContactStatusSchema), updateStatus);
router.delete("/:id", authenticate, authorize("ADMIN"), remove);

export default router;
