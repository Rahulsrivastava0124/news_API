const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  uploadSingle,
  uploadMultiple,
  uploadFields
} = require("../middleware/upload");
const {
  uploadSingleFile,
  uploadMultipleFiles,
  uploadFields: uploadFieldsHandler
} = require("../controllers/fileController");

// @route   POST /api/files/upload
// @desc    Upload single file as blob
// @access  Private
router.post("/upload", protect, uploadSingle, uploadSingleFile);

// @route   POST /api/files/upload-multiple
// @desc    Upload multiple files as blobs
// @access  Private
router.post("/upload-multiple", protect, uploadMultiple, uploadMultipleFiles);

// @route   POST /api/files/upload-fields
// @desc    Upload files with specific fields as blobs
// @access  Private
router.post("/upload-fields", protect, uploadFields, uploadFieldsHandler);

module.exports = router;
