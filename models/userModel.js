const pool = require("../db");
const bcrypt = require("bcrypt");

const getAllUsers = async () => {
  const result = await pool.query("SELECT * FROM users");
  return result.rows;
};

const getUserById = async (id) => {
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  return result.rows[0];
};

const createUser = async (
  nom,
  email,
  mot_de_passe,
  role,
  region,
  depot,
  image
) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(mot_de_passe, saltRounds);

  const existingUser = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  if (existingUser.rows.length > 0) throw new Error("Email already exists");

  const result = await pool.query(
    `INSERT INTO users 
    (nom, email, mot_de_passe, role, region, depot, image) 
    VALUES ($1, $2, $3, $4, $5, $6, $7) 
    RETURNING *`,
    [nom, email, hashedPassword, role, region, depot, image]
  );
  return result.rows[0];
};

const updateUser = async (
  id,
  nom,
  email,
  role,
  mot_de_passe,
  region,
  depot,
  image
) => {
  let setParts = [];
  const params = [];
  let paramIndex = 1;

  // Gérer chaque champ dynamiquement
  if (nom !== undefined) {
    setParts.push(`nom = $${paramIndex}`);
    params.push(nom);
    paramIndex++;
  }
  if (email !== undefined) {
    setParts.push(`email = $${paramIndex}`);
    params.push(email);
    paramIndex++;
  }
  if (role !== undefined) {
    setParts.push(`role = $${paramIndex}`);
    params.push(role);
    paramIndex++;
  }
  if (region !== undefined) {
    setParts.push(`region = $${paramIndex}`);
    params.push(region);
    paramIndex++;
  }
  if (depot !== undefined) {
    setParts.push(`depot = $${paramIndex}`);
    params.push(depot);
    paramIndex++;
  }
  if (image !== undefined) {
    setParts.push(`image = $${paramIndex}`);
    params.push(image);
    paramIndex++;
  }

  // Gérer le mot de passe séparément (hachage)
  if (mot_de_passe !== undefined) {
    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
    setParts.push(`mot_de_passe = $${paramIndex}`);
    params.push(hashedPassword);
    paramIndex++;
  }

  if (setParts.length === 0) {
    throw new Error("Aucun champ à mettre à jour");
  }

  // Ajouter l'ID à la fin des paramètres
  params.push(id);
  const query = `
    UPDATE users 
    SET ${setParts.join(", ")}
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  const result = await pool.query(query, params);
  return result.rows[0];
};

const getTechniciens = async () => {
  const result = await pool.query(
    "SELECT id, nom, email, region, depot FROM users WHERE role = 'technicien'"
  );
  return result.rows;
};

const deleteUser = async (id) => {
  await pool.query("DELETE FROM users WHERE id = $1", [id]);
};

module.exports = {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  getTechniciens,
};
