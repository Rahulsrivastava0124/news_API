const BlobHandler = require('../utils/blobHandler');
const mongoose = require('mongoose');

// @desc    Upload single file as blob
// @access  Private
const uploadSingleFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Validate file
    BlobHandler.validateFileSize(req.file);
    BlobHandler.validateFileType(req.file);

    // Convert to blob data
    const blobData = BlobHandler.fileToBlob(req.file);
    
    // Add metadata
    blobData.uploadedBy = req.user?.id;
    blobData.fieldName = req.file.fieldname;
    blobData.metadata = req.body;

    // Create response with URL
    const responseData = {
      fileId: new mongoose.Types.ObjectId().toString(),
      filename: blobData.originalName,
      mimeType: blobData.contentType,
      size: blobData.size,
      url: BlobHandler.createBlobUrl(blobData.fileId, req.file.fieldname),
      uploadedAt: blobData.uploadedAt,
      blobData: BlobHandler.blobToBase64(blobData) // Base64 for API response
    };

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully as blob',
      data: responseData
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message
    });
  }
};

// @desc    Upload multiple files as blobs
// @access  Private
const uploadMultipleFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadedFiles = [];
    
    for (const file of req.files) {
      // Validate file
      BlobHandler.validateFileSize(file);
      BlobHandler.validateFileType(file);

      // Convert to blob data
      const blobData = BlobHandler.fileToBlob(file);
      blobData.uploadedBy = req.user?.id;
      blobData.fieldName = file.fieldname;
      blobData.metadata = req.body;

      const fileData = {
        fileId: new mongoose.Types.ObjectId().toString(),
        filename: blobData.originalName,
        mimeType: blobData.contentType,
        size: blobData.size,
        url: BlobHandler.createBlobUrl(blobData.fileId, file.fieldname),
        uploadedAt: blobData.uploadedAt,
        blobData: BlobHandler.blobToBase64(blobData)
      };
      
      uploadedFiles.push(fileData);
    }

    res.status(201).json({
      success: true,
      message: `${uploadedFiles.length} files uploaded successfully as blobs`,
      data: uploadedFiles
    });
  } catch (error) {
    console.error('Multiple files upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading files',
      error: error.message
    });
  }
};

// @desc    Upload files with specific fields as blobs
// @access  Private
const uploadFields = async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadedFiles = {};

    for (const [fieldName, files] of Object.entries(req.files)) {
      if (Array.isArray(files)) {
        uploadedFiles[fieldName] = [];
        for (const file of files) {
          // Validate file
          BlobHandler.validateFileSize(file);
          BlobHandler.validateFileType(file);

          // Convert to blob data
          const blobData = BlobHandler.fileToBlob(file);
          blobData.uploadedBy = req.user?.id;
          blobData.fieldName = fieldName;
          blobData.metadata = req.body;

          const fileData = {
            fileId: new mongoose.Types.ObjectId().toString(),
            filename: blobData.originalName,
            mimeType: blobData.contentType,
            size: blobData.size,
            url: BlobHandler.createBlobUrl(blobData.fileId, fieldName),
            uploadedAt: blobData.uploadedAt,
            blobData: BlobHandler.blobToBase64(blobData)
          };
          
          uploadedFiles[fieldName].push(fileData);
        }
      } else {
        // Validate file
        BlobHandler.validateFileSize(files);
        BlobHandler.validateFileType(files);

        // Convert to blob data
        const blobData = BlobHandler.fileToBlob(files);
        blobData.uploadedBy = req.user?.id;
        blobData.fieldName = fieldName;
        blobData.metadata = req.body;

        const fileData = {
          fileId: new mongoose.Types.ObjectId().toString(),
          filename: blobData.originalName,
          mimeType: blobData.contentType,
          size: blobData.size,
          url: BlobHandler.createBlobUrl(blobData.fileId, fieldName),
          uploadedAt: blobData.uploadedAt,
          blobData: BlobHandler.blobToBase64(blobData)
        };
        
        uploadedFiles[fieldName] = fileData;
      }
    }

    res.status(201).json({
      success: true,
      message: 'Files uploaded successfully as blobs',
      data: uploadedFiles
    });
  } catch (error) {
    console.error('Fields upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading files',
      error: error.message
    });
  }
};

module.exports = {
  uploadSingleFile,
  uploadMultipleFiles,
  uploadFields
};
