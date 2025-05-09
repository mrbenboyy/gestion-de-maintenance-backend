const depotModel = require("../models/depotModel");

const getDepots = async (req, res) => {
  try {
    const depots = await depotModel.getAllDepots();
    res.json(depots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getDepotById = async (req, res) => {
  const { id } = req.params;
  try {
    const depot = await depotModel.getDepotById(id);
    if (!depot) return res.status(404).json({ error: "Depot non trouvée" });
    res.json(depot);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addDepot = async (req, res) => {
  const { nom } = req.body;
  try {
    const newDepot = await depotModel.createDepot(nom);
    res.status(201).json(newDepot);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateDepot = async (req, res) => {
  const { id } = req.params;
  const { nom } = req.body;
  try {
    const updatedDepot = await depotModel.updateDepot(id, nom);
    res.json(updatedDepot);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteDepot = async (req, res) => {
  const { id } = req.params;
  try {
    await depotModel.deleteDepot(id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getDepots,
  addDepot,
  getDepotById,
  updateDepot,
  deleteDepot,
};
