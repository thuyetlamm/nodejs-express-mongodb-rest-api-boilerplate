const express = require("express");

const router = express.Router();
const bolController = require("../../controllers/bolController");
const { default: authMiddleware } = require("~/middlewares/authMiddleware");
const { validateBol } = require("~/validations/validateBol");
const { validate } = require("~/validations");
const multer = require("multer");

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
  authMiddleware,
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

module.exports = router;
