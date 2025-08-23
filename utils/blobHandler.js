const mongoose = require('mongoose');

class BlobHandler {
  // Convert uploaded file to blob data for MongoDB storage
  static fileToBlob(file) {
    if (!file) return null;
    
    return {
      data: file.buffer, // The actual blob data as Buffer
      contentType: file.mimetype,
      originalName: file.originalname,
      size: file.size,
      uploadedAt: new Date()
    };
  }

  // Convert blob data to base64 for API responses
  static blobToBase64(blobData) {
    if (!blobData || !blobData.data) return null;
    
    return {
      data: blobData.data.toString('base64'),
      contentType: blobData.contentType,
      originalName: blobData.originalName,
      size: blobData.size,
      uploadedAt: blobData.uploadedAt
    };
  }

  // Create a URL for blob data
  static createBlobUrl(fileId, fieldName = 'image') {
    return `/api/blob/${fileId}/${fieldName}`;
  }

  // Validate file size
  static validateFileSize(file, maxSize = 50 * 1024 * 1024) { // 50MB default
    if (file.size > maxSize) {
      throw new Error(`File size exceeds maximum limit of ${maxSize / (1024 * 1024)}MB`);
    }
    return true;
  }

  // Validate file type
  static validateFileType(file, allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']) {
    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error(`File type ${file.mimetype} is not allowed`);
    }
    return true;
  }

  // Process multiple files
  static processMultipleFiles(files) {
    if (!files || files.length === 0) return [];
    
    return files.map(file => this.fileToBlob(file));
  }

  // Process files with specific fields
  static processFieldFiles(files) {
    if (!files || Object.keys(files).length === 0) return {};
    
    const processedFiles = {};
    
    for (const [fieldName, fieldFiles] of Object.entries(files)) {
      if (Array.isArray(fieldFiles)) {
        processedFiles[fieldName] = fieldFiles.map(file => this.fileToBlob(file));
      } else {
        processedFiles[fieldName] = this.fileToBlob(fieldFiles);
      }
    }
    
    return processedFiles;
  }
}

module.exports = BlobHandler;
