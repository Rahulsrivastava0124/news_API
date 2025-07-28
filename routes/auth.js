const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateResetPassword,
  validateVerifyOTPWithPassword,
  validateNewPassword
} = require('../middleware/validation');
const {
  register,
  login,
  getProfile,
  updateProfile,
  forgotPassword,
  verifyOTP,
  logout
} = require('../controllers/authController');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validateRegister, register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateLogin, login);



// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, getProfile);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, validateUpdateProfile, updateProfile);

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email with OTP
// @access  Public
router.post('/forgot-password', validateResetPassword, forgotPassword);

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and update password
// @access  Public
router.post('/verify-otp', validateVerifyOTPWithPassword, verifyOTP);


// @route   POST /api/auth/logout
// @desc    Logout user (client should remove tokens)
// @access  Private
router.post('/logout', protect, logout);

module.exports = router; 