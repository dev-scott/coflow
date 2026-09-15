import { Router } from "express";
import {
  createProject,
  getProjectDetails,
  getProjectTasks,
} from "../controllers/project.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { validateBody } from "./middleware/validate.js";
import { projectSchema } from "../lib/validate-schema.js";

const router = Router();

router.use(authMiddleware);

router.post("/:workspaceId", validateBody(projectSchema), createProject);
router.get("/:projectId", getProjectDetails);
router.get("/:projectId/tasks", getProjectTasks);

export default router;
