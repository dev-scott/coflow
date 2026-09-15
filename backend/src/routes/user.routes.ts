import { Router } from "express";
import { z } from "zod";
import { getUserProfile, updateUserProfile, changePassword } from "../controllers/user.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { validateBody } from "./middleware/validate.js";

const router = Router();

router.use(authMiddleware);

router.get("/profile", getUserProfile);
router.put(
  "/profile",
  validateBody(z.object({ name: z.string(), profilePicture: z.string().optional() })),
  updateUserProfile
);
router.put(
  "/change-password",
  validateBody(
    z.object({
      currentPassword: z.string(),
      newPassword: z.string(),
      confirmPassword: z.string(),
    })
  ),
  changePassword
);

export default router;
