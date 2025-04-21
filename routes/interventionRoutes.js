const express = require("express");
const router = express.Router();
const interventionController = require("../controllers/interventionController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/checkRole");

router.post(
  "/",
  authMiddleware,
  checkRole(["admin", "responsable_planning"]),
  interventionController.createIntervention
);

router.put(
  "/:id",
  authMiddleware,
  checkRole(["admin", "responsable_planning"]),
  interventionController.updateIntervention
);

router.patch(
  "/:id/status",
  authMiddleware,
  checkRole(["admin", "responsable_planning", "technicien"]), // Retirez 'assistante'
  interventionController.updateStatus
);

router.get(
  "/:id",
  authMiddleware,
  checkRole(["admin", "responsable_planning", "technicien", "assistante"]),
  interventionController.getIntervention
);

router.get(
  "/technicien/:technicienId",
  authMiddleware,
  checkRole(["admin", "responsable_planning", "technicien", "assistante"]),
  interventionController.getInterventionsByTechnicien
);

router.delete(
  "/:id",
  authMiddleware,
  checkRole(["admin", "responsable_planning"]),
  interventionController.deleteIntervention
);

module.exports = router;
