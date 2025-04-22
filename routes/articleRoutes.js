const express = require("express");
const router = express.Router();
const articleController = require("../controllers/articleController");

router.post("/", articleController.addArticle);
router.get("/:code", articleController.getArticle);

module.exports = router;
