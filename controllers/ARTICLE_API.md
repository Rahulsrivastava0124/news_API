# Article API Documentation

## Overview
The Article API provides endpoints for managing articles with advanced features like SEO optimization, references, and social sharing.

## Base URL
```
http://localhost:3000/api/article
```

## Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Get All Articles
**GET** `/api/article`

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
  "message": "Articles retrieved successfully",
  "data": [
    {
      "_id": "article_id",
      "title": "Article Title",
      "subtitle": "Article Subtitle",
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
      "readTime": 8,
      "likes": 25,
      "shares": 10,
      "tags": ["tag1", "tag2"],
      "featuredImage": "image_url",
      "isPublished": true,
      "seoKeywords": ["keyword1", "keyword2"],
      "seoDescription": "SEO description for the article",
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

### 2. Get Articles in Short Format
**GET** `/api/article/short`

**Query Parameters:** Same as Get All Articles

**Response:**
```json
{
  "success": true,
  "message": "Articles in short format retrieved successfully",
  "data": [
    {
      "_id": "article_id",
      "title": "Article Title",
      "subtitle": "Article Subtitle",
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
      "readTime": 8,
      "likes": 25,
      "shares": 10,
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

### 3. Get Article by ID
**GET** `/api/article/:id`

**Response:**
```json
{
  "success": true,
  "message": "Article retrieved successfully",
  "data": {
    "_id": "article_id",
    "title": "Article Title",
    "subtitle": "Article Subtitle",
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
    "readTime": 8,
    "likes": 25,
    "shares": 10,
    "tags": ["tag1", "tag2"],
    "featuredImage": "image_url",
    "isPublished": true,
    "references": [
      {
        "title": "Reference Title",
        "url": "https://example.com/reference",
        "author": "Reference Author",
        "publication": "Publication Name"
      }
    ],
    "seoKeywords": ["keyword1", "keyword2"],
    "seoDescription": "SEO description for the article",
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

### 4. Create Article
**POST** `/api/article`

**Authentication:** Required

**Request Body:**
```json
{
  "category": "category_id",
  "title": "Article Title",
  "subtitle": "Article Subtitle",
  "htmlData": "<p>HTML content...</p>",
  "publishDate": "2024-01-01T00:00:00.000Z",
  "tags": ["tag1", "tag2"],
  "featuredImage": "image_url",
  "isPublished": false,
  "readTime": 8,
  "references": [
    {
      "title": "Reference Title",
      "url": "https://example.com/reference",
      "author": "Reference Author",
      "publication": "Publication Name"
    }
  ],
  "seoKeywords": ["keyword1", "keyword2"],
  "seoDescription": "SEO description for the article"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Article created successfully",
  "data": {
    "_id": "article_id",
    "title": "Article Title",
    "subtitle": "Article Subtitle",
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
    "readTime": 8,
    "likes": 0,
    "shares": 0,
    "tags": ["tag1", "tag2"],
    "featuredImage": "image_url",
    "isPublished": false,
    "references": [
      {
        "title": "Reference Title",
        "url": "https://example.com/reference",
        "author": "Reference Author",
        "publication": "Publication Name"
      }
    ],
    "seoKeywords": ["keyword1", "keyword2"],
    "seoDescription": "SEO description for the article",
    "comments": [],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 5. Update Article
**PUT** `/api/article/:id`

**Authentication:** Required (Author or Admin only)

**Request Body:** Same as Create Article (all fields optional)

**Response:** Same as Create Article

### 6. Delete Article
**DELETE** `/api/article/:id`

**Authentication:** Required (Author or Admin only)

**Response:**
```json
{
  "success": true,
  "message": "Article deleted successfully"
}
```

### 7. Like/Unlike Article
**POST** `/api/article/:id/like`

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "message": "Article liked successfully",
  "data": {
    "likes": 26
  }
}
```

### 8. Share Article
**POST** `/api/article/:id/share`

**Response:**
```json
{
  "success": true,
  "message": "Article shared successfully",
  "data": {
    "shares": 11
  }
}
```

### 9. Add Comment to Article
**POST** `/api/article/:id/comment`

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
  "message": "Not authorized to update this article"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Article not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error fetching articles",
  "error": "Error details"
}
```

## Features

### Article-specific Features:
- **SEO Optimization**: SEO keywords and description fields
- **References**: Academic-style references with title, URL, author, and publication
- **Social Sharing**: Share count tracking
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

## SEO Features

### SEO Keywords
- Array of keywords for search engine optimization
- Maximum 50 characters per keyword
- Used for meta tags and search indexing

### SEO Description
- Meta description for search engines
- Maximum 160 characters
- Used in search result snippets

### References
- Academic-style reference system
- Includes title, URL, author, and publication
- Useful for research articles and academic content 