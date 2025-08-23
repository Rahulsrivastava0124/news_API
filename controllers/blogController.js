const Blog = require("../models/Blog");
const User = require("../models/User");
const BlobHandler = require("../utils/blobHandler");

// @desc    Get total count of blogs
// @access  Public
const getBlogsCount = async (req, res) => {
  try {
    const count = await Blog.countDocuments({});
    res.json({
      success: true,
      message: "Total blogs count retrieved successfully",
      count,
    });
  } catch (error) {
    console.error("Get blogs count error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching blogs count",
      error: error.message,
    });
  }
};

// @desc    Get all blogs with optional filtering
// @access  Public
const getAllBlogs = async (req, res) => {
  try {
    const {
      category,
      page = 1,
      limit = 10,
      sortBy = "publishDate",
      sortOrder = "desc",
      search,
      published,
    } = req.query;

    // Build filter object
    const filter = {};

    // Add published filter if specified, otherwise show all blogs
    if (published !== undefined) {
      filter.isPublished = published === "true";
    }

    if (category) filter.category = category;
    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with population
    const blogs = await Blog.find(filter)
      .populate("author", "name email profilePicture")
      .populate("category", "name slug color icon")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select("-htmlData"); // Exclude full HTML content for list view

    // Get total count for pagination
    const total = await Blog.countDocuments(filter);

    res.json({
      success: true,
      message: "Blogs retrieved successfully",
      data: blogs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get blogs error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching blogs",
      error: error.message,
    });
  }
};

// @desc    Get blogs in short format (for viewInshort)
// @access  Public
const getBlogsInShort = async (req, res) => {
  try {
    const {
      category,
      page = 1,
      limit = 20,
      sortBy = "publishDate",
      sortOrder = "desc",
      published,
    } = req.query;

    // Build filter object
    const filter = {};

    // Add published filter if specified, otherwise show all blogs
    if (published !== undefined) {
      filter.isPublished = published === "true";
    }

    if (category) filter.category = category;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with minimal population for brief view
    const blogs = await Blog.find(filter)
      .populate("author", "name")
      .populate("category", "name")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select(
        "title subtitle category publishDate author views featuredImage htmlData readTime likes"
      );

    // Transform data to brief format
    const briefBlogs = blogs.map((blog) => {
      // Create brief content from HTML data (first 150 characters without HTML tags)
      let briefContent = "";
      if (blog.htmlData) {
        const textContent = blog.htmlData.replace(/<[^>]*>/g, "");
        briefContent =
          textContent.length > 150
            ? textContent.substring(0, 150) + "..."
            : textContent;
      }

      return {
        _id: blog._id,
        title: blog.title,
        subtitle: blog.subtitle,
        briefContent: briefContent,
        category: blog.category,
        author: blog.author,
        publishDate: blog.publishDate,
        views: blog.views,
        featuredImage: blog.featuredImage,
        readTime: blog.readTime,
        likes: blog.likes,
        createdAt: blog.createdAt,
        updatedAt: blog.updatedAt,
      };
    });

    // Get total count for pagination
    const total = await Blog.countDocuments(filter);

    res.json({
      success: true,
      message: "Blogs in short format retrieved successfully",
      data: briefBlogs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get blogs in short error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching blogs in short format",
      error: error.message,
    });
  }
};

// @desc    Get blog by ID (view)
// @access  Public
const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id)
      .populate("author", "name email profilePicture")
      .populate("category", "name slug color icon description");

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    // Increment view count
    blog.views += 1;
    await blog.save();

    res.json({
      success: true,
      message: "Blog retrieved successfully",
      data: blog,
    });
  } catch (error) {
    console.error("Get blog by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching blog",
      error: error.message,
    });
  }
};

// @desc    Create blog post
// @access  Private
const createBlog = async (req, res) => {
  try {
    const {
      category,
      title,
      subtitle,
      htmlData,
      publishDate,
      tags,
      isPublished = false,
      readTime,
    } = req.body;

    // Validate required fields
    if (!category || !title || !htmlData) {
      return res.status(400).json({
        success: false,
        message: "Category, title, and HTML content are required",
      });
    }

    // Handle featured image upload
    let featuredImageData = null;
    
    // Check if image is uploaded as file
    if (req.file) {
      // Validate file
      BlobHandler.validateFileSize(req.file, 10 * 1024 * 1024); // 10MB limit
      BlobHandler.validateFileType(req.file, ['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

      // Convert to blob data
      const blobData = BlobHandler.fileToBlob(req.file);
      featuredImageData = {
        data: blobData.data,
        contentType: blobData.contentType,
        originalName: blobData.originalName,
        size: blobData.size,
        uploadedAt: blobData.uploadedAt
      };
    }
    // Check if featuredImage is provided in request body
    else if (req.body.featuredImage) {
      const { featuredImage } = req.body;
      
      // Handle different formats of featuredImage
      if (featuredImage.data) {
        // If it's already in blob format
        featuredImageData = {
          data: Buffer.from(featuredImage.data, 'base64'),
          contentType: featuredImage.contentType || 'image/jpeg',
          originalName: featuredImage.originalName || 'image.jpg',
          size: featuredImage.size || 0,
          uploadedAt: featuredImage.uploadedAt || new Date()
        };
      } else if (featuredImage.objectURL) {
        // If it's a blob URL, we'll need to handle this on frontend
        // For now, we'll store the URL as a string
        featuredImageData = {
          data: null,
          contentType: 'application/octet-stream',
          originalName: 'blob-url',
          size: 0,
          uploadedAt: new Date(),
          objectURL: featuredImage.objectURL
        };
      } else if (typeof featuredImage === 'string') {
        // If it's a base64 string
        featuredImageData = {
          data: Buffer.from(featuredImage, 'base64'),
          contentType: 'image/jpeg',
          originalName: 'image.jpg',
          size: Buffer.from(featuredImage, 'base64').length,
          uploadedAt: new Date()
        };
      }
    }

    // Create blog post
    const blog = new Blog({
      category,
      title,
      subtitle,
      author: req.user.id, // From auth middleware
      htmlData,
      publishDate: publishDate ? new Date(publishDate) : new Date(),
      tags: tags || [],
      featuredImage: featuredImageData,
      isPublished,
      readTime: readTime || 0,
    });

    await blog.save();

    // Populate author and category details
    await blog.populate("author", "name email profilePicture");
    await blog.populate("category", "name slug color icon");

    // Convert featured image to base64 for response
    const responseData = {
      ...blog.toObject(),
      featuredImage: blog.featuredImage && blog.featuredImage.data ? {
        ...blog.featuredImage,
        data: blog.featuredImage.data.toString('base64'),
        url: `/api/blog/${blog._id}/featured-image`
      } : null
    };

    res.status(201).json({
      success: true,
      message: "Blog post created successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("Create blog error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating blog post",
      error: error.message,
    });
  }
};

// @desc    Update blog post (edit)
// @access  Private
const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      category,
      title,
      subtitle,
      htmlData,
      publishDate,
      tags,
      isPublished,
      readTime,
    } = req.body;

    // Find the blog post
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    // Check if user is the author or admin
    if (blog.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this blog post",
      });
    }

    // Handle featured image upload
    let featuredImageData = blog.featuredImage; // Keep existing if no new upload
    
    // Check if image is uploaded as file
    if (req.file) {
      // Validate file
      BlobHandler.validateFileSize(req.file, 10 * 1024 * 1024); // 10MB limit
      BlobHandler.validateFileType(req.file, ['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

      // Convert to blob data
      const blobData = BlobHandler.fileToBlob(req.file);
      featuredImageData = {
        data: blobData.data,
        contentType: blobData.contentType,
        originalName: blobData.originalName,
        size: blobData.size,
        uploadedAt: blobData.uploadedAt
      };
    }
    // Check if featuredImage is provided in request body
    else if (req.body.featuredImage) {
      const { featuredImage } = req.body;
      
      // Handle different formats of featuredImage
      if (featuredImage.data) {
        // If it's already in blob format
        featuredImageData = {
          data: Buffer.from(featuredImage.data, 'base64'),
          contentType: featuredImage.contentType || 'image/jpeg',
          originalName: featuredImage.originalName || 'image.jpg',
          size: featuredImage.size || 0,
          uploadedAt: featuredImage.uploadedAt || new Date()
        };
      } else if (featuredImage.objectURL) {
        // If it's a blob URL, we'll need to handle this on frontend
        // For now, we'll store the URL as a string
        featuredImageData = {
          data: null,
          contentType: 'application/octet-stream',
          originalName: 'blob-url',
          size: 0,
          uploadedAt: new Date(),
          objectURL: featuredImage.objectURL
        };
      } else if (typeof featuredImage === 'string') {
        // If it's a base64 string
        featuredImageData = {
          data: Buffer.from(featuredImage, 'base64'),
          contentType: 'image/jpeg',
          originalName: 'image.jpg',
          size: Buffer.from(featuredImage, 'base64').length,
          uploadedAt: new Date()
        };
      }
    }

    // Update fields
    const updateData = {};
    if (category) updateData.category = category;
    if (title) updateData.title = title;
    if (subtitle !== undefined) updateData.subtitle = subtitle;
    if (htmlData) updateData.htmlData = htmlData;
    if (publishDate) updateData.publishDate = new Date(publishDate);
    if (tags !== undefined) updateData.tags = tags;
    if (featuredImageData) updateData.featuredImage = featuredImageData;
    if (isPublished !== undefined) updateData.isPublished = isPublished;
    if (readTime !== undefined) updateData.readTime = readTime;

    const updatedBlog = await Blog.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("author", "name email profilePicture")
      .populate("category", "name slug color icon");

    // Convert featured image to base64 for response
    const responseData = {
      ...updatedBlog.toObject(),
      featuredImage: updatedBlog.featuredImage && updatedBlog.featuredImage.data ? {
        ...updatedBlog.featuredImage,
        data: updatedBlog.featuredImage.data.toString('base64'),
        url: `/api/blog/${updatedBlog._id}/featured-image`
      } : null
    };

    res.json({
      success: true,
      message: "Blog post updated successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("Update blog error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating blog post",
      error: error.message,
    });
  }
};

// @desc    Delete blog post
// @access  Private
const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the blog post
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    // Check if user is the author or admin
    if (blog.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this blog post",
      });
    }

    await Blog.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Blog post deleted successfully",
    });
  } catch (error) {
    console.error("Delete blog error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting blog post",
      error: error.message,
    });
  }
};

// @desc    Like/Unlike blog post
// @access  Private
const toggleLikeBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    // Check if user already liked the blog
    const hasLiked = blog.likes > 0; // Simple implementation - you might want to track individual likes

    if (hasLiked) {
      blog.likes = Math.max(0, blog.likes - 1);
    } else {
      blog.likes += 1;
    }

    await blog.save();

    res.json({
      success: true,
      message: hasLiked ? "Blog unliked successfully" : "Blog liked successfully",
      data: { likes: blog.likes },
    });
  } catch (error) {
    console.error("Toggle like blog error:", error);
    res.status(500).json({
      success: false,
      message: "Error toggling like",
      error: error.message,
    });
  }
};

// @desc    Add comment to blog post
// @access  Private
const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required",
      });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    blog.comments.push({
      user: req.user.id,
      content,
    });

    await blog.save();

    // Populate the new comment with user details
    await blog.populate("comments.user", "name email profilePicture");

    res.json({
      success: true,
      message: "Comment added successfully",
      data: blog.comments[blog.comments.length - 1],
    });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({
      success: false,
      message: "Error adding comment",
      error: error.message,
    });
  }
};

// @desc    Get blog featured image
// @access  Public
const getBlogFeaturedImage = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id).select('featuredImage');
    
    if (!blog || !blog.featuredImage || !blog.featuredImage.data) {
      return res.status(404).json({
        success: false,
        message: 'Featured image not found'
      });
    }

    // Set appropriate headers
    res.set({
      'Content-Type': blog.featuredImage.contentType,
      'Content-Disposition': `inline; filename="${blog.featuredImage.originalName}"`,
      'Content-Length': blog.featuredImage.size
    });

    // Send the blob data
    res.send(blog.featuredImage.data);
  } catch (error) {
    console.error('Get blog featured image error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving featured image',
      error: error.message
    });
  }
};

module.exports = {
  getAllBlogs,
  getBlogById,
  getBlogsInShort,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleLikeBlog,
  addComment,
  getBlogsCount,
  getBlogFeaturedImage,
}; 