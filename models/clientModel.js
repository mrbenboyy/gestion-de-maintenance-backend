const pool = require("../db");
const bcrypt = require("bcrypt");
const fs = require("fs").promises;
const path = require("path");

const getAllClients = async () => {
  const result = await pool.query(`
    SELECT id, nom, email, telephone, fax, adresse, 
           contrat, sous_type_contrat, image
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
    image,
  } = clientData;
  const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

  const result = await pool.query(
    `INSERT INTO clients 
    (nom, telephone, fax, adresse, contrat, sous_type_contrat, email, mot_de_passe, image) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
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
      image,
    ]
  );
  return result.rows[0];
};

const updateClient = async (id, clientData) => {
  let setParts = [];
  const params = [];
  let paramIndex = 1;

  const fields = {
    nom: clientData.nom,
    telephone: clientData.telephone,
    fax: clientData.fax,
    adresse: clientData.adresse,
    contrat: clientData.contrat,
    sous_type_contrat: clientData.sous_type_contrat,
    email: clientData.email,
    image: clientData.image,
  };

  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined) {
      setParts.push(`${key} = $${paramIndex}`);
      params.push(value);
      paramIndex++;
    }
  });

  if (clientData.mot_de_passe) {
    const hashedPassword = await bcrypt.hash(clientData.mot_de_passe, 10);
    setParts.push(`mot_de_passe = $${paramIndex}`);
    params.push(hashedPassword);
    paramIndex++;
  }

  if (setParts.length === 0) throw new Error("Aucun champ à mettre à jour");

  params.push(id);
  const query = `
    UPDATE clients 
    SET ${setParts.join(", ")}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  const result = await pool.query(query, params);
  return result.rows[0];
};

const deleteClientImage = async (imagePath) => {
  if (!imagePath) return;
  try {
    await fs.unlink(path.join(__dirname, "..", imagePath));
  } catch (err) {
    console.error("Erreur suppression image client:", err);
  }
};

const deleteClient = async (id) => {
  const client = await pool.query("SELECT image FROM clients WHERE id = $1", [
    id,
  ]);
  if (client.rows[0]?.image) {
    await deleteClientImage(client.rows[0].image);
  }
  await pool.query("DELETE FROM clients WHERE id = $1", [id]);
};

module.exports = {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
};
