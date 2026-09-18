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
  getInviteDetails,
} from "../controllers/workspace.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { validateBody } from "./middleware/validate.js";
import { workspaceSchema, inviteMemberSchema, tokenSchema } from "../lib/validate-schema.js";

const router = Router();

// Route publique pour consulter les informations d'une invitation
router.get("/invite-info", getInviteDetails);

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
