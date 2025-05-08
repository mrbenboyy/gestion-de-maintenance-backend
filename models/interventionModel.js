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

  const site = await pool.query("SELECT region FROM sites WHERE id = $1", [
    site_id,
  ]);
  const technicien = await pool.query(
    "SELECT region FROM users WHERE id = $1",
    [technicien_id]
  );

  if (
    site.rows[0].region.toLowerCase() !==
    technicien.rows[0].region.toLowerCase()
  ) {
    throw new Error("Région mismatch (case insensitive)");
  }

  const result = await pool.query(
    `INSERT INTO interventions 
    (client_id, site_id, technicien_id, date_planifiee, type_visite, created_by, status) 
    VALUES ($1, $2, $3, $4, $5, $6, 'planifiee') 
    RETURNING 
      *,
      (SELECT nom FROM clients WHERE id = $1) as client_nom,
      (SELECT nom || ' - ' || adresse FROM sites WHERE id = $2) as site_nom,
      (SELECT lat FROM sites WHERE id = $2) as lat,
    (SELECT lng FROM sites WHERE id = $2) as lng`,
    [client_id, site_id, technicien_id, date_planifiee, type_visite, created_by]
  );
  return result.rows[0];
};

const updateIntervention = async (id, updateData) => {
  const {
    client_id,
    site_id,
    technicien_id,
    date_planifiee,
    type_visite,
    notes,
    status,
  } = updateData;

  if (technicien_id || site_id) {
    const siteId =
      site_id ||
      (
        await pool.query("SELECT site_id FROM interventions WHERE id = $1", [
          id,
        ])
      ).rows[0].site_id;
    const technicienId =
      technicien_id ||
      (
        await pool.query(
          "SELECT technicien_id FROM interventions WHERE id = $1",
          [id]
        )
      ).rows[0].technicien_id;

    const site = await pool.query("SELECT region FROM sites WHERE id = $1", [
      siteId,
    ]);
    const technicien = await pool.query(
      "SELECT region FROM users WHERE id = $1",
      [technicienId]
    );

    if (
      site.rows[0].region.toLowerCase() !==
      technicien.rows[0].region.toLowerCase()
    ) {
      throw new Error("Région mismatch (case insensitive)");
    }
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
        updated_at = NOW()
      WHERE id = $8
      RETURNING *`,
    [
      client_id,
      site_id,
      technicien_id,
      date_planifiee,
      type_visite,
      notes,
      status,
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
    `SELECT i.*, c.nom as client_nom, s.nom as site_nom, u.nom as technicien_nom, 
     s.lat, s.lng
     FROM interventions i
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
    "SELECT * FROM interventions WHERE technicien_id = $1 ORDER BY date_planifiee",
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
