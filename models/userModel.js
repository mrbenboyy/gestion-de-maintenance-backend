const pool = require("../db");
const bcrypt = require("bcrypt");

const getAllUsers = async () => {
  const result = await pool.query("SELECT * FROM users");
  return result.rows;
};

const createUser = async (nom, email, mot_de_passe, role) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(mot_de_passe, saltRounds);
  const existingUser = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  if (existingUser.rows.length > 0) {
    throw new Error("Email already exists");
  }
  const result = await pool.query(
    "INSERT INTO users (nom, email, mot_de_passe, role) VALUES ($1, $2, $3, $4) RETURNING *",
    [nom, email, hashedPassword, role]
  );
  return result.rows[0];
};

const getUserById = async (id) => {
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  return result.rows[0];
};

const updateUser = async (id, nom, email, role, mot_de_passe) => {
  let query = "UPDATE users SET nom = $1, email = $2, role = $3";
  let params = [nom, email, role];

  if (mot_de_passe) {
    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
    query += ", mot_de_passe = $4 WHERE id = $5 RETURNING *";
    params.push(hashedPassword, id);
  } else {
    query += " WHERE id = $4 RETURNING *";
    params.push(id);
  }

  const result = await pool.query(query, params);
  return result.rows[0];
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
};
