const pool = require("../db");
const bcrypt = require("bcrypt");

const getAllClients = async () => {
  const result = await pool.query(`
    SELECT id, nom, telephone, fax, adresse, 
           contrat, sous_type_contrat 
    FROM clients 
    ORDER BY created_at DESC
  `);
  return result.rows;
};

const getClientById = async (id) => {
  const result = await pool.query("SELECT * FROM clients WHERE id = $1", [id]);
  return result.rows[0];
};

const createClient = async (clientData) => {
  const {
    nom,
    telephone,
    fax,
    adresse,
    contrat,
    sous_type_contrat,
    email,
    mot_de_passe,
  } = clientData;
  const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

  const result = await pool.query(
    `INSERT INTO clients 
    (nom, telephone, fax, adresse, contrat, sous_type_contrat, email, mot_de_passe) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
    RETURNING *`,
    [
      nom,
      telephone,
      fax,
      adresse,
      contrat,
      sous_type_contrat,
      email,
      hashedPassword,
    ]
  );
  return result.rows[0];
};

const updateClient = async (id, clientData) => {
  const {
    nom,
    telephone,
    fax,
    adresse,
    contrat,
    sous_type_contrat,
    email,
    mot_de_passe,
  } = clientData;
  let hashedPassword = mot_de_passe;

  if (mot_de_passe) {
    hashedPassword = await bcrypt.hash(mot_de_passe, 10);
  }

  const result = await pool.query(
    `UPDATE clients SET
      nom = $1,
      telephone = $2,
      fax = $3,
      adresse = $4,
      contrat = $5,
      sous_type_contrat = $6,
      email = $7,
      mot_de_passe = COALESCE($8, mot_de_passe),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $9 
    RETURNING *`,
    [
      nom,
      telephone,
      fax,
      adresse,
      contrat,
      sous_type_contrat,
      email,
      hashedPassword,
      id,
    ]
  );
  return result.rows[0];
};

const deleteClient = async (id) => {
  await pool.query("DELETE FROM clients WHERE id = $1", [id]);
};

module.exports = {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
};
