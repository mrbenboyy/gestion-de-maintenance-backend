const familleModel = require("../models/familleModel");
const { uploadFamille } = require("../utils/upload");
const fs = require("fs").promises;
const path = require("path");

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
    const image = req.file
      ? `/public/uploads/familles/${req.file.filename}`
      : null;
    const newFamille = await familleModel.createFamille(nom, image);
    res.status(201).json(newFamille);
  } catch (err) {
    if (req.file) {
      await fs.unlink(req.file.path);
    }
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
    const image = req.file
      ? `/public/uploads/familles/${req.file.filename}`
      : undefined;

    const existing = await familleModel.getFamilleById(req.params.id);

    const updated = await familleModel.updateFamille(req.params.id, nom, image);

    // Supprimer l'ancienne image si nouvelle image uploadée
    if (req.file && existing.image) {
      await fs.unlink(path.join(__dirname, "..", existing.image));
    }

    res.json(updated);
  } catch (err) {
    if (req.file) {
      await fs.unlink(req.file.path);
    }
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
