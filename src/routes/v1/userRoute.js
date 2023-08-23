const express = require("express");

const router = express.Router();
const userController = require("../../controllers/userController");
const { validate } = require("~/validations");
const { validateUser } = require("~/validations/validateUser");

// router.delete(
//   "/customer/delete/:id",
//   validate(validateCustomer.deleteSchema),
//   customerController.destroy
// );

router.post(
  "/user/create",
  validate(validateUser.createSchema),
  userController.store
);

router.put(
  "/user/update/:id",
  validate(validateUser.updateSchema),
  userController.update
);

router.get("/users", userController.index);

module.exports = router;
