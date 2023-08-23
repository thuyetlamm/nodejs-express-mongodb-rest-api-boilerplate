const express = require("express");

const router = express.Router();
const authController = require("../../controllers/authController");
const { validate } = require("~/validations");
const { validateAuth } = require("~/validations/validateAuth");

router.post("/login", validate(validateAuth.loginSchema), authController.login);
router.post("/auth/refreshToken", authController.refreshToken);
router.get("/auth/profile", authController.getProfile);

module.exports = router;