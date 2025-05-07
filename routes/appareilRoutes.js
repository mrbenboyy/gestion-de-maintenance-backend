const express = require("express");
const router = express.Router();
const appareilController = require("../controllers/appareilController");
const { uploadAppareil } = require("../utils/upload");

router.post(
  "/",
  uploadAppareil.single("image"),
  appareilController.addAppareil
);
router.get("/", appareilController.getAppareils);
router.get("/:id", appareilController.getAppareil);
router.put(
  "/:id",
  uploadAppareil.single("image"),
  appareilController.modifyAppareil
);
router.delete("/:id", appareilController.removeAppareil);

module.exports = router;
