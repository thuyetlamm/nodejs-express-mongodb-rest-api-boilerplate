import express from "express";

const router = express.Router();
import userController from "../../controllers/userController.js";
import { validate } from "../../validations/index.js";
import { validateUser } from "../../validations/validateUser.js";
import authMiddleware from "../../middlewares/authMiddleware.js";

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

export default router;
