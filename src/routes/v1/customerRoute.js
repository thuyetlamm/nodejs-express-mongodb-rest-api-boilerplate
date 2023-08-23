const express = require("express");

const router = express.Router();
const customerController = require("../../controllers/customerController");
const { validate } = require("~/validations");
const { validateCustomer } = require("~/validations/validateCustomer");

router.delete(
  "/customer/delete/:id",
  validate(validateCustomer.deleteSchema),
  customerController.destroy
);

router.post(
  "/customer/create",
  validate(validateCustomer.createSchema),
  customerController.store
);

router.get("/customers", customerController.index);

module.exports = router;
