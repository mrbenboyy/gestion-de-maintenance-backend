const pool = require("../db");

const getAllDepots = async () => {
  const result = await pool.query("SELECT * FROM depot ORDER BY id");
  return result.rows;
};

const getDepotById = async (id) => {
  const result = await pool.query("SELECT * FROM depot WHERE id = $1", [id]);
  return result.rows[0];
};

const createDepot = async (nom) => {
  const result = await pool.query(
    "INSERT INTO depot (nom) VALUES ($1) RETURNING *",
    [nom]
  );
  return result.rows[0];
};

const updateDepot = async (id, nom) => {
  const result = await pool.query(
    "UPDATE depot SET nom = $1 WHERE id = $2 RETURNING *",
    [nom, id]
  );
  return result.rows[0];
};

const deleteDepot = async (id) => {
  await pool.query("DELETE FROM depot WHERE id = $1", [id]);
};

module.exports = {
  getAllDepots,
  getDepotById,
  createDepot,
  updateDepot,
  deleteDepot,
};
