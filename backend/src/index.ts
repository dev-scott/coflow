import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import { connectDB } from "./config/db.js";
import routes from "./routes/index.js";
import { errorMiddleware, notFoundMiddleware } from "./middleware/error.middleware.js";

const app = express();

// ─── CORS ──────────────────────────────────────────────────────────────────────

const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://localhost:5173",
  "https://coflow.dev-scott.me",
  "https://www.coflow.dev-scott.me",
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      // or allowed origins or any vercel.app preview domain
      if (
        !origin ||
        ALLOWED_ORIGINS.includes(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origine non autorisée — ${origin}`));
      }
    },
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Forwarded-For"],
    credentials: true,
  })
);

// ─── Core Middleware ───────────────────────────────────────────────────────────

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Ensure DB Connection (Serverless & Standalone) ───────────────────────────

app.use(async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// ─── Health check ─────────────────────────────────────────────────────────────

app.get("/", (_req, res) => {
  res.status(200).json({
    message: "CoFlow API v2 — TypeScript",
    version: "2.0.0",
    status: "ok",
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────

app.use("/api-v1", routes);

// ─── Error Handlers ───────────────────────────────────────────────────────────

// Express v5: async errors automatically propagate to error middleware — no need for try/catch
app.use(notFoundMiddleware);
app.use(errorMiddleware);

// ─── Bootstrap (Local / Standalone Server) ─────────────────────────────────────

const PORT = Number(process.env.PORT) || 5000;

async function bootstrap(): Promise<void> {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`\n🚀 CoFlow API running on http://localhost:${PORT}`);
    console.log(`   Environment : ${process.env.NODE_ENV ?? "development"}`);
    console.log(`   API base    : /api-v1\n`);
  });
}

// Only listen directly when not running in Vercel Serverless environment
if (!process.env.VERCEL) {
  bootstrap().catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
}

export default app;

