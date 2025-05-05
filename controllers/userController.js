const userModel = require("../models/userModel");
const fs = require("fs").promises;
const path = require("path");

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
    // Supprimer l'image si la validation échoue
    if (req.file) {
      const filePath = path.join(
        __dirname,
        "..",
        "public",
        "uploads",
        "users",
        req.file.filename
      );
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.error("Erreur lors de la suppression du fichier:", err);
      }
    }
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
    // Supprimer l'image en cas d'erreur
    if (req.file) {
      const filePath = path.join(
        __dirname,
        "..",
        "public",
        "uploads",
        "users",
        req.file.filename
      );
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.error("Erreur lors de la suppression du fichier:", err);
      }
    }
    res.status(500).json({ error: err.message });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { nom, email, role, mot_de_passe, region, depot } = req.body;
  let newImagePath = req.file
    ? `/public/uploads/users/${req.file.filename}`
    : undefined;
  let oldImagePath = null;

  try {
    // Récupérer l'ancienne image avant mise à jour
    const existingUser = await userModel.getUserById(id);
    if (!existingUser)
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    oldImagePath = existingUser.image;

    // Validation pour les techniciens
    if (
      role === "technicien" &&
      (region === undefined || depot === undefined)
    ) {
      if (req.file) {
        const newImageFullPath = path.join(
          __dirname,
          "..",
          "public",
          "uploads",
          "users",
          req.file.filename
        );
        await fs.unlink(newImageFullPath);
      }
      return res
        .status(400)
        .json({ error: "Region et depot obligatoires pour les techniciens" });
    }

    // Procéder à la mise à jour
    const updatedUser = await userModel.updateUser(
      id,
      nom,
      email,
      role,
      mot_de_passe,
      region,
      depot,
      newImagePath
    );

    // Supprimer l'ancienne image si une nouvelle a été uploadée
    if (req.file && oldImagePath) {
      const oldImageFullPath = path.join(__dirname, "..", oldImagePath);
      await fs.unlink(oldImageFullPath);
    }

    res.json(updatedUser);
  } catch (err) {
    // En cas d'erreur : supprimer la nouvelle image uploadée
    if (req.file) {
      const newImageFullPath = path.join(
        __dirname,
        "..",
        "public",
        "uploads",
        "users",
        req.file.filename
      );
      await fs.unlink(newImageFullPath);
    }
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
