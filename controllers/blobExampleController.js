const User = require('../models/User');
const BlobHandler = require('../utils/blobHandler');

// @desc    Update user profile picture with blob
// @access  Private
const updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image uploaded'
      });
    }

    // Validate file
    BlobHandler.validateFileSize(req.file, 5 * 1024 * 1024); // 5MB limit for profile pics
    BlobHandler.validateFileType(req.file, ['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

    // Convert to blob data
    const blobData = BlobHandler.fileToBlob(req.file);

    // Update user profile picture
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        profilePicture: {
          data: blobData.data,
          contentType: blobData.contentType,
          originalName: blobData.originalName,
          size: blobData.size,
          uploadedAt: blobData.uploadedAt
        }
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Return response with base64 image data
    const responseData = {
      ...user.toObject(),
      profilePicture: user.profilePicture ? {
        ...user.profilePicture,
        data: user.profilePicture.data.toString('base64'),
        url: `/api/users/${user._id}/profile-picture`
      } : null
    };

    res.json({
      success: true,
      message: 'Profile picture updated successfully',
      data: responseData
    });
  } catch (error) {
    console.error('Update profile picture error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile picture',
      error: error.message
    });
  }
};

// @desc    Get user profile picture
// @access  Public
const getProfilePicture = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('profilePicture');
    
    if (!user || !user.profilePicture || !user.profilePicture.data) {
      return res.status(404).json({
        success: false,
        message: 'Profile picture not found'
      });
    }

    // Set appropriate headers
    res.set({
      'Content-Type': user.profilePicture.contentType,
      'Content-Disposition': `inline; filename="${user.profilePicture.originalName}"`,
      'Content-Length': user.profilePicture.size
    });

    // Send the blob data
    res.send(user.profilePicture.data);
  } catch (error) {
    console.error('Get profile picture error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving profile picture',
      error: error.message
    });
  }
};

// @desc    Get user with profile picture as base64
// @access  Private
const getUserWithProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Convert profile picture to base64 if it exists
    const responseData = {
      ...user.toObject(),
      profilePicture: user.profilePicture && user.profilePicture.data ? {
        ...user.profilePicture,
        data: user.profilePicture.data.toString('base64'),
        url: `/api/users/${user._id}/profile-picture`
      } : null
    };

    res.json({
      success: true,
      message: 'User retrieved successfully',
      data: responseData
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving user',
      error: error.message
    });
  }
};

module.exports = {
  updateProfilePicture,
  getProfilePicture,
  getUserWithProfilePicture
};
