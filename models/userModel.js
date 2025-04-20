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

module.exports = {
  getAllUsers,
  createUser,
};
