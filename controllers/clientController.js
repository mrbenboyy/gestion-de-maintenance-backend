const clientModel = require("../models/clientModel");

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

const validateClientData = (data) => {
  const errors = [];

  if (!data.nom) errors.push("Le nom est obligatoire");
  if (!data.telephone) errors.push("Le téléphone est obligatoire");
  if (!data.adresse) errors.push("L'adresse est obligatoire");
  if (!["SAV", "Detection"].includes(data.contrat)) {
    errors.push("Type de contrat invalide");
  }
  if (!["unitaire", "forfaitaire"].includes(data.sous_type_contrat)) {
    errors.push("Sous-type de contrat invalide");
  }

  return errors;
};

const addClient = async (req, res) => {
  const errors = validateClientData(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const newClient = await clientModel.createClient(req.body);
    res.status(201).json(newClient);
  } catch (err) {
    handleDatabaseError(err, res);
  }
};

const updateClient = async (req, res) => {
  const errors = validateClientData(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const updatedClient = await clientModel.updateClient(
      req.params.id,
      req.body
    );
    res.json(updatedClient);
  } catch (err) {
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
