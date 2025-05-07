const pool = require("../db");
const fs = require("fs").promises;
const path = require("path");

const createArticle = async (articleData) => {
  const { code, famille_id, designation, stock, image } = articleData;

  // Vérifier l'existence de la famille
  const familleExist = await pool.query(
    "SELECT id FROM familles WHERE id = $1",
    [famille_id]
  );
  if (familleExist.rows.length === 0) throw new Error("Famille introuvable");

  // Vérifier unicité du code
  const codeExist = await pool.query(
    "SELECT code FROM articles WHERE code = $1",
    [code]
  );
  if (codeExist.rows.length > 0) throw new Error("Code article déjà utilisé");

  const result = await pool.query(
    `INSERT INTO articles (code, famille_id, designation, stock, image)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [code, famille_id, designation, stock, image]
  );

  return result.rows[0];
};

const getArticleByCode = async (code) => {
  const result = await pool.query(
    `SELECT a.*, f.nom as famille_nom, f.image as famille_image 
     FROM articles a
     LEFT JOIN familles f ON a.famille_id = f.id
     WHERE a.code = $1`,
    [code]
  );
  return result.rows[0];
};

const getAllArticles = async (familleId) => {
  let query = `SELECT a.*, f.nom as famille_nom FROM articles a LEFT JOIN familles f ON a.famille_id = f.id`;
  let params = [];

  if (familleId) {
    query += " WHERE a.famille_id = $1";
    params.push(familleId);
  }

  const result = await pool.query(query, params);
  return result.rows;
};

const updateArticle = async (code, updateData) => {
  const { designation, stock, image } = updateData;

  // Vérifier stock valide
  if (stock !== undefined && stock < 0) {
    throw new Error("Le stock ne peut pas être négatif");
  }

  const result = await pool.query(
    `UPDATE articles
     SET designation = COALESCE($1, designation),
         stock = COALESCE($2, stock),
         image = COALESCE($3, image)
     WHERE code = $4 RETURNING *`,
    [designation, stock, image, code]
  );

  return result.rows[0];
};

const deleteArticle = async (code) => {
  // Récupérer l'image avant toute action
  const article = await pool.query(
    "SELECT image FROM articles WHERE code = $1",
    [code]
  );
  const imagePath = article.rows[0]?.image;

  // Vérifier si l'article est utilisé dans des fiches
  const usedInFiches = await pool.query(
    "SELECT fiche_id FROM articles_utilises WHERE article_code = $1 LIMIT 1",
    [code]
  );

  if (usedInFiches.rows.length > 0) {
    throw new Error(
      "Impossible de supprimer : article utilisé dans des fiches"
    );
  }

  // Supprimer l'image si elle existe
  if (imagePath) {
    try {
      await fs.unlink(path.join(__dirname, "..", imagePath));
    } catch (err) {
      console.error("Erreur suppression image article:", err);
    }
  }

  // Supprimer l'article
  await pool.query("DELETE FROM articles WHERE code = $1", [code]);
};

module.exports = {
  createArticle,
  getArticleByCode,
  getAllArticles,
  updateArticle,
  deleteArticle,
};
