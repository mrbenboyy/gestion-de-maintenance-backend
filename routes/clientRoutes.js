const express = require("express");
const router = express.Router();
const clientController = require("../controllers/clientController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/checkRole");

router.get(
  "/",
  authMiddleware,
  checkRole(["admin"]),
  clientController.getClients
);
router.post(
  "/",
  authMiddleware,
  checkRole(["admin"]),
  clientController.addClient
);
router.put(
  "/:id",
  authMiddleware,
  checkRole(["admin"]),
  clientController.updateClient
);
router.delete(
  "/:id",
  authMiddleware,
  checkRole(["admin"]),
  clientController.deleteClient
);

module.exports = router;
