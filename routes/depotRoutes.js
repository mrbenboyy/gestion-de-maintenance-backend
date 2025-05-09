const express = require("express");
const router = express.Router();
const depotController = require("../controllers/depotController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/checkRole");

router.get(
  "/",
  authMiddleware,
  checkRole(["admin", "responsable_planning"]),
  depotController.getDepots
);

router.get(
  "/:id",
  authMiddleware,
  checkRole(["admin"]),
  depotController.getDepotById
);

router.post(
  "/",
  authMiddleware,
  checkRole(["admin"]),
  depotController.addDepot
);

router.put(
  "/:id",
  authMiddleware,
  checkRole(["admin"]),
  depotController.updateDepot
);

router.delete(
  "/:id",
  authMiddleware,
  checkRole(["admin"]),
  depotController.deleteDepot
);

module.exports = router;
