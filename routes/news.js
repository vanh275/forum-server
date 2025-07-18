const express = require("express");
const router = express.Router();
const { upload } = require("../middleware/multer");
const {
  articleImageHandle,
  createArticle,
  getNewsItem,
  getArticleById,
  getRandomArticlesInOneWeek,
  queryAriticles,
  deleteArticle,
  getAllArticlesForMod,
} = require("../controllers/news-controller");
const { authenticateToken } = require("../middleware/authenticateToken");
const { authorizeRoles } = require("../middleware/authorizeRoles");

router.post(
  "/articles/upload-image",
  upload.single("file"),
  articleImageHandle
);
router.post(
  "/articles",
  authenticateToken,
  authorizeRoles("mod"),
  createArticle
);
router.get("/articles/all-news", getNewsItem);
router.get("/articles/article-mod-dashboard", getAllArticlesForMod);
router.get("/articles/random-articles", getRandomArticlesInOneWeek);
router.get("/articles/search", queryAriticles);
router.get("/articles/:id", getArticleById);

router.delete("/articles/:id", authenticateToken, authorizeRoles("mod"), deleteArticle);

module.exports = router;
