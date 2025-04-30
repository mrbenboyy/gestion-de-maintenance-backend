const ficheModel = require("../models/ficheModel");
const interventionModel = require("../models/interventionModel");

// Validation des données d'entrée
const validateFicheData = (data) => {
  const errors = [];
  if (!data.intervention_id) errors.push("Intervention ID obligatoire");
  if (!data.observations?.trim()) errors.push("Observations obligatoires");
  if (!data.signature_base64?.trim()) errors.push("Signature obligatoire");
  if (!data.articles || !Array.isArray(data.articles))
    errors.push("Articles invalides");
  if (!data.appareils || !Array.isArray(data.appareils))
    errors.push("Appareils invalides");
  return errors;
};

// Création d'une fiche
const createFiche = async (req, res) => {
  const errors = validateFicheData(req.body);
  if (errors.length > 0) return res.status(400).json({ errors });

  try {
    // Vérifier que l'intervention appartient au technicien
    const intervention = await interventionModel.getInterventionById(
      req.body.intervention_id
    );
    if (intervention.technicien_id !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Non autorisé pour cette intervention" });
    }

    const newFiche = await ficheModel.createFicheVerification({
      ...req.body,
      // Ajout de la vérification de sécurité
      technicien_id: req.user.id,
    });

    res.status(201).json(newFiche);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Récupération de toutes les fiches
const getAllFiches = async (req, res) => {
  try {
    const fiches = await ficheModel.getAllFiches();
    res.json(fiches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Récupération d'une fiche spécifique
const getFicheById = async (req, res) => {
  try {
    const fiche = await ficheModel.getFullFicheById(req.params.id);
    if (!fiche) return res.status(404).json({ error: "Fiche introuvable" });

    // Vérification des permissions (admin/assistante ou technicien propriétaire)
    if (
      !["admin", "assistante"].includes(req.user.role) &&
      fiche.technicien_id !== req.user.id
    ) {
      return res.status(403).json({ error: "Accès non autorisé" });
    }

    res.json(fiche);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mise à jour d'une fiche
const updateFiche = async (req, res) => {
  const errors = validateFicheData(req.body);
  if (errors.length > 0) return res.status(400).json({ errors });

  try {
    // Vérification de la propriété
    const existingFiche = await ficheModel.getFullFicheById(req.params.id);
    if (existingFiche.technicien_id !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Seul le technicien peut modifier cette fiche" });
    }

    const updatedFiche = await ficheModel.updateFicheVerification(
      req.params.id,
      req.body
    );
    res.json(updatedFiche);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Suppression d'une fiche
const deleteFiche = async (req, res) => {
  try {
    const fiche = await ficheModel.getFullFicheById(req.params.id);

    // Seul l'admin peut supprimer
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Action réservée à l'administrateur" });
    }

    await ficheModel.deleteFicheVerification(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Récupération des fiches par technicien
const getTechnicienFiches = async (req, res) => {
  try {
    // Un technicien ne peut voir que ses propres fiches
    const technicienId =
      req.user.role === "admin" ? req.query.technicienId : req.user.id;
    const fiches = await ficheModel.getFichesByTechnicien(technicienId);
    res.json(fiches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getFicheByIntervention = async (req, res) => {
  try {
    const interventionId = req.params.interventionId;

    // Vérifier que l'intervention existe et appartient au technicien
    const intervention = await interventionModel.getInterventionById(
      interventionId
    );

    // Contrôle d'accès
    if (!["admin", "assistante"].includes(req.user.role)) {
      if (intervention.technicien_id !== req.user.id) {
        return res.status(403).json({ error: "Accès non autorisé" });
      }
    }

    const fiche = await ficheModel.getFicheByIntervention(interventionId);

    if (!fiche) {
      return res
        .status(404)
        .json({ error: "Aucune fiche trouvée pour cette intervention" });
    }

    res.json(fiche);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createFiche,
  getAllFiches,
  getFicheById,
  updateFiche,
  deleteFiche,
  getTechnicienFiches,
  getFicheByIntervention,
};
