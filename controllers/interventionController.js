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
  const errors = validateInterventionData(req.body);
  if (errors.length > 0) return res.status(400).json({ errors });

  try {
    const newIntervention = await interventionModel.createIntervention({
      ...req.body,
      created_by: req.user.id,
    });
    const technicien = await userModel.getUserById(req.body.technicien_id);

    await sendInterventionEmail(technicien.email, {
      client_nom: newIntervention.client_nom,
      site_nom: newIntervention.site_nom,
      date_planifiee: newIntervention.date_planifiee,
      type_visite: newIntervention.type_visite,
      localisation: newIntervention.localisation,
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
};
