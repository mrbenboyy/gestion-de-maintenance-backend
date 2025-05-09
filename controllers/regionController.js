const regionModel = require("../models/regionModel");

const getRegions = async (req, res) => {
  try {
    const regions = await regionModel.getAllRegions();
    res.json(regions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getRegionById = async (req, res) => {
  const { id } = req.params;
  try {
    const region = await regionModel.getRegionById(id);
    if (!region) return res.status(404).json({ error: "Region non trouvée" });
    res.json(region);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addRegion = async (req, res) => {
  const { nom } = req.body;
  try {
    const newRegion = await regionModel.createRegion(nom);
    res.status(201).json(newRegion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateRegion = async (req, res) => {
  const { id } = req.params;
  const { nom } = req.body;
  try {
    const updatedRegion = await regionModel.updateRegion(id, nom);
    res.json(updatedRegion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteRegion = async (req, res) => {
  const { id } = req.params;
  try {
    await regionModel.deleteRegion(id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getRegions,
  addRegion,
  getRegionById,
  updateRegion,
  deleteRegion,
};
