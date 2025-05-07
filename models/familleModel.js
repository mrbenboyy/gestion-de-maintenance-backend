const pool = require("../db");
const path = require("path");
const fs = require("fs").promises;

const createFamille = async (nom, image) => {
  const existing = await pool.query("SELECT id FROM familles WHERE nom = $1", [
    nom,
  ]);

  if (existing.rows.length > 0) {
    throw new Error("Cette famille existe déjà");
  }

  const result = await pool.query(
    "INSERT INTO familles (nom, image) VALUES ($1, $2) RETURNING *",
    [nom, image]
  );
  return result.rows[0];
};

const getFamilleById = async (id) => {
  const result = await pool.query(
    "SELECT *, image FROM familles WHERE id = $1",
    [id]
  );
  return result.rows[0];
};

const getAllFamilles = async () => {
  const result = await pool.query(`
    SELECT f.*, 
      (SELECT COUNT(*) FROM articles WHERE famille_id = f.id) as articles_count,
      (SELECT COUNT(*) FROM appareils WHERE famille_id = f.id) as appareils_count
    FROM familles f
    ORDER BY created_at DESC
  `);
  return result.rows;
};

const updateFamille = async (id, newNom, image) => {
  const conflict = await pool.query(
    "SELECT id FROM familles WHERE nom = $1 AND id != $2",
    [newNom, id]
  );

  if (conflict.rows.length > 0) {
    throw new Error("Ce nom de famille est déjà utilisé");
  }

  const result = await pool.query(
    "UPDATE familles SET nom = $1, image = $2 WHERE id = $3 RETURNING *",
    [newNom, image, id]
  );
  return result.rows[0];
};

const deleteFamille = async (id) => {
  // Récupérer l'image avant suppression
  const famille = await pool.query("SELECT image FROM familles WHERE id = $1", [
    id,
  ]);

  // Vérifier si utilisée dans articles/appareils
  const articles = await pool.query(
    "SELECT code FROM articles WHERE famille_id = $1 LIMIT 1",
    [id]
  );

  if (articles.rows.length > 0) {
    throw new Error(
      "Impossible de supprimer : famille utilisée dans des articles"
    );
  }

  // Supprimer l'image associée
  if (famille.rows[0]?.image) {
    await fs.unlink(path.join(__dirname, "..", famille.rows[0].image));
  }

  await pool.query("DELETE FROM familles WHERE id = $1", [id]);
};

module.exports = {
  createFamille,
  getFamilleById,
  getAllFamilles,
  updateFamille,
  deleteFamille,
};
