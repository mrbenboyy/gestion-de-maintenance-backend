const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/checkRole");
const { uploadUser } = require("../utils/upload");

router.get("/", authMiddleware, checkRole(["admin"]), userController.getUsers);
router.post(
  "/",
  authMiddleware,
  checkRole(["admin"]),
  uploadUser.single("image"),
  userController.addUser
);
router.get(
  "/techniciens",
  authMiddleware,
  checkRole(["admin", "responsable_planning"]),
  userController.getTechniciens
);
router.get(
  "/:id",
  authMiddleware,
  (req, res, next) => {
    if (req.user.role === "admin" || req.params.id === req.user.id.toString()) {
      next();
    } else {
      res.status(403).json({ message: "Accès interdit" });
    }
  },
  userController.getUserById
);
router.put(
  "/:id",
  authMiddleware,
  (req, res, next) => {
    if (req.user.role === "admin" || req.params.id === req.user.id.toString()) {
      req.isAdmin = req.user.role === "admin";
      next();
    }
  },
  uploadUser.single("image"),
  userController.updateUser
);
router.delete(
  "/:id",
  authMiddleware,
  checkRole(["admin"]),
  userController.deleteUser
);

module.exports = router;
