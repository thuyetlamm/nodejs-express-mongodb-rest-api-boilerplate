import express from "express";

const router = express.Router();
import customerController from "../../controllers/customerController.js";
import { validate } from "../../validations/index.js";
import { validateCustomer } from "../../validations/validateCustomer.js";
import authMiddleware from "../../middlewares/authMiddleware.js";

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

export default router;
