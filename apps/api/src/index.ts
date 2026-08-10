import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.routes.js";
import taskRoutes from "./routes/task.routes.js";
import scheduleRoutes from "./routes/schedule.routes.js";
import userRoutes from "./routes/user.routes.js";
import weeklyTemplateRoutes from "./routes/weeklyTemplate.routes.js";
import { errorHandler } from "./utils/errors.js";

const app = express();
const PORT = process.env["PORT"] ?? 4000;

// ─── Global Middleware ────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: ["http://localhost:3000", "http://pulse-ai.ddns.net", "https://pulse-ai.ddns.net"],
  credentials: true
}));
app.use(express.json());

// Global Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per `window` (here, per 15 minutes)
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Specific Rate Limiting for auth & heavy AI routes
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per 15 minutes
  message: "Too many requests, please try again later."
});
app.use("/api/auth/login", strictLimiter);
app.use("/api/schedule/generate", strictLimiter);
app.use("/api/schedule/chat", strictLimiter);
app.use("/api/schedule/reschedule", strictLimiter);

// ─── Health ───────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "pulse-api", timestamp: new Date().toISOString() });
});

// ─── API Routes ───────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/user", userRoutes);
app.use("/api/weekly-template", weeklyTemplateRoutes);

// ─── Error Handler (must be last) ─────────────────────────
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[Pulse API] Running on http://localhost:${PORT}`);
});
