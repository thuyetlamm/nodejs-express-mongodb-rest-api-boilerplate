const express = require("express");

const router = express.Router();
const bolController = require("../../controllers/bolController");
const { default: authMiddleware } = require("~/middlewares/authMiddleware");
const { validateBol } = require("~/validations/validateBol");
const { validate } = require("~/validations");

router.post(
  "/bol/create",
  authMiddleware,
  validate(validateBol.createSchema),
  bolController.store
);

// router.put("/bol/update/:id", authMiddleware, bolController.update);

router.get("/bols", authMiddleware, bolController.index);

module.exports = router;
