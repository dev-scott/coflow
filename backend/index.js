import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";

import routes from "./routes/index.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = [
        process.env.FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:3000",
      ].filter(Boolean);
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origine non autorisée — ${origin}`));
      }
    },
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(morgan("dev"));

// db connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("BD Connected successfully."))
  .catch((err) => console.log("Failed to connect to DB:", err));

app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get("/", async (req, res) => {
  res.status(200).json({
    message: "Welcome to TaskHub API",
  });
});
// http:localhost:500/api-v1/
app.use("/api-v1", routes);

// error middleware
app.use((err, req, res, next) => {
  if (err.name === "CastError") {
    return res.status(404).json({ message: "Resource not found or invalid ID" });
  }
  console.log(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

// not found middleware
app.use((req, res) => {
  res.status(404).json({
    message: "Not found",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
