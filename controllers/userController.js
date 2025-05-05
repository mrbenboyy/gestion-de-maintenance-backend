const userModel = require("../models/userModel");

const getUsers = async (req, res) => {
  try {
    const users = await userModel.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await userModel.getUserById(id);
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addUser = async (req, res) => {
  const { nom, email, mot_de_passe, role, region, depot } = req.body;
  const image = req.file ? `/public/uploads/users/${req.file.filename}` : null;

  if (role === "technicien" && (!region || !depot)) {
    return res
      .status(400)
      .json({ error: "Region et depot obligatoires pour les techniciens" });
  }

  try {
    const newUser = await userModel.createUser(
      nom,
      email,
      mot_de_passe,
      role,
      region || null,
      depot || null,
      image
    );
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { nom, email, role, mot_de_passe, region, depot } = req.body;
  const image = req.file
    ? `/public/uploads/users/${req.file.filename}`
    : undefined;

  if (role === "technicien" && (region === undefined || depot === undefined)) {
    try {
      const existingUser = await userModel.getUserById(id);
      if (!existingUser)
        return res.status(404).json({ error: "Utilisateur non trouvé" });

      if (
        existingUser.role !== "technicien" &&
        (region === undefined || depot === undefined)
      ) {
        return res.status(400).json({
          error: "Region et depot obligatoires pour les techniciens",
        });
      }
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  try {
    const updatedUser = await userModel.updateUser(
      id,
      nom,
      email,
      role,
      mot_de_passe,
      region,
      depot,
      image
    );
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getTechniciens = async (req, res) => {
  try {
    const techniciens = await userModel.getTechniciens();
    res.json(techniciens);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await userModel.deleteUser(id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getUsers,
  addUser,
  getUserById,
  updateUser,
  deleteUser,
  getTechniciens,
};
