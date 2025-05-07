const siteModel = require("../models/siteModel");

const validateSiteData = (data) => {
  const errors = [];

  if (!data.nom) errors.push("Le nom du site est obligatoire");
  if (!data.client_id) errors.push("Le client associé est obligatoire");
  if (!data.lat) errors.push("La latitude est obligatoire");
  if (!data.lng) errors.push("La longitude est obligatoire");
  if (!["Agence", "Bureau", "Entrepôt"].includes(data.type_site)) {
    errors.push("Type de site invalide");
  }
  if (!data.adresse) errors.push("L'adresse est obligatoire");
  if (
    data.nombre_visites_annuelles &&
    ![1, 2].includes(data.nombre_visites_annuelles)
  ) {
    errors.push("Nombre de visites annuelles doit être 1 ou 2");
  }

  return errors;
};

const handleSiteError = (err, res) => {
  if (err.code === "23503") {
    res.status(400).json({ error: "Client introuvable" });
  } else {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

const addSite = async (req, res) => {
  const errors = validateSiteData(req.body);
  if (errors.length > 0) return res.status(400).json({ errors });

  try {
    const newSite = await siteModel.createSite(req.body);
    res.status(201).json(newSite);
  } catch (err) {
    handleSiteError(err, res);
  }
};

const updateSite = async (req, res) => {
  const errors = validateSiteData(req.body);
  if (errors.length > 0) return res.status(400).json({ errors });

  try {
    const updatedSite = await siteModel.updateSite(req.params.id, req.body);
    if (!updatedSite) return res.status(404).json({ error: "Site non trouvé" });
    res.json(updatedSite);
  } catch (err) {
    handleSiteError(err, res);
  }
};

const deleteSite = async (req, res) => {
  try {
    await siteModel.deleteSite(req.params.id);
    res.status(204).send();
  } catch (err) {
    if (err.code === "23503") {
      res.status(400).json({
        error: "Impossible de supprimer un site avec des interventions liées",
      });
    } else {
      res.status(500).json({ error: "Erreur serveur" });
    }
  }
};

const getClientSites = async (req, res) => {
  try {
    const sites = await siteModel.getSitesByClient(req.params.clientId);
    res.json(sites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllSites = async (req, res) => {
  try {
    const sites = await siteModel.getAllSites();
    res.json(sites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getSiteById = async (req, res) => {
  try {
    const site = await siteModel.getSiteById(req.params.id);
    if (!site) return res.status(404).json({ error: "Site non trouvé" });
    res.json(site);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getSiteDetails = async (req, res) => {
  try {
    const site = await siteModel.getSiteById(req.params.id);
    if (!site) return res.status(404).json({ error: "Site non trouvé" });
    res.json(site);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  addSite,
  getClientSites,
  getAllSites,
  getSiteById,
  updateSite,
  deleteSite,
  getSiteDetails,
};
