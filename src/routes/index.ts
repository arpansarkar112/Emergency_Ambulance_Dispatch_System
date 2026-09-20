import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import ambulanceRoutes from "./ambulance.routes";
// import requestRoutes from "./request.routes";
// import paymentRoutes from "./payment.routes";
// import adminRoutes from "./admin.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/ambulances", ambulanceRoutes);
// router.use("/requests", requestRoutes);
// router.use("/payments", paymentRoutes);
// router.use("/admin", adminRoutes);

export default router;
