const express = require("express");
const router = express.Router();
const articleController = require("../controllers/articleController");
const { uploadArticle } = require("../utils/upload");

router.post("/", uploadArticle.single("image"), articleController.addArticle);
router.get("/", articleController.getArticles);
router.get("/:code", articleController.getArticle);
router.put(
  "/:code",
  uploadArticle.single("image"),
  articleController.modifyArticle
);
router.delete("/:code", articleController.removeArticle);

module.exports = router;
