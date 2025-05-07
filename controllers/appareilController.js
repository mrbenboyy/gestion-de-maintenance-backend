const appareilModel = require("../models/appareilModel");
const { uploadAppareil } = require("../utils/upload");
const fs = require("fs").promises;

const validateAppareilData = (data) => {
  const errors = [];
  if (!data.nom?.trim()) errors.push("Nom obligatoire");
  if (!data.famille_id) errors.push("Famille obligatoire");
  return errors;
};

const addAppareil = async (req, res) => {
  const errors = validateAppareilData(req.body);
  if (errors.length > 0) {
    if (req.file) await fs.unlink(req.file.path); // Nettoyer l'image
    return res.status(400).json({ errors });
  }

  try {
    const image = req.file
      ? `/public/uploads/appareils/${req.file.filename}`
      : null;

    const newAppareil = await appareilModel.createAppareil({
      ...req.body,
      image,
    });
    res.status(201).json(newAppareil);
  } catch (err) {
    if (req.file) await fs.unlink(req.file.path);
    res.status(400).json({ error: err.message });
  }
};

const getAppareil = async (req, res) => {
  try {
    const appareil = await appareilModel.getAppareilById(req.params.id);
    if (!appareil)
      return res.status(404).json({ error: "Appareil introuvable" });
    res.json(appareil);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAppareils = async (req, res) => {
  try {
    let appareils;

    if (req.query.familleId) {
      appareils = await appareilModel.getAppareilsByFamille(
        req.query.familleId
      );
    } else {
      appareils = await appareilModel.getAllAppareils();
    }

    res.json(appareils);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const modifyAppareil = async (req, res) => {
  const errors = validateAppareilData(req.body);
  if (errors.length > 0) {
    if (req.file) await fs.unlink(req.file.path);
    return res.status(400).json({ errors });
  }

  try {
    const image = req.file
      ? `/public/uploads/appareils/${req.file.filename}`
      : undefined;

    // Supprimer l'ancienne image
    const existing = await appareilModel.getAppareilById(req.params.id);
    if (req.file && existing.image) {
      await fs.unlink(path.join(__dirname, "..", existing.image));
    }

    const updated = await appareilModel.updateAppareil(req.params.id, {
      ...req.body,
      image,
    });
    res.json(updated);
  } catch (err) {
    if (req.file) await fs.unlink(req.file.path);
    res.status(400).json({ error: err.message });
  }
};

const removeAppareil = async (req, res) => {
  try {
    await appareilModel.deleteAppareil(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  addAppareil,
  getAppareil,
  getAppareils,
  modifyAppareil,
  removeAppareil,
};
