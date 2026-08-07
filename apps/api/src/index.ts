import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import taskRoutes from "./routes/task.routes.js";
import scheduleRoutes from "./routes/schedule.routes.js";
import userRoutes from "./routes/user.routes.js";
import { errorHandler } from "./utils/errors.js";

const app = express();
const PORT = process.env["PORT"] ?? 4000;

// ─── Global Middleware ────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Health ───────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "pulse-api", timestamp: new Date().toISOString() });
});

// ─── API Routes ───────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/user", userRoutes);

// ─── Error Handler (must be last) ─────────────────────────
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[Pulse API] Running on http://localhost:${PORT}`);
});
