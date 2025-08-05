const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  validateCreateBlog,
  validateUpdateBlog,
} = require("../middleware/validation");
const {
  getAllBlogs,
  getBlogById,
  getBlogsInShort,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleLikeBlog,
  addComment,
} = require("../controllers/blogController");

// @route   GET /api/blog
// @desc    Get all blogs (with optional filtering)
// @access  Public
router.get("/", getAllBlogs);

// @route   GET /api/blog/short
// @desc    Get blogs in short format (titles and brief content)
// @access  Public
router.get("/short", getBlogsInShort);

// @route   GET /api/blog/:id
// @desc    Get blog by ID
// @access  Public
router.get("/:id", getBlogById);

// @route   POST /api/blog
// @desc    Create blog post
// @access  Private
router.post("/", protect, validateCreateBlog, createBlog);

// @route   PUT /api/blog/:id
// @desc    Update blog post
// @access  Private
router.put("/:id", protect, validateUpdateBlog, updateBlog);

// @route   DELETE /api/blog/:id
// @desc    Delete blog post
// @access  Private
router.delete("/:id", protect, deleteBlog);

// @route   POST /api/blog/:id/like
// @desc    Like/Unlike blog post
// @access  Private
router.post("/:id/like", protect, toggleLikeBlog);

// @route   POST /api/blog/:id/comment
// @desc    Add comment to blog post
// @access  Private
router.post("/:id/comment", protect, addComment);

module.exports = router; 