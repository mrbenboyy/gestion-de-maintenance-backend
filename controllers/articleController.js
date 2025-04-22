const articleModel = require("../models/articleModel");

const addArticle = async (req, res) => {
  try {
    const newArticle = await articleModel.createArticle(req.body);
    res.status(201).json(newArticle);
  } catch (err) {
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

module.exports = { addArticle, getArticle };
