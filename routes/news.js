const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  validateCreateNews,
  validateUpdateNews,
} = require("../middleware/validation");
const {
  getAllNews,
  getNewsById,
  getNewsInShort,
  createNews,
  updateNews,
  deleteNews,
  getNewsCount,
} = require("../controllers/newsController");

// @route   GET /api/news
// @desc    Get all news (with optional filtering)
// @access  Public
router.get("/", getAllNews);

// @route   GET /api/news/count
// @desc    Get total count of news
// @access  Public
router.get("/count", getNewsCount);

// @route   GET /api/news/short
// @desc    Get news in short format (titles and brief content)
// @access  Public
router.get("/short", getNewsInShort);

// @route   GET /api/news/:id
// @desc    Get news by ID
// @access  Public
router.get("/:id", getNewsById);

// @route   POST /api/news
// @desc    Create news article
// @access  Private
router.post("/", protect, validateCreateNews, createNews);

// @route   PUT /api/news/:id
// @desc    Update news article
// @access  Private
router.put("/:id", protect, validateUpdateNews, updateNews);

// @route   DELETE /api/news/:id
// @desc    Delete news article
// @access  Private
router.delete("/:id", protect, deleteNews);

module.exports = router;
