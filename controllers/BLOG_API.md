# Blog API Documentation

## Overview
The Blog API provides endpoints for managing blog posts with features like likes, comments, and read time tracking.

## Base URL
```
http://localhost:3000/api/blog
```

## Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Get All Blogs
**GET** `/api/blog`

**Query Parameters:**
- `category` (optional): Filter by category ID
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sortBy` (optional): Sort field (default: "publishDate")
- `sortOrder` (optional): Sort order - "asc" or "desc" (default: "desc")
- `search` (optional): Search in title and subtitle
- `published` (optional): Filter by published status - "true" or "false"

**Response:**
```json
{
  "success": true,
  "message": "Blogs retrieved successfully",
  "data": [
    {
      "_id": "blog_id",
      "title": "Blog Title",
      "subtitle": "Blog Subtitle",
      "category": {
        "_id": "category_id",
        "name": "Category Name",
        "slug": "category-slug",
        "color": "#3B82F6",
        "icon": "folder"
      },
      "author": {
        "_id": "user_id",
        "name": "Author Name",
        "email": "author@example.com",
        "profilePicture": "profile_url"
      },
      "publishDate": "2024-01-01T00:00:00.000Z",
      "views": 100,
      "readTime": 5,
      "likes": 25,
      "tags": ["tag1", "tag2"],
      "featuredImage": "image_url",
      "isPublished": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

### 2. Get Blogs in Short Format
**GET** `/api/blog/short`

**Query Parameters:** Same as Get All Blogs

**Response:**
```json
{
  "success": true,
  "message": "Blogs in short format retrieved successfully",
  "data": [
    {
      "_id": "blog_id",
      "title": "Blog Title",
      "subtitle": "Blog Subtitle",
      "briefContent": "First 150 characters of content...",
      "category": {
        "_id": "category_id",
        "name": "Category Name"
      },
      "author": {
        "_id": "user_id",
        "name": "Author Name"
      },
      "publishDate": "2024-01-01T00:00:00.000Z",
      "views": 100,
      "readTime": 5,
      "likes": 25,
      "featuredImage": "image_url",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 20
  }
}
```

### 3. Get Blog by ID
**GET** `/api/blog/:id`

**Response:**
```json
{
  "success": true,
  "message": "Blog retrieved successfully",
  "data": {
    "_id": "blog_id",
    "title": "Blog Title",
    "subtitle": "Blog Subtitle",
    "htmlData": "<p>Full HTML content...</p>",
    "category": {
      "_id": "category_id",
      "name": "Category Name",
      "slug": "category-slug",
      "color": "#3B82F6",
      "icon": "folder",
      "description": "Category description"
    },
    "author": {
      "_id": "user_id",
      "name": "Author Name",
      "email": "author@example.com",
      "profilePicture": "profile_url"
    },
    "publishDate": "2024-01-01T00:00:00.000Z",
    "views": 101,
    "readTime": 5,
    "likes": 25,
    "tags": ["tag1", "tag2"],
    "featuredImage": "image_url",
    "isPublished": true,
    "comments": [
      {
        "_id": "comment_id",
        "user": {
          "_id": "user_id",
          "name": "Commenter Name",
          "email": "commenter@example.com",
          "profilePicture": "profile_url"
        },
        "content": "Comment content",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. Create Blog Post
**POST** `/api/blog`

**Authentication:** Required

**Request Body:**
```json
{
  "category": "category_id",
  "title": "Blog Title",
  "subtitle": "Blog Subtitle",
  "htmlData": "<p>HTML content...</p>",
  "publishDate": "2024-01-01T00:00:00.000Z",
  "tags": ["tag1", "tag2"],
  "featuredImage": "image_url",
  "isPublished": false,
  "readTime": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Blog post created successfully",
  "data": {
    "_id": "blog_id",
    "title": "Blog Title",
    "subtitle": "Blog Subtitle",
    "htmlData": "<p>HTML content...</p>",
    "category": {
      "_id": "category_id",
      "name": "Category Name",
      "slug": "category-slug",
      "color": "#3B82F6",
      "icon": "folder"
    },
    "author": {
      "_id": "user_id",
      "name": "Author Name",
      "email": "author@example.com",
      "profilePicture": "profile_url"
    },
    "publishDate": "2024-01-01T00:00:00.000Z",
    "views": 0,
    "readTime": 5,
    "likes": 0,
    "tags": ["tag1", "tag2"],
    "featuredImage": "image_url",
    "isPublished": false,
    "comments": [],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 5. Update Blog Post
**PUT** `/api/blog/:id`

**Authentication:** Required (Author or Admin only)

**Request Body:** Same as Create Blog Post (all fields optional)

**Response:** Same as Create Blog Post

### 6. Delete Blog Post
**DELETE** `/api/blog/:id`

**Authentication:** Required (Author or Admin only)

**Response:**
```json
{
  "success": true,
  "message": "Blog post deleted successfully"
}
```

### 7. Like/Unlike Blog Post
**POST** `/api/blog/:id/like`

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "message": "Blog liked successfully",
  "data": {
    "likes": 26
  }
}
```

### 8. Add Comment to Blog Post
**POST** `/api/blog/:id/comment`

**Authentication:** Required

**Request Body:**
```json
{
  "content": "Comment content"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Comment added successfully",
  "data": {
    "_id": "comment_id",
    "user": {
      "_id": "user_id",
      "name": "Commenter Name",
      "email": "commenter@example.com",
      "profilePicture": "profile_url"
    },
    "content": "Comment content",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "title",
      "message": "Title must be between 5 and 200 characters"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized to access this resource"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Not authorized to update this blog post"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Blog post not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error fetching blogs",
  "error": "Error details"
}
```

## Features

### Blog-specific Features:
- **Read Time**: Estimated reading time in minutes
- **Likes**: Like/unlike functionality
- **Comments**: Comment system with user details
- **Views**: Automatic view count tracking
- **Tags**: Categorization with tags
- **Featured Image**: Support for featured images
- **Publish Status**: Draft/published status control

### Common Features:
- **Pagination**: Built-in pagination support
- **Search**: Full-text search in title and subtitle
- **Filtering**: Filter by category and published status
- **Sorting**: Sort by any field in ascending or descending order
- **Author Tracking**: Automatic author assignment from JWT token
- **Category Integration**: Full integration with category system 