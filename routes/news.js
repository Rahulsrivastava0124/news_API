const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews
} = require('../controllers/newsController');

// @route   GET /api/news
// @desc    Get all news
// @access  Public
router.get('/', getAllNews);

// @route   GET /api/news/:id
// @desc    Get news by ID
// @access  Public
router.get('/:id', getNewsById);

// @route   POST /api/news
// @desc    Create news article
// @access  Private
router.post('/', protect, createNews);

// @route   PUT /api/news/:id
// @desc    Update news article
// @access  Private
router.put('/:id', protect, updateNews);

// @route   DELETE /api/news/:id
// @desc    Delete news article
// @access  Private
router.delete('/:id', protect, deleteNews);

module.exports = router; 