import express from "express";

const router = express.Router();
import authController from "../../controllers/authController.js";
import { validate } from "../../validations/index.js";
import { validateAuth } from "../../validations/validateAuth.js";

router.post("/auth/refreshToken", authController.refreshToken);
router.get("/auth/profile", authController.getProfile);
router.post("/login", validate(validateAuth.loginSchema), authController.login);

export default router;
