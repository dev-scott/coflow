import { Router } from "express";
import {
  registerUser,
  loginUser,
  verifyEmail,
  resetPasswordRequest,
  verifyResetPasswordTokenAndResetPassword,
} from "../controllers/auth.controller.js";
import { registerSchema, loginSchema, verifyEmailSchema, resetPasswordSchema, emailSchema } from "../lib/validate-schema.js";
import { validateBody } from "./middleware/validate.js";

const router = Router();

router.post("/register", validateBody(registerSchema), registerUser);
router.post("/login", validateBody(loginSchema), loginUser);
router.post("/verify-email", validateBody(verifyEmailSchema), verifyEmail);
router.post("/reset-password-request", validateBody(emailSchema), resetPasswordRequest);
router.post("/reset-password", validateBody(resetPasswordSchema), verifyResetPasswordTokenAndResetPassword);

export default router;
