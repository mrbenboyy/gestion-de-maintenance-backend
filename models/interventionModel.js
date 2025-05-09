const pool = require("../db");

const createIntervention = async (interventionData) => {
  const {
    client_id,
    site_id,
    technicien_id,
    date_planifiee,
    type_visite,
    created_by,
  } = interventionData;

  // Récupérer le region_id du site
  const site = await pool.query("SELECT region_id FROM sites WHERE id = $1", [
    site_id,
  ]);
  if (!site.rows[0]) throw new Error("Site introuvable");

  const result = await pool.query(
    `INSERT INTO interventions 
    (client_id, site_id, technicien_id, date_planifiee, type_visite, created_by, status, region_id) 
    VALUES ($1, $2, $3, $4, $5, $6, 'planifiee', $7) 
    RETURNING *`,
    [
      client_id,
      site_id,
      technicien_id,
      date_planifiee,
      type_visite,
      created_by,
      site.rows[0].region_id,
    ]
  );
  return result.rows[0];
};

const updateIntervention = async (id, updateData) => {
  let region_id;
  const {
    client_id,
    site_id,
    technicien_id,
    date_planifiee,
    type_visite,
    notes,
    status,
  } = updateData;

  if (updateData.site_id) {
    const site = await pool.query("SELECT region_id FROM sites WHERE id = $1", [
      updateData.site_id,
    ]);
    region_id = site.rows[0].region_id;
  }

  const result = await pool.query(
    `UPDATE interventions SET
        client_id = COALESCE($1, client_id),
        site_id = COALESCE($2, site_id),
        technicien_id = COALESCE($3, technicien_id),
        date_planifiee = COALESCE($4, date_planifiee),
        type_visite = COALESCE($5, type_visite),
        notes = COALESCE($6, notes),
        status = COALESCE($7, status),
        region_id = COALESCE($8, region_id),
        updated_at = NOW()
      WHERE id = $9
      RETURNING *`,
    [
      client_id,
      site_id,
      technicien_id,
      date_planifiee,
      type_visite,
      notes,
      status,
      region_id,
      id,
    ]
  );

  return result.rows[0];
};

const updateInterventionStatus = async (id, newStatus) => {
  const validStatuses = [
    "planifiee",
    "en_cours",
    "terminee",
    "annulee",
    "reportee",
  ];
  if (!validStatuses.includes(newStatus)) {
    throw new Error("Statut invalide");
  }

  const result = await pool.query(
    "UPDATE interventions SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
    [newStatus, id]
  );
  return result.rows[0];
};

const getInterventionById = async (id) => {
  const result = await pool.query(
    `SELECT i.*, r.nom as region, c.nom as client_nom, s.nom as site_nom, u.nom as technicien_nom, 
     s.lat, s.lng
     FROM interventions i
     JOIN region r ON i.region_id = r.id
     JOIN clients c ON i.client_id = c.id
     JOIN sites s ON i.site_id = s.id
     JOIN users u ON i.technicien_id = u.id
     WHERE i.id = $1`,
    [id]
  );
  return result.rows[0];
};

const getInterventionsByTechnicien = async (technicienId) => {
  const result = await pool.query(
    `SELECT 
      i.*, 
      c.nom as client_nom, 
      s.nom as site_nom 
     FROM interventions i
     JOIN clients c ON i.client_id = c.id
     JOIN sites s ON i.site_id = s.id
     WHERE technicien_id = $1 
     ORDER BY date_planifiee`,
    [technicienId]
  );
  return result.rows;
};

const deleteIntervention = async (id) => {
  await pool.query("DELETE FROM interventions WHERE id = $1", [id]);
};
module.exports = {
  createIntervention,
  updateIntervention,
  updateInterventionStatus,
  getInterventionById,
  getInterventionsByTechnicien,
  deleteIntervention,
};
