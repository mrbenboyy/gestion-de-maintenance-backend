const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/checkRole");

router.get("/", authMiddleware, checkRole(["admin"]), userController.getUsers);
router.post("/", authMiddleware, checkRole(["admin"]), userController.addUser);
router.get(
  "/:id",
  authMiddleware,
  checkRole(["admin"]),
  userController.getUserById
);
router.put(
  "/:id",
  authMiddleware,
  checkRole(["admin"]),
  userController.updateUser
);
router.delete(
  "/:id",
  authMiddleware,
  checkRole(["admin"]),
  userController.deleteUser
);

module.exports = router;
