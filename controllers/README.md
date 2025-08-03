# News API Documentation

## Overview

The News API provides comprehensive functionality for managing news articles with full CRUD operations, user authentication, and advanced filtering capabilities.

## News Model Schema

```javascript
{
  category: String (required) - One of: politics, technology, sports, entertainment, business, health, science, world, other
  title: String (required) - Max 200 characters
  subtitle: String (optional) - Max 500 characters
  author: ObjectId (required) - References User model
  publishDate: Date (default: current date)
  htmlData: String (required) - HTML content of the article
  isPublished: Boolean (default: false)
  views: Number (default: 0)
  tags: [String] (optional)
  featuredImage: String (optional) - URL to featured image
  timestamps: true
}
```

## API Endpoints

### Public Endpoints

#### 1. Get All Newsnewss 

- **URL:** `GET /api/news`
- **Description:** Retrieve all published news articles with filtering and pagination
- **Query Parameters:**
  - `category` (optional): Filter by category
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
  - `sortBy` (optional): Sort field (default: publishDate)
  - `sortOrder` (optional): asc/desc (default: desc)
  - `search` (optional): Text search in title and subtitle

**Example Request:**

```bash
GET /api/news?category=technology&page=1&limit=5&search=AI
```

**Example Response:**

```json
{
  "success": true,
  "message": "News retrieved successfully",
  "data": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "category": "technology",
      "title": "AI Breakthrough in Healthcare",
      "subtitle": "New AI system improves diagnosis accuracy",
      "author": {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
        "name": "John Doe",
        "email": "john@example.com",
        "profilePicture": "https://example.com/avatar.jpg"
      },
      "publishDate": "2024-01-15T10:30:00.000Z",
      "views": 1250,
      "tags": ["AI", "Healthcare", "Technology"],
      "featuredImage": "https://example.com/image.jpg",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
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

#### 2. Get News in Short Format

- **URL:** `GET /api/news/short`
- **Description:** Retrieve news articles in short format (titles and brief content)
- **Query Parameters:**
  - `category` (optional): Filter by category
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 20)
  - `sortBy` (optional): Sort field (default: publishDate)
  - `sortOrder` (optional): asc/desc (default: desc)

**Example Response:**

```json
{
  "success": true,
  "message": "News in short format retrieved successfully",
  "data": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "title": "AI Breakthrough in Healthcare",
      "subtitle": "New AI system improves diagnosis accuracy",
      "category": "technology",
      "publishDate": "2024-01-15T10:30:00.000Z",
      "author": {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
        "name": "John Doe"
      },
      "views": 1250,
      "shortContent": "A revolutionary AI system has been developed that significantly improves the accuracy of medical diagnoses...",
      "featuredImage": "https://example.com/image.jpg"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 50,
    "itemsPerPage": 20
  }
}
```

#### 3. Get News by ID (View)

- **URL:** `GET /api/news/:id`
- **Description:** Retrieve a specific news article by ID (increments view count)
- **Parameters:**
  - `id`: News article ID

**Example Response:**

```json
{
  "success": true,
  "message": "News retrieved successfully",
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "category": "technology",
    "title": "AI Breakthrough in Healthcare",
    "subtitle": "New AI system improves diagnosis accuracy",
    "author": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
      "name": "John Doe",
      "email": "john@example.com",
      "profilePicture": "https://example.com/avatar.jpg"
    },
    "publishDate": "2024-01-15T10:30:00.000Z",
    "htmlData": "<h1>AI Breakthrough in Healthcare</h1><p>A revolutionary AI system...</p>",
    "views": 1251,
    "tags": ["AI", "Healthcare", "Technology"],
    "featuredImage": "https://example.com/image.jpg",
    "isPublished": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Private Endpoints (Require Authentication)

#### 4. Create News Article

- **URL:** `POST /api/news`
- **Description:** Create a new news article
- **Headers:** `Authorization: Bearer <token>`
- **Body:**

```json
{
  "category": "technology",
  "title": "AI Breakthrough in Healthcare",
  "subtitle": "New AI system improves diagnosis accuracy",
  "htmlData": "<h1>AI Breakthrough in Healthcare</h1><p>A revolutionary AI system...</p>",
  "publishDate": "2024-01-15T10:30:00.000Z",
  "tags": ["AI", "Healthcare", "Technology"],
  "featuredImage": "https://example.com/image.jpg",
  "isPublished": false
}
```

**Example Response:**

```json
{
  "success": true,
  "message": "News article created successfully",
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "category": "technology",
    "title": "AI Breakthrough in Healthcare",
    "subtitle": "New AI system improves diagnosis accuracy",
    "author": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
      "name": "John Doe",
      "email": "john@example.com",
      "profilePicture": "https://example.com/avatar.jpg"
    },
    "htmlData": "<h1>AI Breakthrough in Healthcare</h1><p>A revolutionary AI system...</p>",
    "publishDate": "2024-01-15T10:30:00.000Z",
    "tags": ["AI", "Healthcare", "Technology"],
    "featuredImage": "https://example.com/image.jpg",
    "isPublished": false,
    "views": 0,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### 5. Update News Article (Edit)

- **URL:** `PUT /api/news/:id`
- **Description:** Update an existing news article (only author or admin can edit)
- **Headers:** `Authorization: Bearer <token>`
- **Parameters:**
  - `id`: News article ID
- **Body:** (all fields optional)

```json
{
  "category": "technology",
  "title": "Updated AI Breakthrough in Healthcare",
  "subtitle": "Updated subtitle",
  "htmlData": "<h1>Updated AI Breakthrough in Healthcare</h1><p>Updated content...</p>",
  "publishDate": "2024-01-15T10:30:00.000Z",
  "tags": ["AI", "Healthcare", "Technology", "Updated"],
  "featuredImage": "https://example.com/updated-image.jpg",
  "isPublished": true
}
```

#### 6. Delete News Article

- **URL:** `DELETE /api/news/:id`
- **Description:** Delete a news article (only author or admin can delete)
- **Headers:** `Authorization: Bearer <token>`
- **Parameters:**
  - `id`: News article ID

**Example Response:**

```json
{
  "success": true,
  "message": "News article deleted successfully"
}
```

## Validation Rules

### Create News Validation

- `category`: Required, must be one of the predefined categories
- `title`: Required, 5-200 characters
- `subtitle`: Optional, max 500 characters
- `htmlData`: Required, min 10 characters
- `publishDate`: Optional, must be valid ISO date
- `tags`: Optional, array of strings, each 1-50 characters
- `featuredImage`: Optional, must be valid URL
- `isPublished`: Optional, boolean

### Update News Validation

- All fields are optional
- Same validation rules as create, but all fields are optional

## Error Responses

### Validation Error (400)

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

### Not Found Error (404)

```json
{
  "success": false,
  "message": "News article not found"
}
```

### Unauthorized Error (403)

```json
{
  "success": false,
  "message": "Not authorized to update this news article"
}
```

### Server Error (500)

```json
{
  "success": false,
  "message": "Error creating news article",
  "error": "Detailed error message"
}
```

## Features

1. **User Authentication**: All create, update, and delete operations require authentication
2. **Authorization**: Only the author or admin can edit/delete articles
3. **Pagination**: All list endpoints support pagination
4. **Filtering**: Filter by category, search in title/subtitle
5. **Sorting**: Sort by any field in ascending or descending order
6. **View Tracking**: Automatically increments view count when articles are viewed
7. **Short Content**: Virtual field for brief content preview
8. **Text Search**: Full-text search in title and subtitle fields
9. **Data Validation**: Comprehensive input validation
10. **Error Handling**: Detailed error messages and proper HTTP status codes

## Database Indexes

The News model includes optimized indexes for:

- Category and publish date (for filtering and sorting)
- Author (for user-specific queries)
- Published status and publish date (for public queries)
- Text search on title and subtitle
