const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const clientRoutes = require("./routes/clientRoutes");
const siteRoutes = require("./routes/siteRoutes");
const interventionRoutes = require("./routes/interventionRoutes");
const familleRoutes = require("./routes/familleRoutes");
const articleRoutes = require("./routes/articleRoutes");
const appareilRoutes = require("./routes/appareilRoutes");
const ficheRoutes = require("./routes/ficheRoutes");
const bonCommandeRoutes = require("./routes/bonCommandeRoutes");

dotenv.config();
const app = express();

// app.use(cors());
app.use(
  cors({
    origin: "http://localhost:3000", // Autoriser spécifiquement le frontend
    credentials: true,
  })
);
app.use(express.json());
app.use("/public", express.static("public"));

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/sites", siteRoutes);
app.use("/api/interventions", interventionRoutes);
app.use("/api/familles", familleRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/appareils", appareilRoutes);
app.use("/api/fiches", ficheRoutes);
app.use("/api/bons-commande", bonCommandeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
