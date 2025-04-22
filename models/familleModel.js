const pool = require("../db");

const createFamille = async (nom) => {
  // Vérifier si la famille existe déjà
  const existing = await pool.query("SELECT id FROM familles WHERE nom = $1", [
    nom,
  ]);

  if (existing.rows.length > 0) {
    throw new Error("Cette famille existe déjà");
  }

  const result = await pool.query(
    "INSERT INTO familles (nom) VALUES ($1) RETURNING *",
    [nom]
  );
  return result.rows[0];
};

const getFamilleById = async (id) => {
  const result = await pool.query("SELECT * FROM familles WHERE id = $1", [id]);
  return result.rows[0];
};

const getAllFamilles = async () => {
  const result = await pool.query(
    "SELECT * FROM familles ORDER BY created_at DESC"
  );
  return result.rows;
};

const updateFamille = async (id, newNom) => {
  // Vérifier conflit de nom
  const conflict = await pool.query(
    "SELECT id FROM familles WHERE nom = $1 AND id != $2",
    [newNom, id]
  );

  if (conflict.rows.length > 0) {
    throw new Error("Ce nom de famille est déjà utilisé");
  }

  const result = await pool.query(
    "UPDATE familles SET nom = $1 WHERE id = $2 RETURNING *",
    [newNom, id]
  );
  return result.rows[0];
};

const deleteFamille = async (id) => {
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

  await pool.query("DELETE FROM familles WHERE id = $1", [id]);
};

module.exports = {
  createFamille,
  getFamilleById,
  getAllFamilles,
  updateFamille,
  deleteFamille,
};
