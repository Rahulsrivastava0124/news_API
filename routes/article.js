const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  validateCreateArticle,
  validateUpdateArticle,
} = require("../middleware/validation");
const {
  getAllArticles,
  getArticleById,
  getArticlesInShort,
  createArticle,
  updateArticle,
  deleteArticle,
  toggleLikeArticle,
  shareArticle,
  addComment,
  getArticlesCount,
} = require("../controllers/articleController");

// @route   GET /api/article
// @desc    Get all articles (with optional filtering)
// @access  Public
router.get("/", getAllArticles);

// @route   GET /api/article/count
// @desc    Get total count of articles
// @access  Public
router.get("/count", getArticlesCount);

// @route   GET /api/article/short
// @desc    Get articles in short format (titles and brief content)
// @access  Public
router.get("/short", getArticlesInShort);

// @route   GET /api/article/:id
// @desc    Get article by ID
// @access  Public
router.get("/:id", getArticleById);

// @route   POST /api/article
// @desc    Create article
// @access  Private
router.post("/", protect, validateCreateArticle, createArticle);

// @route   PUT /api/article/:id
// @desc    Update article
// @access  Private
router.put("/:id", protect, validateUpdateArticle, updateArticle);

// @route   DELETE /api/article/:id
// @desc    Delete article
// @access  Private
router.delete("/:id", protect, deleteArticle);

// @route   POST /api/article/:id/like
// @desc    Like/Unlike article
// @access  Private
router.post("/:id/like", protect, toggleLikeArticle);

// @route   POST /api/article/:id/share
// @desc    Share article
// @access  Public
router.post("/:id/share", shareArticle);

// @route   POST /api/article/:id/comment
// @desc    Add comment to article
// @access  Private
router.post("/:id/comment", protect, addComment);

module.exports = router; 