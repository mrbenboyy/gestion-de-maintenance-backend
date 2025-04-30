const express = require("express");
const router = express.Router();
const ficheController = require("../controllers/ficheController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/checkRole");

// Création (Technicien seulement)
router.post(
  "/",
  authMiddleware,
  checkRole(["technicien"]),
  ficheController.createFiche
);

// Lecture
router.get(
  "/",
  authMiddleware,
  checkRole(["admin", "responsable_planning", "assistante", "technicien"]),
  ficheController.getAllFiches
);

router.get(
  "/technicien",
  authMiddleware,
  checkRole(["admin", "responsable_planning", "assistante", "technicien"]),
  ficheController.getTechnicienFiches
);

router.get(
  "/intervention/:interventionId",
  authMiddleware,
  checkRole(["admin", "responsable_planning", "assistante", "technicien"]),
  ficheController.getFicheByIntervention
);

router.get(
  "/:id",
  authMiddleware,
  checkRole(["admin", "responsable_planning", "assistante", "technicien"]),
  ficheController.getFicheById
);

// Mise à jour (Technicien seulement)
router.put(
  "/:id",
  authMiddleware,
  checkRole(["technicien"]),
  ficheController.updateFiche
);

// Suppression (Admin seulement)
router.delete(
  "/:id",
  authMiddleware,
  checkRole(["admin"]),
  ficheController.deleteFiche
);

module.exports = router;
