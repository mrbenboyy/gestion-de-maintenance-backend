const { sendInterventionEmail } = require("../utils/emailSender");
const userModel = require("../models/userModel");
const interventionModel = require("../models/interventionModel");

const validateInterventionData = (data) => {
  const errors = [];
  if (!data.client_id) errors.push("Client requis");
  if (!data.site_id) errors.push("Site requis");
  if (!data.technicien_id) errors.push("Technicien requis");
  if (!["premiere", "deuxieme", "curative"].includes(data.type_visite)) {
    errors.push("Type de visite invalide");
  }
  return errors;
};

const createIntervention = async (req, res) => {
  console.log("Données reçues:", req.body);
  const errors = validateInterventionData(req.body);
  if (errors.length > 0) {
    console.log("Erreurs de validation:", errors);
    return res.status(400).json({ errors });
  }

  try {
    const newIntervention = await interventionModel.createIntervention({
      ...req.body,
      created_by: req.user.id,
    });
    res.status(201).json(newIntervention);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const updateIntervention = async (req, res) => {
  try {
    const updatedIntervention = await interventionModel.updateIntervention(
      req.params.id,
      req.body
    );
    res.json(updatedIntervention);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const updatedIntervention =
      await interventionModel.updateInterventionStatus(
        req.params.id,
        req.body.status
      );
    res.json(updatedIntervention);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getIntervention = async (req, res) => {
  try {
    const intervention = await interventionModel.getInterventionById(
      req.params.id
    );
    if (!intervention)
      return res.status(404).json({ error: "Intervention non trouvée" });
    res.json(intervention);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteIntervention = async (req, res) => {
  try {
    await interventionModel.deleteIntervention(req.params.id);
    res.status(204).send();
  } catch (err) {
    if (err.code === "23503") {
      res.status(400).json({
        error:
          "Impossible de supprimer une intervention avec des fiches associées",
      });
    } else {
      res.status(500).json({ error: "Erreur serveur" });
    }
  }
};

const notifyTechnicien = async (req, res) => {
  try {
    const intervention = await interventionModel.getInterventionById(
      req.params.id
    );
    const technicien = await userModel.getUserById(intervention.technicien_id);

    await sendInterventionEmail(technicien.email, {
      client_nom: intervention.client_nom,
      site_nom: intervention.site_nom,
      date_planifiee: intervention.date_planifiee,
      type_visite: intervention.type_visite,
      localisation: intervention.localisation,
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createIntervention,
  updateIntervention,
  updateStatus,
  getIntervention,
  getInterventionsByTechnicien: async (req, res) => {
    try {
      const interventions =
        await interventionModel.getInterventionsByTechnicien(
          req.params.technicienId
        );
      res.json(interventions);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  deleteIntervention,
  notifyTechnicien,
};
