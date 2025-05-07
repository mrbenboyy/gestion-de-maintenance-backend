const pool = require("../db");
const fs = require("fs").promises;
const path = require("path");

const createAppareil = async (appareilData) => {
  const { nom, famille_id, image } = appareilData;

  // Vérifier l'existence de la famille
  const familleExist = await pool.query(
    "SELECT id FROM familles WHERE id = $1",
    [famille_id]
  );
  if (familleExist.rows.length === 0) throw new Error("Famille introuvable");

  // Vérifier nom unique par famille
  const nomExist = await pool.query(
    "SELECT id FROM appareils WHERE nom = $1 AND famille_id = $2",
    [nom, famille_id]
  );
  if (nomExist.rows.length > 0)
    throw new Error("Nom déjà utilisé dans cette famille");

  const result = await pool.query(
    `INSERT INTO appareils (nom, famille_id, image)
     VALUES ($1, $2, $3) RETURNING *`,
    [nom, famille_id, image]
  );

  return result.rows[0];
};

const getAppareilById = async (id) => {
  const result = await pool.query(
    `SELECT a.*, f.nom as famille_nom, a.image 
     FROM appareils a
     LEFT JOIN familles f ON a.famille_id = f.id
     WHERE a.id = $1`,
    [id]
  );
  return result.rows[0];
};

const getAllAppareils = async () => {
  const result = await pool.query(
    `SELECT a.*, f.nom as famille_nom, a.image 
     FROM appareils a
     LEFT JOIN familles f ON a.famille_id = f.id
     ORDER BY a.nom`
  );
  return result.rows;
};

const getAppareilsByFamille = async (familleId) => {
  const result = await pool.query(
    `SELECT a.*, f.nom as famille_nom 
     FROM appareils a
     LEFT JOIN familles f ON a.famille_id = f.id
     WHERE a.famille_id = $1
     ORDER BY a.nom`,
    [familleId]
  );
  return result.rows;
};

const updateAppareil = async (id, updateData) => {
  const { nom, famille_id, image } = updateData;

  // Vérifier nouvelle famille si changement
  if (famille_id) {
    const familleExist = await pool.query(
      "SELECT id FROM familles WHERE id = $1",
      [famille_id]
    );
    if (familleExist.rows.length === 0)
      throw new Error("Nouvelle famille introuvable");
  }

  const result = await pool.query(
    `UPDATE appareils
     SET nom = COALESCE($1, nom),
         famille_id = COALESCE($2, famille_id),
         image = COALESCE($3, image)
     WHERE id = $4 RETURNING *`,
    [nom, famille_id, image, id]
  );

  return result.rows[0];
};

const deleteAppareil = async (id) => {
  // Récupérer l'image
  const appareil = await pool.query(
    "SELECT image FROM appareils WHERE id = $1",
    [id]
  );

  // Supprimer l'image
  if (appareil.rows[0]?.image) {
    await fs.unlink(path.join(__dirname, "..", appareil.rows[0].image));
  }

  // Vérifications d'usage
  await pool.query("DELETE FROM appareils WHERE id = $1", [id]);
};

module.exports = {
  createAppareil,
  getAppareilById,
  getAllAppareils,
  getAppareilsByFamille,
  updateAppareil,
  deleteAppareil,
};
