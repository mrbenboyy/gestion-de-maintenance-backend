const pool = require("../db");

const getAllClients = async () => {
  const result = await pool.query(`
    SELECT id, nom, telephone, fax, adresse, 
           contrat, sous_type_contrat 
    FROM clients 
    ORDER BY created_at DESC
  `);
  return result.rows;
};

const createClient = async (clientData) => {
  const { nom, telephone, fax, adresse, contrat, sous_type_contrat } =
    clientData;
  const result = await pool.query(
    `INSERT INTO clients 
    (nom, telephone, fax, adresse, contrat, sous_type_contrat) 
    VALUES ($1, $2, $3, $4, $5, $6) 
    RETURNING *`,
    [nom, telephone, fax, adresse, contrat, sous_type_contrat]
  );
  return result.rows[0];
};

const updateClient = async (id, clientData) => {
  const { nom, telephone, fax, adresse, contrat, sous_type_contrat } =
    clientData;
  const result = await pool.query(
    `UPDATE clients SET
      nom = $1,
      telephone = $2,
      fax = $3,
      adresse = $4,
      contrat = $5,
      sous_type_contrat = $6,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $7 
    RETURNING *`,
    [nom, telephone, fax, adresse, contrat, sous_type_contrat, id]
  );
  return result.rows[0];
};

const deleteClient = async (id) => {
  await pool.query("DELETE FROM clients WHERE id = $1", [id]);
};

module.exports = {
  getAllClients,
  createClient,
  updateClient,
  deleteClient,
};
