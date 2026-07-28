import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { updateProfileSchema } from "../utils/validators.js";
import { updateProfile } from "../controllers/user.controller.js";

const router = Router();

// All user routes require authentication
router.use(authMiddleware);

router.patch("/profile", validate(updateProfileSchema), updateProfile);

export default router;
