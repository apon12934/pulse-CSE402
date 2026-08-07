import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { updateProfileSchema } from "../utils/validators.js";
import { updateProfile, uploadAvatar, updatePassword, deleteAccount } from "../controllers/user.controller.js";
import { upload } from "../utils/cloudinary.js";

const router = Router();

// All user routes require authentication
router.use(authMiddleware);

router.patch("/profile", validate(updateProfileSchema), updateProfile);
router.patch("/password", updatePassword);
router.post("/avatar", upload.single("avatar"), uploadAvatar);
router.delete("/account", deleteAccount);

export default router;
