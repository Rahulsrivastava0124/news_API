# Controllers

This directory contains the controller files that handle the business logic for the API endpoints.

## Structure

### authController.js
Handles all authentication-related operations:
- User registration
- User login
- Token refresh
- Profile management (get/update)
- Password reset (forgot password, verify OTP)
- User logout

### newsController.js
Handles all news-related operations:
- Get all news articles
- Get news by ID
- Create news article
- Update news article
- Delete news article

## Usage

Controllers are imported in route files and used as middleware functions. They handle:
- Request validation (through middleware)
- Business logic processing
- Database operations
- Response formatting

## Example

```javascript
// In routes/auth.js
const { register, login } = require('../controllers/authController');

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
```

## Error Handling

All controllers include proper error handling with:
- Try-catch blocks
- Appropriate HTTP status codes
- Consistent error response format
- Console logging for debugging

## Response Format

Controllers return consistent JSON responses:
```javascript
{
  success: true/false,
  message: "Response message",
  data: { /* response data */ }
}
``` 