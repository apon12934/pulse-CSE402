import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  generateDailySchedule,
  dominoReschedule,
  reorderTasks,
  moveTask,
  chatSchedule,
} from "../controllers/schedule.controller.js";

const router = Router();

// All schedule routes require authentication
router.use(authMiddleware);

router.post("/generate", generateDailySchedule);
router.post("/reschedule", dominoReschedule);
router.post("/reorder", reorderTasks);
router.post("/move", moveTask);
router.post("/chat", chatSchedule);

export default router;
