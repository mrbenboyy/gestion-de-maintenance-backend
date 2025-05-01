const pool = require("../db");

const createBonCommande = async (technicienId, articles) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Création du bon principal
    const bonResult = await client.query(
      `INSERT INTO bons_commande (technicien_id, statut)
       VALUES ($1, 'en_attente')
       RETURNING *`,
      [technicienId]
    );

    const bonId = bonResult.rows[0].id;

    // Insertion des articles
    for (const article of articles) {
      await client.query(
        `INSERT INTO commande_articles (commande_id, article_code, quantite_demandee)
         VALUES ($1, $2, $3)`,
        [bonId, article.code, article.quantite]
      );
    }

    await client.query("COMMIT");
    return await getBonById(bonId);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const getBonById = async (id) => {
  const bonResult = await pool.query(
    `SELECT b.*, u.nom as technicien_nom 
     FROM bons_commande b
     JOIN users u ON b.technicien_id = u.id
     WHERE b.id = $1`,
    [id]
  );

  const articlesResult = await pool.query(
    `SELECT a.code, a.designation, ca.quantite_demandee
     FROM commande_articles ca
     JOIN articles a ON ca.article_code = a.code
     WHERE ca.commande_id = $1`,
    [id]
  );

  return {
    ...bonResult.rows[0],
    articles: articlesResult.rows,
  };
};

const getBonsByTechnicien = async (technicienId) => {
  const result = await pool.query(
    `SELECT b.*, COUNT(ca.article_code) as nb_articles
     FROM bons_commande b
     LEFT JOIN commande_articles ca ON b.id = ca.commande_id
     WHERE b.technicien_id = $1
     GROUP BY b.id
     ORDER BY b.date_creation DESC`,
    [technicienId]
  );
  return result.rows;
};

const getAllBons = async (statut) => {
  let query = `
      SELECT 
        b.id,
        b.technicien_id,
        b.date_creation,
        b.statut,
        b.commentaire_validation,
        u.nom as technicien_nom, 
        COUNT(ca.article_code) as nb_articles
      FROM bons_commande b
      JOIN users u ON b.technicien_id = u.id
      LEFT JOIN commande_articles ca ON b.id = ca.commande_id
    `;

  const params = [];
  if (statut) {
    query += " WHERE b.statut = $1";
    params.push(statut);
  }

  query += " GROUP BY b.id, u.nom ORDER BY b.date_creation DESC";

  const result = await pool.query(query, params);
  return result.rows;
};

const updateBonStatut = async (id, newStatut, commentaire) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Mise à jour du statut
    const result = await client.query(
      `UPDATE bons_commande
         SET statut = $1, commentaire_validation = $2
         WHERE id = $3
         RETURNING *`,
      [newStatut, commentaire, id]
    );

    // Si statut = "livre", mettre à jour le stock
    if (newStatut === "livre") {
      const articles = await client.query(
        "SELECT article_code, quantite_demandee FROM commande_articles WHERE commande_id = $1",
        [id]
      );

      for (const article of articles.rows) {
        await client.query(
          "UPDATE articles SET stock = stock + $1 WHERE code = $2",
          [article.quantite_demandee, article.article_code]
        );
      }
    }

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const deleteBonCommande = async (id) => {
  await pool.query("DELETE FROM bons_commande WHERE id = $1", [id]);
};

module.exports = {
  createBonCommande,
  getBonById,
  getBonsByTechnicien,
  getAllBons,
  updateBonStatut,
  deleteBonCommande,
};
