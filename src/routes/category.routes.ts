import { Router } from "express";
import { getAll, create, update, remove } from "../controllers/category.controller";
import { authenticate, authorize } from "../middlewares/auth";
import { validateRequest } from "../middlewares/validateRequest";
import { createCategorySchema, updateCategorySchema } from "../schemas/category.schema";

const router = Router();

router.get("/", getAll);
router.post("/", authenticate, authorize("ADMIN"), validateRequest(createCategorySchema), create);
router.patch("/:id", authenticate, authorize("ADMIN"), validateRequest(updateCategorySchema), update);
router.delete("/:id", authenticate, authorize("ADMIN"), remove);

export default router;
