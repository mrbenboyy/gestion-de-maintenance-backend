const express = require("express");
const router = express.Router();
const bonCommandeController = require("../controllers/bonCommandeController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/checkRole");

// Création par le technicien
router.post(
  "/",
  authMiddleware,
  checkRole(["technicien"]),
  bonCommandeController.createBon
);

// Liste des propres demandes
router.get(
  "/mes",
  authMiddleware,
  checkRole(["technicien"]),
  bonCommandeController.getMyBons
);

// Liste complète (admin/responsable)
router.get(
  "/",
  authMiddleware,
  checkRole(["admin", "responsable_planning"]),
  bonCommandeController.getAllBons
);

router.get(
  "/:id",
  authMiddleware,
  checkRole(["admin", "responsable_planning", "technicien"]),
  bonCommandeController.getBon
);

// Mise à jour statut
router.patch(
  "/:id",
  authMiddleware,
  checkRole(["admin", "responsable_planning"]),
  bonCommandeController.updateBonStatus
);

// Suppression (admin seulement)
router.delete(
  "/:id",
  authMiddleware,
  checkRole(["admin"]),
  bonCommandeController.deleteBon
);

module.exports = router;
