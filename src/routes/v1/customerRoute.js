const express = require("express");

const router = express.Router();
const customerController = require("../../controllers/customerController");
const { validate } = require("~/validations");
const { validateCustomer } = require("~/validations/validateCustomer");
const { default: authMiddleware } = require("~/middlewares/authMiddleware");

router.delete(
  "/customer/delete/:id",
  authMiddleware,
  validate(validateCustomer.deleteSchema),
  customerController.destroy
);

router.post(
  "/customer/create",
  authMiddleware,
  validate(validateCustomer.createSchema),
  customerController.store
);

router.put(
  "/customer/update/:id",
  authMiddleware,
  validate(validateCustomer.updateSchema),
  customerController.update
);

router.get("/customers", authMiddleware, customerController.index);

module.exports = router;
