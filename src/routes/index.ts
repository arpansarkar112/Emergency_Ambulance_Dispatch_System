import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import ambulanceRoutes from "./ambulance.routes";
import requestRoutes from "./request.routes";
import paymentRoutes from "./payment.routes";
import adminRoutes from "./admin.routes";
import categoryRoutes from "./category.routes";
import contactRoutes from "./contact.routes";
import blogRoutes from "./blog.routes";
import newsletterRoutes from "./newsletter.routes";
import publicRoutes from "./public.routes";

const router = Router();

router.use("/public", publicRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/ambulances", ambulanceRoutes);
router.use("/requests", requestRoutes);
router.use("/payments", paymentRoutes);
router.use("/admin", adminRoutes);
router.use("/categories", categoryRoutes);
router.use("/contact", contactRoutes);
router.use("/blogs", blogRoutes);
router.use("/newsletter", newsletterRoutes);

export default router;
