const pool = require("../db");

const getAllFiches = async () => {
  // Récupération des fiches de base
  const fichesResult = await pool.query(`
      SELECT 
        f.*, 
        i.date_planifiee,
        i.technicien_id,
        u.nom as technicien_nom,
        c.nom as client_nom
      FROM fiches_verification f
      JOIN interventions i ON f.intervention_id = i.id
      JOIN users u ON i.technicien_id = u.id
      JOIN clients c ON i.client_id = c.id
      ORDER BY f.created_at DESC
    `);

  // Récupération groupée de tous les articles
  const articlesResult = await pool.query(`
      SELECT 
        fa.fiche_id,
        json_agg(json_build_object(
          'code', a.code,
          'designation', a.designation,
          'quantite', fa.quantite
        )) as articles
      FROM fiche_articles fa
      JOIN articles a ON fa.article_code = a.code
      GROUP BY fa.fiche_id
    `);

  // Récupération groupée de tous les appareils
  const appareilsResult = await pool.query(`
      SELECT 
        fap.fiche_id,
        json_agg(json_build_object(
          'id', ap.id,
          'nom', ap.nom,
          'quantite', fap.quantite,
          'observation', fap.observation
        )) as appareils
      FROM fiche_appareils fap
      JOIN appareils ap ON fap.appareil_id = ap.id
      GROUP BY fap.fiche_id
    `);

  // Fusion des résultats
  return fichesResult.rows.map((fiche) => ({
    ...fiche,
    articles:
      articlesResult.rows.find((a) => a.fiche_id === fiche.id)?.articles || [],
    appareils:
      appareilsResult.rows.find((a) => a.fiche_id === fiche.id)?.appareils ||
      [],
  }));
};

const createFicheVerification = async (ficheData) => {
  const {
    intervention_id,
    observations,
    signature_base64,
    articles,
    appareils,
  } = ficheData;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Création de la fiche principale
    const ficheResult = await client.query(
      `INSERT INTO fiches_verification 
      (intervention_id, observations, signature_base64) 
      VALUES ($1, $2, $3) RETURNING *`,
      [intervention_id, observations, signature_base64]
    );

    const ficheId = ficheResult.rows[0].id;

    // Insertion des articles utilisés
    for (const article of articles) {
      await client.query(
        `INSERT INTO fiche_articles 
        (fiche_id, article_code, quantite) 
        VALUES ($1, $2, $3)`,
        [ficheId, article.code, article.quantite]
      );
    }

    // Insertion des appareils contrôlés
    for (const appareil of appareils) {
      await client.query(
        `INSERT INTO fiche_appareils 
        (fiche_id, appareil_id, quantite, observation) 
        VALUES ($1, $2, $3, $4)`,
        [ficheId, appareil.id, appareil.quantite, appareil.observation]
      );
    }

    await client.query("COMMIT");
    return await getFullFicheById(ficheId);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const getFullFicheById = async (id) => {
  const ficheResult = await pool.query(
    `SELECT f.*, i.date_planifiee, i.technicien_id 
     FROM fiches_verification f
     JOIN interventions i ON f.intervention_id = i.id
     WHERE f.id = $1`,
    [id]
  );

  const articlesResult = await pool.query(
    `SELECT a.code, a.designation, fa.quantite 
     FROM fiche_articles fa
     JOIN articles a ON fa.article_code = a.code
     WHERE fa.fiche_id = $1`,
    [id]
  );

  const appareilsResult = await pool.query(
    `SELECT ap.id, ap.nom, fap.quantite, fap.observation 
     FROM fiche_appareils fap
     JOIN appareils ap ON fap.appareil_id = ap.id
     WHERE fap.fiche_id = $1`,
    [id]
  );

  return {
    ...ficheResult.rows[0],
    articles: articlesResult.rows,
    appareils: appareilsResult.rows,
  };
};

const updateFicheVerification = async (id, updateData) => {
  const { observations, signature_base64, articles, appareils } = updateData;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Mise à jour de la fiche principale
    const ficheResult = await client.query(
      `UPDATE fiches_verification SET
        observations = COALESCE($1, observations),
        signature_base64 = COALESCE($2, signature_base64)
      WHERE id = $3 RETURNING *`,
      [observations, signature_base64, id]
    );

    // Suppression des anciennes relations
    await client.query("DELETE FROM fiche_articles WHERE fiche_id = $1", [id]);
    await client.query("DELETE FROM fiche_appareils WHERE fiche_id = $1", [id]);

    // Réinsertion des nouvelles données
    for (const article of articles) {
      await client.query(
        `INSERT INTO fiche_articles 
        (fiche_id, article_code, quantite) 
        VALUES ($1, $2, $3)`,
        [id, article.code, article.quantite]
      );
    }

    for (const appareil of appareils) {
      await client.query(
        `INSERT INTO fiche_appareils 
        (fiche_id, appareil_id, quantite, observation) 
        VALUES ($1, $2, $3, $4)`,
        [id, appareil.id, appareil.quantite, appareil.observation]
      );
    }

    await client.query("COMMIT");
    return await getFullFicheById(id);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const deleteFicheVerification = async (id) => {
  await pool.query("DELETE FROM fiches_verification WHERE id = $1", [id]);
};

const getFichesByTechnicien = async (technicienId) => {
  const result = await pool.query(
    `SELECT f.*, i.date_planifiee 
     FROM fiches_verification f
     JOIN interventions i ON f.intervention_id = i.id
     WHERE i.technicien_id = $1
     ORDER BY i.date_planifiee DESC`,
    [technicienId]
  );
  return result.rows;
};

const getFicheByIntervention = async (interventionId) => {
  const result = await pool.query(
    "SELECT * FROM fiches_verification WHERE intervention_id = $1",
    [interventionId]
  );
  return result.rows[0];
};

module.exports = {
  getAllFiches,
  createFicheVerification,
  getFullFicheById,
  updateFicheVerification,
  deleteFicheVerification,
  getFichesByTechnicien,
  getFicheByIntervention,
};
