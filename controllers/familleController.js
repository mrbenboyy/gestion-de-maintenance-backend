const familleModel = require("../models/familleModel");

const validateFamilleData = (nom) => {
  if (!nom || nom.trim().length === 0) {
    return "Le nom de la famille est obligatoire";
  }
  return null;
};

const addFamille = async (req, res) => {
  const { nom } = req.body;

  const error = validateFamilleData(nom);
  if (error) return res.status(400).json({ error });

  try {
    const newFamille = await familleModel.createFamille(nom);
    res.status(201).json(newFamille);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getFamille = async (req, res) => {
  try {
    const famille = await familleModel.getFamilleById(req.params.id);
    if (!famille) return res.status(404).json({ error: "Famille introuvable" });
    res.json(famille);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getFamilles = async (req, res) => {
  try {
    const familles = await familleModel.getAllFamilles();
    res.json(familles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const modifyFamille = async (req, res) => {
  const { nom } = req.body;
  const error = validateFamilleData(nom);
  if (error) return res.status(400).json({ error });

  try {
    const updated = await familleModel.updateFamille(req.params.id, nom);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const removeFamille = async (req, res) => {
  try {
    await familleModel.deleteFamille(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  addFamille,
  getFamille,
  getFamilles,
  modifyFamille,
  removeFamille,
};
