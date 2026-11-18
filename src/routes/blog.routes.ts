import { Router } from "express";
import { getAll, getBySlug, create, update, remove } from "../controllers/blog.controller";
import { authenticate, authorize } from "../middlewares/auth";
import { validateRequest } from "../middlewares/validateRequest";
import { createBlogSchema, updateBlogSchema } from "../schemas/blog.schema";

const router = Router();

router.get("/", getAll);
router.get("/:slug", getBySlug);
router.post("/", authenticate, authorize("ADMIN"), validateRequest(createBlogSchema), create);
router.patch("/:id", authenticate, authorize("ADMIN"), validateRequest(updateBlogSchema), update);
router.delete("/:id", authenticate, authorize("ADMIN"), remove);

export default router;
