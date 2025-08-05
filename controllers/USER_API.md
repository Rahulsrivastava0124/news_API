# User Management API Documentation

This document describes the User Management API endpoints for retrieving user data and statistics.

## Base URL
```
http://localhost:3000/api/auth
```

## Authentication
All endpoints require authentication using JWT Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Get All Users (Admin Only)

**Endpoint:** `GET /api/auth/users`

**Description:** Retrieve all users with pagination, search, and filtering capabilities. Admin access required.

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of users per page (default: 10, max: 50)
- `search` (optional): Search users by name or email
- `role` (optional): Filter by user role ('user' or 'admin')
- `isActive` (optional): Filter by user status ('true' or 'false')

**Example Request:**
```bash
GET /api/auth/users?page=1&limit=10&search=john&role=user&isActive=true
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "name": "John Doe",
        "email": "john@example.com",
        "profilePicture": "https://example.com/profile.jpg",
        "phone": "+1234567890",
        "isEmailVerified": true,
        "lastLogin": "2024-01-15T10:30:00.000Z",
        "isActive": true,
        "role": "user",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalUsers": 50,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

**Error Responses:**

**403 Forbidden (Admin Access Required):**
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```

**401 Unauthorized (Invalid Token):**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Error fetching users"
}
```

### 2. Get Statistics (Admin Only)

**Endpoint:** `GET /api/auth/count`

**Description:** Retrieve comprehensive statistics about users and published content. Admin access required.

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Example Request:**
```bash
GET /api/auth/count
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 150,
      "publishedNews": 45,
      "publishedBlogs": 32,
      "publishedArticles": 28,
      "totalNews": 50,
      "totalBlogs": 40,
      "totalArticles": 35
    },
    "recentActivity": {
      "newUsers": 12,
      "newNews": 8,
      "newBlogs": 5,
      "newArticles": 3
    },
    "percentages": {
      "newsPublished": 90,
      "blogsPublished": 80,
      "articlesPublished": 80
    }
  }
}
```

**Response Fields Explanation:**

**Overview:**
- `totalUsers`: Total number of registered users
- `publishedNews`: Number of published news articles
- `publishedBlogs`: Number of published blog posts
- `publishedArticles`: Number of published articles
- `totalNews`: Total number of news articles (published + unpublished)
- `totalBlogs`: Total number of blog posts (published + unpublished)
- `totalArticles`: Total number of articles (published + unpublished)

**Recent Activity (Last 7 Days):**
- `newUsers`: Number of new users registered in the last 7 days
- `newNews`: Number of new news articles created in the last 7 days
- `newBlogs`: Number of new blog posts created in the last 7 days
- `newArticles`: Number of new articles created in the last 7 days

**Percentages:**
- `newsPublished`: Percentage of news articles that are published
- `blogsPublished`: Percentage of blog posts that are published
- `articlesPublished`: Percentage of articles that are published

**Error Responses:**

**403 Forbidden (Admin Access Required):**
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```

**401 Unauthorized (Invalid Token):**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Error fetching statistics"
}
```

## Usage Examples

### Get All Users with Search
```bash
curl -X GET "http://localhost:3000/api/auth/users?search=john&role=user&page=1&limit=20" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json"
```

### Get Statistics
```bash
curl -X GET "http://localhost:3000/api/auth/count" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json"
```

### JavaScript/Fetch Example
```javascript
// Get all users
const getUsers = async (token, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await fetch(`http://localhost:3000/api/auth/users?${queryString}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return await response.json();
};

// Get statistics
const getStatistics = async (token) => {
  const response = await fetch('http://localhost:3000/api/auth/count', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return await response.json();
};

// Usage
const token = 'your-jwt-token';
const users = await getUsers(token, { page: 1, limit: 10, search: 'john' });
const stats = await getStatistics(token);
```

## Notes

1. **Admin Access Required**: Both endpoints require admin privileges. Regular users will receive a 403 Forbidden response.

2. **Pagination**: The users endpoint supports pagination with customizable page size (max 50 users per page).

3. **Search Functionality**: Search works on both user name and email fields using case-insensitive regex matching.

4. **Filtering**: Users can be filtered by role (user/admin) and active status.

5. **Security**: Sensitive fields like password, OTP, and tokens are automatically excluded from responses.

6. **Performance**: Statistics are calculated using efficient database queries with Promise.all for parallel execution.

7. **Recent Activity**: Recent activity is calculated for the last 7 days from the current date.

## Error Handling

The API follows consistent error handling patterns:
- **400**: Bad Request (invalid parameters)
- **401**: Unauthorized (missing or invalid token)
- **403**: Forbidden (insufficient privileges)
- **500**: Internal Server Error (server-side errors)

All error responses include a `success: false` flag and a descriptive `message` field. 