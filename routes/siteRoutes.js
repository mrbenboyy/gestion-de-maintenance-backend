const express = require("express");
const router = express.Router();
const siteController = require("../controllers/siteController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/checkRole");

router.post("/", authMiddleware, checkRole(["admin"]), siteController.addSite);
router.get(
  "/",
  authMiddleware,
  checkRole(["admin", "assistante"]),
  siteController.getAllSites
);

router.get(
  "/:id",
  authMiddleware,
  checkRole(["admin", "assistante"]),
  siteController.getSiteById
);
router.get(
  "/client/:clientId",
  authMiddleware,
  checkRole(["admin", "assistante"]),
  siteController.getClientSites
);
router.put(
  "/:id",
  authMiddleware,
  checkRole(["admin"]),
  siteController.updateSite
);
router.delete(
  "/:id",
  authMiddleware,
  checkRole(["admin"]),
  siteController.deleteSite
);

module.exports = router;
