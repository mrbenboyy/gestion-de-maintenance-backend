const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/checkRole");

router.get("/", authMiddleware, checkRole(["admin"]), userController.getUsers);
router.post("/", authMiddleware, checkRole(["admin"]), userController.addUser);

module.exports = router;
