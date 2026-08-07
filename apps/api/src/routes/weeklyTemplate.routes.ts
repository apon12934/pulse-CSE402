import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  getWeeklyTemplate,
  generateWeeklyTemplate,
  updateTemplateTask,
  deleteTemplateTask,
} from "../controllers/weeklyTemplate.controller.js";

const router = Router();
router.use(authMiddleware);

router.get("/", getWeeklyTemplate);
router.post("/generate", generateWeeklyTemplate);
router.patch("/tasks/:id", updateTemplateTask);
router.delete("/tasks/:id", deleteTemplateTask);

export default router;
