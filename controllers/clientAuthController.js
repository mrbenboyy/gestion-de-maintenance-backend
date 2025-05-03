const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const pool = require("../db");

const clientLogin = async (req, res) => {
  const { email, mot_de_passe } = req.body;

  try {
    const result = await pool.query("SELECT * FROM clients WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Identifiants incorrects" });
    }

    const client = result.rows[0];
    const isMatch = await bcrypt.compare(mot_de_passe, client.mot_de_passe);

    if (!isMatch) {
      return res.status(401).json({ error: "Identifiants incorrects" });
    }

    const token = jwt.sign(
      { id: client.id, role: "client" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      client: {
        id: client.id,
        nom: client.nom,
        email: client.email,
      },
    });
  } catch (error) {
    console.error("Erreur de connexion client:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

module.exports = { clientLogin };
