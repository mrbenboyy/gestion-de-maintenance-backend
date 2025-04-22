const express = require("express");
const router = express.Router();
const familleController = require("../controllers/familleController");

router.post("/", familleController.addFamille);
router.get("/", familleController.getFamilles);
router.get("/:id", familleController.getFamille);
router.put("/:id", familleController.modifyFamille);
router.delete("/:id", familleController.removeFamille);

module.exports = router;
