const express = require("express");

const router = express.Router();
const ConfirmController = require("../../controllers/confirmController");
const { validate } = require("~/validations");
const { validateConfirm } = require("~/validations/validateConfirm");
const { default: authMiddleware } = require("~/middlewares/authMiddleware");

router.delete(
  "/confirm/delete/:id",
  authMiddleware,
  validate(validateConfirm.deleteSchema),
  ConfirmController.destroy
);

router.post(
  "/confirm/create",
  validate(validateConfirm.createSchema),
  ConfirmController.store
);

router.get("/confirms", ConfirmController.index);

module.exports = router;
