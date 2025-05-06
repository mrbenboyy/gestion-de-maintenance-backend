const clientModel = require("../models/clientModel");
const fs = require("fs").promises;
const path = require("path");

const getClients = async (req, res) => {
  try {
    const clients = await clientModel.getAllClients();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getClientById = async (req, res) => {
  try {
    const client = await clientModel.getClientById(req.params.id);
    if (!client) return res.status(404).json({ error: "Client non trouvé" });
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const validateClientCreationData = (data) => {
  const errors = [];
  // Validation pour la CREATION (tous champs requis)
  if (!data.nom) errors.push("Le nom est obligatoire");
  if (!data.telephone) errors.push("Le téléphone est obligatoire");
  if (!data.adresse) errors.push("L'adresse est obligatoire");
  if (!data.email) errors.push("L'email est obligatoire");
  if (!data.mot_de_passe) errors.push("Le mot de passe est obligatoire");

  // Validation des contrats (uniquement si présents)
  if (data.contrat && !["SAV", "Detection"].includes(data.contrat)) {
    errors.push("Type de contrat invalide");
  }
  if (
    data.sous_type_contrat &&
    !["unitaire", "forfaitaire"].includes(data.sous_type_contrat)
  ) {
    errors.push("Sous-type de contrat invalide");
  }
  return errors;
};

const validateClientUpdateData = (data) => {
  const errors = [];
  // Validation pour la MISE À JOUR (champs facultatifs)
  if (data.nom !== undefined && !data.nom)
    errors.push("Le nom ne peut pas être vide");
  if (data.telephone !== undefined && !data.telephone)
    errors.push("Le téléphone ne peut pas être vide");
  if (data.adresse !== undefined && !data.adresse)
    errors.push("L'adresse ne peut pas être vide");
  if (data.email !== undefined && !data.email)
    errors.push("L'email ne peut pas être vide");

  // Validation des contrats (uniquement si présents)
  if (data.contrat && !["SAV", "Detection"].includes(data.contrat)) {
    errors.push("Type de contrat invalide");
  }
  if (
    data.sous_type_contrat &&
    !["unitaire", "forfaitaire"].includes(data.sous_type_contrat)
  ) {
    errors.push("Sous-type de contrat invalide");
  }
  return errors;
};

const addClient = async (req, res) => {
  const errors = validateClientCreationData(req.body);
  if (errors.length > 0) {
    if (req.file) {
      await fs.unlink(
        path.join(
          __dirname,
          "..",
          "public",
          "uploads",
          "clients",
          req.file.filename
        )
      );
    }
    return res.status(400).json({ errors });
  }

  try {
    const image = req.file
      ? `/public/uploads/clients/${req.file.filename}`
      : null;
    const clientData = { ...req.body, image };
    const newClient = await clientModel.createClient(clientData);
    res.status(201).json(newClient);
  } catch (err) {
    if (req.file) {
      await fs.unlink(
        path.join(
          __dirname,
          "..",
          "public",
          "uploads",
          "clients",
          req.file.filename
        )
      );
    }
    handleDatabaseError(err, res);
  }
};

const updateClient = async (req, res) => {
  const errors = validateClientUpdateData(req.body);
  if (errors.length > 0) {
    if (req.file) {
      await fs.unlink(
        path.join(
          __dirname,
          "..",
          "public",
          "uploads",
          "clients",
          req.file.filename
        )
      );
    }
    return res.status(400).json({ errors });
  }

  try {
    const existingClient = await clientModel.getClientById(req.params.id);
    const newImage = req.file
      ? `/public/uploads/clients/${req.file.filename}`
      : undefined;
    const updatedClient = await clientModel.updateClient(req.params.id, {
      ...req.body,
      image: newImage,
    });

    // If a new image is uploaded, delete the old one
    if (req.file && existingClient.image) {
      await fs.unlink(path.join(__dirname, "..", existingClient.image));
    }
    res.json(updatedClient);
  } catch (err) {
    if (req.file) {
      await fs.unlink(
        path.join(
          __dirname,
          "..",
          "public",
          "uploads",
          "clients",
          req.file.filename
        )
      );
    }
    handleDatabaseError(err, res);
  }
};

const handleDatabaseError = (err, res) => {
  if (err.code === "23505") {
    res
      .status(400)
      .json({ error: "Un client avec ces informations existe déjà" });
  } else {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

const deleteClient = async (req, res) => {
  const { id } = req.params;
  try {
    await clientModel.deleteClient(id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getClients,
  getClientById,
  addClient,
  updateClient,
  deleteClient,
};
