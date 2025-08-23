const User = require('../models/User');
const {
  generateAccessToken,
  generatePasswordResetToken,
  verifyToken
} = require('../utils/jwt');
const {
  sendOTPEmail,
  sendPasswordResetEmail
} = require('../utils/email');
const BlobHandler = require('../utils/blobHandler');

// @desc    Register a new user
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Handle profile picture upload
    let profilePictureData = null;
    
    // Check if image is uploaded as file
    if (req.file) {
      // Validate file
      BlobHandler.validateFileSize(req.file, 5 * 1024 * 1024); // 5MB limit for profile pics
      BlobHandler.validateFileType(req.file, ['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

      // Convert to blob data
      const blobData = BlobHandler.fileToBlob(req.file);
      profilePictureData = {
        data: blobData.data,
        contentType: blobData.contentType,
        originalName: blobData.originalName,
        size: blobData.size,
        uploadedAt: blobData.uploadedAt
      };
    }
    // Check if profilePicture is provided in request body
    else if (req.body.profilePicture) {
      const { profilePicture } = req.body;
      
      // Handle different formats of profilePicture
      if (profilePicture.data) {
        // If it's already in blob format
        profilePictureData = {
          data: Buffer.from(profilePicture.data, 'base64'),
          contentType: profilePicture.contentType || 'image/jpeg',
          originalName: profilePicture.originalName || 'profile.jpg',
          size: profilePicture.size || 0,
          uploadedAt: profilePicture.uploadedAt || new Date()
        };
      } else if (profilePicture.objectURL) {
        // If it's a blob URL, we'll need to handle this on frontend
        // For now, we'll store the URL as a string
        profilePictureData = {
          data: null,
          contentType: 'application/octet-stream',
          originalName: 'blob-url',
          size: 0,
          uploadedAt: new Date(),
          objectURL: profilePicture.objectURL
        };
      } else if (typeof profilePicture === 'string') {
        // If it's a base64 string
        profilePictureData = {
          data: Buffer.from(profilePicture, 'base64'),
          contentType: 'image/jpeg',
          originalName: 'profile.jpg',
          size: Buffer.from(profilePicture, 'base64').length,
          uploadedAt: new Date()
        };
      }
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      phone,
      profilePicture: profilePictureData,
      isEmailVerified: true // Immediately verified
    });

    await user.save();

    // Remove password from response and convert profile picture to base64
    const userResponse = {
      ...user.toObject(),
      profilePicture: user.profilePicture && user.profilePicture.data ? {
        ...user.profilePicture,
        data: user.profilePicture.data.toString('base64'),
        url: `/api/auth/users/${user._id}/profile-picture`
      } : null
    };
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please log in to get access tokens.',
      data: {
        user: userResponse
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user'
    });
  }
};

// @desc    Login user
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken(user._id);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        accessToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login'
    });
  }
};



// @desc    Get user profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
};

// @desc    Update user profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, phone, profilePicture } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (profilePicture) updateData.profilePicture = profilePicture;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
};

// @desc    Send password reset email with OTP
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate OTP
    const otp = user.generateOTP();
    await user.save();

    // Send OTP email
    try {
      await sendOTPEmail(email, otp, user.name);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email'
      });
    }

    res.json({
      success: true,
      message: 'OTP sent to your email address'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing request'
    });
  }
};

// @desc    Verify OTP and update password
// @access  Public
const verifyOTP = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify OTP
    const isOTPValid = user.verifyOTP(otp);
    if (!isOTPValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Update password
    user.password = newPassword;
    user.clearOTP(); // Clear OTP after successful reset
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password'
    });
  }
};

// @desc    Logout user (client should remove tokens)
// @access  Private
const logout = async (req, res) => {
  try {
    // In a more advanced implementation, you might want to blacklist the token
    // For now, we'll just return a success response
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during logout'
    });
  }
};

// @desc    Get all users (Admin only)
// @access  Private (Admin)
const getAllUsers = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    
    // Search by name or email
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Filter by role
    if (req.query.role) {
      query.role = req.query.role;
    }

    // Filter by status
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }

    // Get total count
    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);

    // Get users with pagination
    const users = await User.find(query)
      .select('-password -otp -emailVerificationToken -resetPasswordToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
};

// @desc    Get content and user statistics
// @access  Private (Admin)
const getStatistics = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const News = require('../models/News');
    const Blog = require('../models/Blog');
    const Article = require('../models/Article');

    // Get counts
    const [
      totalUsers,
      publishedNews,
      publishedBlogs,
      publishedArticles,
      totalNews,
      totalBlogs,
      totalArticles
    ] = await Promise.all([
      User.countDocuments(),
      News.countDocuments({ isPublished: true }),
      Blog.countDocuments({ isPublished: true }),
      Article.countDocuments({ isPublished: true }),
      News.countDocuments(),
      Blog.countDocuments(),
      Article.countDocuments()
    ]);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const [
      recentUsers,
      recentNews,
      recentBlogs,
      recentArticles
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      News.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Blog.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Article.countDocuments({ createdAt: { $gte: sevenDaysAgo } })
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          publishedNews,
          publishedBlogs,
          publishedArticles,
          totalNews,
          totalBlogs,
          totalArticles
        },
        recentActivity: {
          newUsers: recentUsers,
          newNews: recentNews,
          newBlogs: recentBlogs,
          newArticles: recentArticles
        },
        percentages: {
          newsPublished: totalNews > 0 ? Math.round((publishedNews / totalNews) * 100) : 0,
          blogsPublished: totalBlogs > 0 ? Math.round((publishedBlogs / totalBlogs) * 100) : 0,
          articlesPublished: totalArticles > 0 ? Math.round((publishedArticles / totalArticles) * 100) : 0
        }
      }
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
};

// @desc    Update profile picture
// @access  Private
const updateProfilePicture = async (req, res) => {
  try {
    let profilePictureData = null;
    
    // Check if image is uploaded as file
    if (req.file) {
      // Validate file
      BlobHandler.validateFileSize(req.file, 5 * 1024 * 1024); // 5MB limit for profile pics
      BlobHandler.validateFileType(req.file, ['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

      // Convert to blob data
      const blobData = BlobHandler.fileToBlob(req.file);
      profilePictureData = {
        data: blobData.data,
        contentType: blobData.contentType,
        originalName: blobData.originalName,
        size: blobData.size,
        uploadedAt: blobData.uploadedAt
      };
    }
    // Check if profilePicture is provided in request body
    else if (req.body.profilePicture) {
      const { profilePicture } = req.body;
      
      // Handle different formats of profilePicture
      if (profilePicture.data) {
        // If it's already in blob format
        profilePictureData = {
          data: Buffer.from(profilePicture.data, 'base64'),
          contentType: profilePicture.contentType || 'image/jpeg',
          originalName: profilePicture.originalName || 'profile.jpg',
          size: profilePicture.size || 0,
          uploadedAt: profilePicture.uploadedAt || new Date()
        };
      } else if (profilePicture.objectURL) {
        // If it's a blob URL, we'll need to handle this on frontend
        // For now, we'll store the URL as a string
        profilePictureData = {
          data: null,
          contentType: 'application/octet-stream',
          originalName: 'blob-url',
          size: 0,
          uploadedAt: new Date(),
          objectURL: profilePicture.objectURL
        };
      } else if (typeof profilePicture === 'string') {
        // If it's a base64 string
        profilePictureData = {
          data: Buffer.from(profilePicture, 'base64'),
          contentType: 'image/jpeg',
          originalName: 'profile.jpg',
          size: Buffer.from(profilePicture, 'base64').length,
          uploadedAt: new Date()
        };
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'No image uploaded or provided in request body'
      });
    }

    // Update user profile picture
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        profilePicture: profilePictureData
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
        data: user.profilePicture.data ? user.profilePicture.data.toString('base64') : null,
        url: `/api/auth/users/${user._id}/profile-picture`
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

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  forgotPassword,
  verifyOTP,
  logout,
  getAllUsers,
  getStatistics,
  updateProfilePicture,
  getProfilePicture
}; 