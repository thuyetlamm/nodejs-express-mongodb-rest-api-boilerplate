const express = require("express");

const router = express.Router();
const userController = require("../../controllers/userController");
const { validate } = require("~/validations");
const { validateUser } = require("~/validations/validateUser");
const { default: authMiddleware } = require("~/middlewares/authMiddleware");

// router.delete(
//   "/customer/delete/:id",
//   validate(validateCustomer.deleteSchema),
//   customerController.destroy
// );

router.post(
  "/user/create",
  authMiddleware,
  validate(validateUser.createSchema),
  userController.store
);

router.put(
  "/user/update/:id",
  authMiddleware,
  validate(validateUser.updateSchema),
  userController.update
);

router.get("/users", authMiddleware, userController.index);

module.exports = router;
