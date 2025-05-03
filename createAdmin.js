require("dotenv").config();
const userModel = require("./models/userModel");
const readline = require("readline");
const bcrypt = require("bcrypt");

async function createAdmin() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Solution pour les versions Node.js < 17
  const question = (query) =>
    new Promise((resolve) => rl.question(query, resolve));

  try {
    const nom = await question("Nom de l'admin: ");
    const email = await question("Email: ");
    const password = await question("Mot de passe: ");


    const admin = await userModel.createUser(
      nom,
      email,
      password, 
      "admin",
      null,
      null
    );

    console.log("\x1b[32mAdmin créé avec succès:\x1b[0m", admin);
  } catch (error) {
    console.error("\x1b[31mErreur critique:\x1b[0m", error.message);
    console.error("Détails techniques:", error);
  } finally {
    rl.close();
    process.exit();
  }
}

createAdmin();
