const pool = require("../db");

const createAppareil = async (appareilData) => {
  const { nom, famille_id } = appareilData;

  const result = await pool.query(
    `INSERT INTO appareils (nom, famille_id)
     VALUES ($1, $2) RETURNING *`,
    [nom, famille_id]
  );

  return result.rows[0];
};

module.exports = { createAppareil };
