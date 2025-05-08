const nodemailer = require("nodemailer");

const typeVisiteTraduction = {
  premiere: "1ère visite",
  deuxieme: "2ème visite",
  curative: "Visite curative",
};

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendInterventionEmail = async (technicienEmail, interventionDetails) => {
  console.log("Détails reçus:", interventionDetails);
  let localisationHtml = "";

  try {
    if (interventionDetails.lat && interventionDetails.lng) {
      const destination = `${interventionDetails.lat},${interventionDetails.lng}`;
      const googleMapsLink = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;

      localisationHtml = `
        <p><strong>Localisation :</strong></p>
        <a href="${googleMapsLink}" target="_blank">
          🗺️ Voir l'itinéraire sur Google Maps
        </a>
        <p><em>(Ouvre l'application avec la destination pré-remplie)</em></p>
      `;
    }
  } catch (error) {
    console.error("Erreur de localisation:", error);
  }

  if (!localisationHtml) {
    localisationHtml = `<p><em>Localisation non disponible</em></p>`;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: technicienEmail,
    subject: "Nouvelle intervention planifiée",
    html: `
      <h2>📅 Nouvelle intervention programmée</h2>
      <p>🔧 <strong>Client:</strong> ${
        interventionDetails.client_nom || "Non spécifié"
      }</p>
      <p>🏭 <strong>Site:</strong> ${
        interventionDetails.site_nom || "Non spécifié"
      }</p>
      <p>📆 <strong>Date:</strong> ${new Date(
        interventionDetails.date_planifiee
      ).toLocaleDateString("fr-FR")}</p>
      <p>📌 <strong>Type:</strong> ${
        typeVisiteTraduction[interventionDetails.type_visite] || "Non spécifié"
      }</p>
      ${localisationHtml}
      <hr>
      <p>ℹ️ <em>Vous pouvez consulter les détails complets sur <a href="${
        process.env.FRONTEND_URL
      }">la plateforme</a></em></p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendInterventionEmail };
