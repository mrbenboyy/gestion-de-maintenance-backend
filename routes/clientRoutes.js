const express = require("express");
const router = express.Router();
const clientController = require("../controllers/clientController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/checkRole");
const { uploadClient } = require("../utils/upload");

router.get(
  "/",
  authMiddleware,
  checkRole(["admin"]),
  clientController.getClients
);
router.get(
  "/:id",
  authMiddleware,
  checkRole(["admin"]),
  clientController.getClientById
);
router.post(
  "/",
  authMiddleware,
  checkRole(["admin"]),
  uploadClient.single("image"),
  clientController.addClient
);
router.put(
  "/:id",
  authMiddleware,
  checkRole(["admin"]),
  uploadClient.single("image"),
  clientController.updateClient
);
router.delete(
  "/:id",
  authMiddleware,
  checkRole(["admin"]),
  clientController.deleteClient
);

module.exports = router;
