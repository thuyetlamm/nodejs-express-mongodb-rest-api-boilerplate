const express = require("express");

const router = express.Router();
const bolController = require("../../controllers/bolController");
const { validate } = require("~/validations");
const { default: authMiddleware } = require("~/middlewares/authMiddleware");

// router.post("/bol/create", authMiddleware, bolController.store);

// router.put("/bol/update/:id", authMiddleware, bolController.update);

router.get("/bols", authMiddleware, bolController.index);

module.exports = router;
