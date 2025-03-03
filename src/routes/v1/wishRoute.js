const express = require("express");

const router = express.Router();
const wishController = require("../../controllers/wishController");
const { validate } = require("~/validations");
const { validateWish } = require("~/validations/validateWish");
const { default: authMiddleware } = require("~/middlewares/authMiddleware");
const { default: rateLimit } = require("~/middlewares/rateLimit");

router.delete(
  "/wish/delete/:id",
  authMiddleware,
  validate(validateWish.deleteSchema),
  wishController.destroy
);

router.post(
  "/wish/create",
  validate(validateWish.createSchema),
  wishController.store
);

router.post("/wish/like", rateLimit, wishController.like);

router.get("/wishs", wishController.index);

module.exports = router;
