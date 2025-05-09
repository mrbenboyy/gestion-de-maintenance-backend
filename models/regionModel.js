const pool = require("../db");

const getAllRegions = async () => {
  const result = await pool.query("SELECT * FROM region ORDER BY id");
  return result.rows;
};

const getRegionById = async (id) => {
  const result = await pool.query("SELECT * FROM region WHERE id = $1", [id]);
  return result.rows[0];
};

const createRegion = async (nom) => {
  const result = await pool.query(
    "INSERT INTO region (nom) VALUES ($1) RETURNING *",
    [nom]
  );
  return result.rows[0];
};

const updateRegion = async (id, nom) => {
  const result = await pool.query(
    "UPDATE region SET nom = $1 WHERE id = $2 RETURNING *",
    [nom, id]
  );
  return result.rows[0];
};

const deleteRegion = async (id) => {
  await pool.query("DELETE FROM region WHERE id = $1", [id]);
};

module.exports = {
  getAllRegions,
  getRegionById,
  createRegion,
  updateRegion,
  deleteRegion,
};
