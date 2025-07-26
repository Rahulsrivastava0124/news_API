# News API with Authentication

A comprehensive REST API for news management with JWT-based authentication and password management features.

## Features

- 🔐 **JWT Authentication** - Secure token-based authentication
- 🔒 **Password Management** - Forgot password with OTP verification
- 👤 **User Management** - Complete user profile management
- 🖼️ **Profile Picture** - Upload profile photo during registration
- 🛡️ **Security** - Input validation, password hashing, and security headers
- 📝 **Documentation** - Comprehensive API documentation

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Email**: Nodemailer (for password reset only)
- **Validation**: Express-validator
- **Security**: bcryptjs, helmet, cors

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd news_API
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `config.env` and update the values:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/news_api
   NODE_ENV=development
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   JWT_REFRESH_EXPIRES_IN=30d
   
   # Email Configuration (Gmail) - Only for password reset
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   
   # Frontend URL (for email links)
   FRONTEND_URL=http://localhost:3000
   ```

4. **Email Setup (Gmail) - Optional**
   - Only needed if you want password reset functionality
   - Enable 2-factor authentication on your Gmail account
   - Generate an App Password
   - Use the App Password in `EMAIL_PASSWORD`

5. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### 1. Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123",
  "phone": "+1234567890",
  "profilePicture": "https://example.com/photo.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully. Please log in to get access tokens.",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "isEmailVerified": true,
      "profilePicture": "https://example.com/photo.jpg",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Note:** After registration, users need to log in separately to get access and refresh tokens.

#### 2. Login User
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "isEmailVerified": true,
      "lastLogin": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

#### 3. Get User Profile
```http
GET /auth/profile
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "profilePicture": "url_to_picture",
      "isEmailVerified": true,
      "role": "user",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### 4. Update User Profile
```http
PUT /auth/profile
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "John Smith",
  "phone": "+1987654321",
  "profilePicture": "https://example.com/picture.jpg"
}
```

#### 5. Change Password
```http
POST /auth/change-password
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "currentPassword": "Password123",
  "newPassword": "NewPassword123",
  "confirmPassword": "NewPassword123"
}
```

#### 6. Forgot Password (Send OTP)
```http
POST /auth/forgot-password
```

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

#### 7. Verify OTP
```http
POST /auth/verify-otp
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "resetToken": "reset_token"
  }
}
```

#### 8. Reset Password
```http
POST /auth/reset-password
```

**Request Body:**
```json
{
  "resetToken": "reset_token",
  "password": "NewPassword123",
  "confirmPassword": "NewPassword123"
}
```

#### 9. Refresh Token
```http
POST /auth/refresh-token
```

**Request Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "new_access_token"
  }
}
```

#### 10. Logout
```http
POST /auth/logout
Authorization: Bearer <access_token>
```

### General Endpoints

#### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "database": "Connected",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Authentication

### JWT Token Usage

Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Token Types

1. **Access Token**: Used for API authentication (expires in 7 days)
2. **Refresh Token**: Used to get new access tokens (expires in 30 days)
3. **Password Reset Token**: Used for password reset (expires in 1 hour)

## Security Features

- **Password Hashing**: Passwords are hashed using bcryptjs
- **JWT Security**: Tokens are signed and verified
- **Input Validation**: All inputs are validated using express-validator
- **Security Headers**: Helmet.js provides security headers
- **CORS**: Cross-origin resource sharing is configured

## Email Features

### Email Templates

The API includes beautiful HTML email templates for:
- Password reset OTP
- Password reset confirmation

### Email Configuration

Configure your email settings in `config.env` (only needed for password reset):
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

## Validation Rules

### User Registration
- Name: 2-50 characters
- Email: Valid email format, unique
- Password: Minimum 6 characters, must contain uppercase, lowercase, and number
- Phone: Optional, valid phone number format
- Profile Picture: Optional, valid URL format

### Password Requirements
- Minimum 6 characters
- Must contain at least one uppercase letter
- Must contain at least one lowercase letter
- Must contain at least one number

## Database Schema

### User Model
```javascript
{
  name: String (required, 2-50 chars),
  email: String (required, unique, lowercase),
  password: String (required, hashed),
  profilePicture: String (optional),
  phone: String (optional),
  isEmailVerified: Boolean (default: true),
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  otp: {
    code: String,
    expires: Date
  },
  lastLogin: Date,
  isActive: Boolean (default: true),
  role: String (enum: ['user', 'admin'], default: 'user'),
  createdAt: Date,
  updatedAt: Date
}
```

## Development

### Project Structure
```
news_API/
├── models/
│   └── User.js
├── routes/
│   ├── auth.js
│   └── news.js
├── middleware/
│   ├── auth.js
│   └── validation.js
├── utils/
│   ├── jwt.js
│   └── email.js
├── server.js
├── package.json
├── config.env
└── README.md
```

### Available Scripts
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests (not implemented yet)
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/news_api |
| `NODE_ENV` | Environment mode | development |
| `JWT_SECRET` | JWT signing secret | your-secret-key-change-in-production |
| `JWT_EXPIRES_IN` | Access token expiry | 7d |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | 30d |
| `EMAIL_SERVICE` | Email service provider | gmail |
| `EMAIL_USER` | Email username | - |
| `EMAIL_PASSWORD` | Email password/app password | - |
| `FRONTEND_URL` | Frontend URL for email links | http://localhost:3000 |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please open an issue in the repository.