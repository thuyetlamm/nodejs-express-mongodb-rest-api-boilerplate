import express from "express";

const router = express.Router();
import bolController from "../../controllers/bolController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import { validateBol } from "../../validations/validateBol.js";
import { validate } from "../../validations/index.js";
import multer from "multer";

const upload = multer();

// const upload = multer({ storage: storage });
router.post(
  "/bol/create",
  authMiddleware,
  validate(validateBol.createSchema),
  bolController.store
);

// router.post(
//   "/bol/import/test",
//   authMiddleware,
//   upload.single("file"),
//   bolController.uploadTest
// );

router.post(
  "/bol/import",
  authMiddleware,
  upload.single("file"),
  bolController.upload
);

router.get(
  "/bol/detail",
  validate(validateBol.detailByCode),
  bolController.detailByCode
);

router.get(
  "/bol/:id",
  authMiddleware,
  validate(validateBol.detailSchema),
  bolController.detail
);

router.get(
  "/bol/detail/ggsheet",
  validate(validateBol.detailByCode),
  bolController.detailByGGSheet
);

router.put(
  "/bol/update/:id",
  authMiddleware,
  validate(validateBol.updateSchema),
  bolController.update
);

router.patch(
  "/bol/endpoint/update",
  authMiddleware,
  validate(validateBol.updateEndpoint),
  bolController.updateEndpoint
);

router.post(
  "/bol/delete",
  authMiddleware,
  validate(validateBol.deleteSchema),
  bolController.destroy
);

router.get("/bols", authMiddleware, bolController.index);

export default router;
