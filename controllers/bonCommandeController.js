const bonCommandeModel = require("../models/bonCommandeModel");
const articleModel = require("../models/articleModel");

const validateBonData = (data) => {
  const errors = [];

  if (
    !data.articles ||
    !Array.isArray(data.articles) ||
    data.articles.length === 0
  ) {
    errors.push("Liste d'articles invalide");
    return errors;
  }

  for (const [index, article] of data.articles.entries()) {
    if (!article.code?.trim())
      errors.push(`Article ${index + 1}: Code manquant`);
    if (!article.quantite || article.quantite <= 0)
      errors.push(`Article ${index + 1}: Quantité invalide`);
  }

  return errors;
};

const createBon = async (req, res) => {
  const errors = validateBonData(req.body);
  if (errors.length > 0) return res.status(400).json({ errors });

  try {
    // Vérifier l'existence des articles
    for (const article of req.body.articles) {
      const exists = await articleModel.getArticleByCode(article.code);
      if (!exists) throw new Error(`Article ${article.code} introuvable`);
    }

    const newBon = await bonCommandeModel.createBonCommande(
      req.user.id,
      req.body.articles
    );
    res.status(201).json(newBon);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getMyBons = async (req, res) => {
  try {
    const bons = await bonCommandeModel.getBonsByTechnicien(req.user.id);
    res.json(bons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllBons = async (req, res) => {
  try {
    const bons = await bonCommandeModel.getAllBons(req.query.statut);
    res.json(bons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateBonStatus = async (req, res) => {
  const { statut, commentaire } = req.body;

  if (!["approuve", "rejete", "livre"].includes(statut)) {
    return res.status(400).json({ error: "Statut invalide" });
  }

  if (statut === "rejete" && !commentaire?.trim()) {
    return res
      .status(400)
      .json({ error: "Commentaire obligatoire pour un rejet" });
  }

  try {
    const updatedBon = await bonCommandeModel.updateBonStatut(
      req.params.id,
      statut,
      commentaire
    );

    res.json(updatedBon);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getBon = async (req, res) => {
  try {
    const bon = await bonCommandeModel.getBonById(req.params.id);

    // Vérification des permissions
    if (
      req.user.role !== "admin" &&
      req.user.role !== "responsable_planning" &&
      bon.technicien_id !== req.user.id
    ) {
      return res.status(403).json({ error: "Accès non autorisé" });
    }

    res.json(bon);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteBon = async (req, res) => {
  try {
    await bonCommandeModel.deleteBonCommande(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  createBon,
  getMyBons,
  getAllBons,
  getBon,
  updateBonStatus,
  deleteBon,
};
