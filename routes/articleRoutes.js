const express = require("express");
const router = express.Router();
const articleController = require("../controllers/articleController");

router.post("/", articleController.addArticle);
router.get("/", articleController.getArticles);
router.get("/:code", articleController.getArticle);
router.put("/:code", articleController.modifyArticle);
router.delete("/:code", articleController.removeArticle);

module.exports = router;
