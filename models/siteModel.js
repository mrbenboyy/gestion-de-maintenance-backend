const pool = require("../db");

const createSite = async (siteData) => {
  const {
    nom,
    client_id,
    type_site,
    adresse,
    lat,
    lng,
    nombre_visites_annuelles,
    region_id,
  } = siteData;
  const result = await pool.query(
    `INSERT INTO sites 
    (nom, client_id, type_site, adresse, lat, lng, nombre_visites_annuelles, region_id) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
    RETURNING *`,
    [
      nom,
      client_id,
      type_site,
      adresse,
      lat,
      lng,
      nombre_visites_annuelles,
      region_id,
    ]
  );
  return result.rows[0];
};

const getSitesByClient = async (clientId) => {
  const result = await pool.query(
    `SELECT id, nom, client_id, type_site, adresse, lat, lng, region_id 
     FROM sites 
     WHERE client_id = $1`,
    [clientId]
  );
  return result.rows;
};

const getAllSites = async () => {
  const result = await pool.query(`
    SELECT s.*, r.nom as region, c.nom as client_nom, c.image as client_image
    FROM sites s
    JOIN clients c ON s.client_id = c.id
    JOIN region r ON s.region_id = r.id
    ORDER BY s.created_at DESC
  `);
  return result.rows;
};

const getSiteById = async (id) => {
  const result = await pool.query(
    `
      SELECT s.*, c.nom as client_nom 
      FROM sites s
      JOIN clients c ON s.client_id = c.id
      WHERE s.id = $1
    `,
    [id]
  );
  return result.rows[0];
};

const updateSite = async (id, siteData) => {
  const {
    nom,
    client_id,
    type_site,
    adresse,
    lat,
    lng,
    nombre_visites_annuelles,
    region_id,
  } = siteData;
  const result = await pool.query(
    `UPDATE sites SET
      nom = $1,
      client_id = $2,
      type_site = $3,
      adresse = $4,
      lat = $5,
      lng = $6,
      nombre_visites_annuelles = $7,
      region_id = $8,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $9
    RETURNING *`,
    [
      nom,
      client_id,
      type_site,
      adresse,
      lat,
      lng,
      nombre_visites_annuelles,
      region_id,
      id,
    ]
  );
  return result.rows[0];
};

const deleteSite = async (id) => {
  await pool.query("DELETE FROM sites WHERE id = $1", [id]);
};

module.exports = {
  createSite,
  getSitesByClient,
  getAllSites,
  getSiteById,
  updateSite,
  deleteSite,
};
