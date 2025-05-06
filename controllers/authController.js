const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const pool = require("../db");

const login = async (req, res) => {
  const { email, mot_de_passe } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    const users = result.rows[0];

    const isMatch = await bcrypt.compare(mot_de_passe, users.mot_de_passe);
    if (!isMatch) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    const token = jwt.sign(
      { id: users.id, role: users.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      users: {
        id: users.id,
        nom: users.nom,
        role: users.role,
        image: users.image,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

module.exports = {
  login,
};
