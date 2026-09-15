import { Router } from "express";
import authRoutes from "./auth.routes.js";
import workspaceRoutes from "./workspace.routes.js";
import projectRoutes from "./project.routes.js";
import taskRoutes from "./task.routes.js";
import userRoutes from "./user.routes.js";
import paymentRoutes from "./payment.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/workspaces", workspaceRoutes);
router.use("/projects", projectRoutes);
router.use("/tasks", taskRoutes);
router.use("/users", userRoutes);
router.use("/payments", paymentRoutes);

export default router;
