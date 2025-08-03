const { body, validationResult } = require("express-validator");

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
      })),
    });
  }
  next();
};

// Register validation
const validateRegister = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  body("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Please provide a valid phone number"),
  body("profilePicture")
    .optional()
    .isURL()
    .withMessage("Profile picture must be a valid URL"),
  handleValidationErrors,
];

// Login validation
const validateLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];

// Update profile validation
const validateUpdateProfile = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Please provide a valid phone number"),
  handleValidationErrors,
];

// Reset password validation
const validateResetPassword = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  handleValidationErrors,
];

// Verify OTP with new password validation
const validateVerifyOTPWithPassword = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("otp")
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage("OTP must be a 6-digit number"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "New password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  handleValidationErrors,
];

// New password validation
const validateNewPassword = [
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Password confirmation does not match password");
    }
    return true;
  }),
  handleValidationErrors,
];

// Create news validation
const validateCreateNews = [
  body("category")
    .isMongoId()
    .withMessage("Category must be a valid category ID"),
  body("title")
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Title must be between 5 and 200 characters"),
  body("subtitle")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Subtitle cannot exceed 500 characters"),
  body("htmlData")
    .trim()
    .isLength({ min: 10 })
    .withMessage("HTML content must be at least 10 characters"),
  body("publishDate")
    .optional()
    .isISO8601()
    .withMessage("Publish date must be a valid date"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("tags.*")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Each tag must be between 1 and 50 characters"),
  body("featuredImage")
    .optional()
    .isURL()
    .withMessage("Featured image must be a valid URL"),
  body("isPublished")
    .optional()
    .isBoolean()
    .withMessage("isPublished must be a boolean"),
  handleValidationErrors,
];

// Update news validation
const validateUpdateNews = [
  body("category")
    .optional()
    .isMongoId()
    .withMessage("Category must be a valid category ID"),
  body("title")
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Title must be between 5 and 200 characters"),
  body("subtitle")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Subtitle cannot exceed 500 characters"),
  body("htmlData")
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage("HTML content must be at least 10 characters"),
  body("publishDate")
    .optional()
    .isISO8601()
    .withMessage("Publish date must be a valid date"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("tags.*")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Each tag must be between 1 and 50 characters"),
  body("featuredImage")
    .optional()
    .isURL()
    .withMessage("Featured image must be a valid URL"),
  body("isPublished")
    .optional()
    .isBoolean()
    .withMessage("isPublished must be a boolean"),
  handleValidationErrors,
];

// Create category validation
const validateCreateCategory = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Category name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z0-9\s]+$/)
    .withMessage("Category name can only contain letters, numbers, and spaces"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Description cannot exceed 200 characters"),
  body("slug")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Slug must be between 2 and 50 characters")
    .matches(/^[a-z0-9-]+$/)
    .withMessage(
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),
  body("color")
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage("Color must be a valid hex color code"),
  body("icon")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Icon name cannot exceed 50 characters"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
  handleValidationErrors,
];

// Update category validation
const validateUpdateCategory = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Category name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z0-9\s]+$/)
    .withMessage("Category name can only contain letters, numbers, and spaces"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Description cannot exceed 200 characters"),
  body("slug")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Slug must be between 2 and 50 characters")
    .matches(/^[a-z0-9-]+$/)
    .withMessage(
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),
  body("color")
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage("Color must be a valid hex color code"),
  body("icon")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Icon name cannot exceed 50 characters"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
  handleValidationErrors,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateResetPassword,
  validateVerifyOTPWithPassword,
  validateNewPassword,
  validateCreateNews,
  validateUpdateNews,
  validateCreateCategory,
  validateUpdateCategory,
  handleValidationErrors,
};
