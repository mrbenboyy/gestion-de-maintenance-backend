const express = require("express");
const router = express.Router();
const regionController = require("../controllers/regionController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/checkRole");

router.get(
  "/",
  authMiddleware,
  checkRole(["admin", "responsable_planning"]),
  regionController.getRegions
);

router.get(
  "/:id",
  authMiddleware,
  checkRole(["admin"]),
  regionController.getRegionById
);

router.post(
  "/",
  authMiddleware,
  checkRole(["admin"]),
  regionController.addRegion
);

router.put(
  "/:id",
  authMiddleware,
  checkRole(["admin"]),
  regionController.updateRegion
);

router.delete(
  "/:id",
  authMiddleware,
  checkRole(["admin"]),
  regionController.deleteRegion
);

module.exports = router;
