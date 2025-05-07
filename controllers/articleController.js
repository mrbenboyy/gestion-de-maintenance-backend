const articleModel = require("../models/articleModel");
const { uploadArticle } = require("../utils/upload");
const fs = require("fs").promises;
const path = require("path");

const validateArticleData = (data, isCreation = false) => {
  const errors = [];

  if (data.image && !data.image.startsWith("/public/uploads/articles/")) {
    errors.push("Format d'image invalide");
  }

  if (isCreation) {
    if (!data.code?.trim()) errors.push("Code article obligatoire");
    if (!data.famille_id) errors.push("Famille obligatoire");
  }

  if (!data.designation?.trim()) errors.push("Designation obligatoire");
  if (data.stock !== undefined && data.stock < 0) errors.push("Stock invalide");

  return errors;
};

const addArticle = async (req, res) => {
  const errors = validateArticleData(req.body, true);
  if (errors.length > 0) {
    if (req.file) await fs.unlink(req.file.path);
    return res.status(400).json({ errors });
  }

  try {
    const image = req.file
      ? `/public/uploads/articles/${req.file.filename}`
      : null;
    const newArticle = await articleModel.createArticle({ ...req.body, image });
    res.status(201).json(newArticle);
  } catch (err) {
    if (req.file) await fs.unlink(req.file.path);
    res.status(400).json({ error: err.message });
  }
};

const getArticle = async (req, res) => {
  try {
    const article = await articleModel.getArticleByCode(req.params.code);
    if (!article) return res.status(404).json({ error: "Article introuvable" });
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getArticles = async (req, res) => {
  try {
    const articles = await articleModel.getAllArticles(req.query.familleId);
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const modifyArticle = async (req, res) => {
  const errors = validateArticleData(req.body);
  if (errors.length > 0) {
    if (req.file) await fs.unlink(req.file.path);
    return res.status(400).json({ errors });
  }

  try {
    const image = req.file
      ? `/public/uploads/articles/${req.file.filename}`
      : undefined;

    const existing = await articleModel.getArticleByCode(req.params.code);

    const updated = await articleModel.updateArticle(req.params.code, {
      ...req.body,
      image,
    });

    if (req.file && existing.image) {
      await fs.unlink(path.join(__dirname, "..", existing.image));
    }

    res.json(updated);
  } catch (err) {
    if (req.file) await fs.unlink(req.file.path);
    res.status(400).json({ error: err.message });
  }
};

const removeArticle = async (req, res) => {
  try {
    await articleModel.deleteArticle(req.params.code);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  addArticle,
  getArticle,
  getArticles,
  modifyArticle,
  removeArticle,
};
