import { Router } from "express";
import {
  createWorkspace,
  getWorkspaces,
  getWorkspaceDetails,
  getWorkspaceProjects,
  getWorkspaceStats,
  inviteUserToWorkspace,
  acceptGenerateInvite,
  acceptInviteByToken,
} from "../controllers/workspace.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { validateBody } from "./middleware/validate.js";
import { workspaceSchema, inviteMemberSchema, tokenSchema } from "../lib/validate-schema.js";

const router = Router();

router.use(authMiddleware);

router.get("/", getWorkspaces);
router.post("/", validateBody(workspaceSchema), createWorkspace);
router.get("/:workspaceId", getWorkspaceDetails);
router.get("/:workspaceId/projects", getWorkspaceProjects);
router.get("/:workspaceId/stats", getWorkspaceStats);
router.post("/:workspaceId/invite", validateBody(inviteMemberSchema), inviteUserToWorkspace);
router.post("/:workspaceId/accept-invite", acceptGenerateInvite);
router.post("/accept-invite-by-token", validateBody(tokenSchema), acceptInviteByToken);

export default router;
