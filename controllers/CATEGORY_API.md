# Category API Documentation

## Overview

The Category API provides comprehensive functionality for managing news categories with full CRUD operations, user authentication, and integration with news articles.

## Category Model Schema

```javascript
{
  name: String (required) - Max 50 characters, unique
  description: String (optional) - Max 200 characters
  slug: String (required) - Unique, lowercase, URL-friendly
  color: String (optional) - Hex color code, default: #3B82F6
  icon: String (optional) - Icon name, default: "folder"
  isActive: Boolean (default: true)
  createdBy: ObjectId (required) - References User model
  newsCount: Number (default: 0) - Auto-updated count of associated news
  timestamps: true
}
```

## API Endpoints

### Public Endpoints

#### 1. Get All Categories

- **URL:** `GET /api/categories`
- **Description:** Retrieve all categories with filtering and pagination
- **Query Parameters:**
  - `isActive` (optional): Filter by active status (true/false)
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 50)
  - `sortBy` (optional): Sort field (default: name)
  - `sortOrder` (optional): asc/desc (default: asc)
  - `search` (optional): Text search in name and description

**Example Request:**

```bash
GET /api/categories?isActive=true&page=1&limit=10&search=technology
```

**Example Response:**

```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "name": "technology",
      "displayName": "Technology",
      "description": "Latest technology news and updates",
      "slug": "technology",
      "color": "#3B82F6",
      "icon": "laptop",
      "isActive": true,
      "newsCount": 25,
      "createdBy": {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 25,
    "itemsPerPage": 10
  }
}
```

#### 2. Get Category by ID

- **URL:** `GET /api/categories/:id`
- **Description:** Retrieve a specific category by ID
- **Parameters:**
  - `id`: Category ID

**Example Response:**

```json
{
  "success": true,
  "message": "Category retrieved successfully",
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "technology",
    "displayName": "Technology",
    "description": "Latest technology news and updates",
    "slug": "technology",
    "color": "#3B82F6",
    "icon": "laptop",
    "isActive": true,
    "newsCount": 25,
    "createdBy": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
      "name": "John Doe",
      "email": "john@example.com",
      "profilePicture": "https://example.com/avatar.jpg"
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### 3. Get Category by Slug

- **URL:** `GET /api/categories/slug/:slug`
- **Description:** Retrieve a specific category by slug
- **Parameters:**
  - `slug`: Category slug

**Example Response:**

```json
{
  "success": true,
  "message": "Category retrieved successfully",
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "technology",
    "displayName": "Technology",
    "description": "Latest technology news and updates",
    "slug": "technology",
    "color": "#3B82F6",
    "icon": "laptop",
    "isActive": true,
    "newsCount": 25,
    "createdBy": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
      "name": "John Doe",
      "email": "john@example.com",
      "profilePicture": "https://example.com/avatar.jpg"
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### 4. Get News by Category

- **URL:** `GET /api/categories/:id/news`
- **Description:** Retrieve all news articles for a specific category
- **Parameters:**
  - `id`:
- **Query Parameters:**
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
  - `sortBy` (optional): Sort field (default: publishDate)
  - `sortOrder` (optional): asc/desc (default: desc)

**Example Response:**

```json
{
  "success": true,
  "message": "News by category retrieved successfully",
  "data": {
    "category": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "name": "technology",
      "displayName": "Technology",
      "description": "Latest technology news and updates",
      "slug": "technology",
      "color": "#3B82F6",
      "icon": "laptop",
      "isActive": true,
      "newsCount": 25
    },
    "news": [
      {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b5",
        "title": "AI Breakthrough in Healthcare",
        "subtitle": "New AI system improves diagnosis accuracy",
        "author": {
          "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
          "name": "John Doe",
          "email": "john@example.com",
          "profilePicture": "https://example.com/avatar.jpg"
        },
        "category": {
          "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
          "name": "technology",
          "slug": "technology",
          "color": "#3B82F6",
          "icon": "laptop"
        },
        "publishDate": "2024-01-15T10:30:00.000Z",
        "views": 1250,
        "tags": ["AI", "Healthcare", "Technology"],
        "featuredImage": "https://example.com/image.jpg"
      }
    ]
  },
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 25,
    "itemsPerPage": 10
  }
}
```

### Private Endpoints (Require Authentication)

#### 5. Create Category

- **URL:** `POST /api/categories`
- **Description:** Create a new category
- **Headers:** `Authorization: Bearer <token>`
- **Body:**

```json
{
  "name": "Technology",
  "description": "Latest technology news and updates",
  "slug": "technology",
  "color": "#3B82F6",
  "icon": "laptop",
  "isActive": true
}
```

**Example Response:**

```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "technology",
    "displayName": "Technology",
    "description": "Latest technology news and updates",
    "slug": "technology",
    "color": "#3B82F6",
    "icon": "laptop",
    "isActive": true,
    "newsCount": 0,
    "createdBy": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
      "name": "John Doe",
      "email": "john@example.com",
      "profilePicture": "https://example.com/avatar.jpg"
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### 6. Update Category

- **URL:** `PUT /api/categories/:id`
- **Description:** Update an existing category (only creator or admin can edit)
- **Headers:** `Authorization: Bearer <token>`
- **Parameters:**
  - `id`: Category ID
- **Body:** (all fields optional)

```json
{
  "name": "Updated Technology",
  "description": "Updated technology news and updates",
  "slug": "updated-technology",
  "color": "#10B981",
  "icon": "computer",
  "isActive": true
}
```

#### 7. Delete Category

- **URL:** `DELETE /api/categories/:id`
- **Description:** Delete a category (only creator or admin can delete, must have no associated news)
- **Headers:** `Authorization: Bearer <token>`
- **Parameters:**
  - `id`: Category ID

**Example Response:**

```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

## Validation Rules

### Create Category Validation

- `name`: Required, 2-50 characters, letters/numbers/spaces only
- `description`: Optional, max 200 characters
- `slug`: Optional, 2-50 characters, lowercase letters/numbers/hyphens only
- `color`: Optional, valid hex color code
- `icon`: Optional, max 50 characters
- `isActive`: Optional, boolean

### Update Category Validation

- All fields are optional
- Same validation rules as create

## Error Responses

### Validation Error (400)

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Category name must be between 2 and 50 characters"
    }
  ]
}
```

### Not Found Error (404)

```json
{
  "success": false,
  "message": "Category not found"
}
```

### Unauthorized Error (403)

```json
{
  "success": false,
  "message": "Not authorized to update this category"
}
```

### Conflict Error (400) - Cannot Delete

```json
{
  "success": false,
  "message": "Cannot delete category. It has 5 associated news articles. Please reassign or delete the news articles first."
}
```

### Server Error (500)

```json
{
  "success": false,
  "message": "Error creating category",
  "error": "Detailed error message"
}
```

## Features

1. **User Authentication**: All create, update, and delete operations require authentication
2. **Authorization**: Only the creator or admin can edit/delete categories
3. **Pagination**: All list endpoints support pagination
4. **Filtering**: Filter by active status, search in name and description
5. **Sorting**: Sort by any field in ascending or descending order
6. **Auto Slug Generation**: Automatically generates URL-friendly slugs
7. **News Count Tracking**: Automatically tracks and updates news count
8. **Color and Icon Support**: Customizable colors and icons for UI
9. **Slug-based Access**: Access categories by slug for SEO-friendly URLs
10. **News Integration**: Get all news articles for a specific category
11. **Data Validation**: Comprehensive input validation
12. **Error Handling**: Detailed error messages and proper HTTP status codes

## Database Indexes

The Category model includes optimized indexes for:

- Slug (for fast slug-based lookups)
- Active status (for filtering active categories)
- Creator (for user-specific queries)
- Text search on name and description

## Integration with News

- Categories are referenced by ObjectId in news articles
- News count is automatically updated when news articles are created/deleted
- Categories cannot be deleted if they have associated news articles
- News queries automatically populate category information
- Category-based news filtering is supported

## Usage Examples

### Creating a Category

```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sports",
    "description": "Latest sports news and updates",
    "color": "#EF4444",
    "icon": "football"
  }'
```

### Getting News by Category

```bash
curl -X GET "http://localhost:3000/api/categories/CATEGORY_ID/news?page=1&limit=5"
```

### Updating a Category

```bash
curl -X PUT http://localhost:3000/api/categories/CATEGORY_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "color": "#8B5CF6",
    "icon": "basketball"
  }'
```
