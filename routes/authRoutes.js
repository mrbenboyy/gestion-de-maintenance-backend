const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const clientAuthController = require("../controllers/clientAuthController");

router.post("/login", authController.login);
router.post("/client-login", clientAuthController.clientLogin);

module.exports = router;
