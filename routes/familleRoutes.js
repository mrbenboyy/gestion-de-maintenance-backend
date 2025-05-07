const express = require("express");
const router = express.Router();
const familleController = require("../controllers/familleController");
const { uploadFamille } = require("../utils/upload");

router.post("/", uploadFamille.single("image"), familleController.addFamille);
router.get("/", familleController.getFamilles);
router.get("/:id", familleController.getFamille);
router.put(
  "/:id",
  uploadFamille.single("image"),
  familleController.modifyFamille
);
router.delete("/:id", familleController.removeFamille);

module.exports = router;
