const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  validateCreateCategory,
  validateUpdateCategory,
} = require("../middleware/validation");
const {
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  getNewsByCategory,
} = require("../controllers/categoryController");

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get("/", getAllCategories);

// @route   GET /api/categories/:id
// @desc    Get category by ID
// @access  Public
router.get("/:id", getCategoryById);

// @route   GET /api/categories/slug/:slug
// @desc    Get category by slug
// @access  Public
router.get("/slug/:slug", getCategoryBySlug);

// @route   GET /api/categories/:id/news
// @desc    Get news by category
// @access  Public
router.get("/:id/news", getNewsByCategory);

// @route   POST /api/categories
// @desc    Create category
// @access  Private
router.post("/", protect, validateCreateCategory, createCategory);

// @route   PUT /api/categories/:id
// @desc    Update category
// @access  Private
router.put("/:id", protect, validateUpdateCategory, updateCategory);

// @route   DELETE /api/categories/:id
// @desc    Delete category
// @access  Private
router.delete("/:id", protect, deleteCategory);

module.exports = router;
