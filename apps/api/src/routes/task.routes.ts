import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createTaskSchema, updateTaskSchema } from "../utils/validators.js";
import {
  createTask,
  listTasks,
  getTask,
  updateTask,
  deleteTask,
  deleteAllTasksForDate,
} from "../controllers/task.controller.js";

const router = Router();

// All task routes require authentication
router.use(authMiddleware);

router.post("/", validate(createTaskSchema), createTask);
router.get("/", listTasks);
router.get("/:id", getTask);
router.patch("/:id", validate(updateTaskSchema), updateTask);
router.delete("/", deleteAllTasksForDate);
router.delete("/:id", deleteTask);

export default router;
