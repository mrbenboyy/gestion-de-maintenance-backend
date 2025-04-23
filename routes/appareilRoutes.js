const express = require("express");
const router = express.Router();
const appareilController = require("../controllers/appareilController");

router.post("/", appareilController.addAppareil);
router.get("/", appareilController.getAppareils);
router.get("/:id", appareilController.getAppareil);
router.put("/:id", appareilController.modifyAppareil);
router.delete("/:id", appareilController.removeAppareil);

module.exports = router;
