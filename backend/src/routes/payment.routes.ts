import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  startFreeTrial,
  getPlanStatus,
  createCheckout,
  confirmSandboxPayment,
  handleWebhook,
} from "../controllers/payment.controller.js";

const router = Router();

// Routes protégées par authentification
router.post("/start-trial", authMiddleware, startFreeTrial);
router.get("/status", authMiddleware, getPlanStatus);
router.post("/checkout", authMiddleware, createCheckout);
router.post("/confirm-sandbox", authMiddleware, confirmSandboxPayment);
router.post("/sandbox-confirm", authMiddleware, confirmSandboxPayment);

// Webhook public pour Notch Pay
router.post("/webhook", handleWebhook);

export default router;
