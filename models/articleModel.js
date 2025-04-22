const pool = require("../db");

const createArticle = async (articleData) => {
  const { code, famille_id, designation, stock } = articleData;

  // Vérifier si la famille existe
  const familleExists = await pool.query(
    "SELECT id FROM familles WHERE id = $1",
    [famille_id]
  );

  if (familleExists.rows.length === 0) {
    throw new Error("Famille introuvable");
  }

  const result = await pool.query(
    `INSERT INTO articles (code, famille_id, designation, stock)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [code, famille_id, designation, stock]
  );

  return result.rows[0];
};

const getArticleByCode = async (code) => {
  const result = await pool.query("SELECT * FROM articles WHERE code = $1", [
    code,
  ]);
  return result.rows[0];
};

module.exports = { createArticle, getArticleByCode };
