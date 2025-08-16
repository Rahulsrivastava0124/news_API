const Article = require("../models/Article");
const User = require("../models/User");

// @desc    Get total count of articles
// @access  Public
const getArticlesCount = async (req, res) => {
  try {
    const count = await Article.countDocuments({});
    res.json({
      success: true,
      message: "Total articles count retrieved successfully",
      count,
    });
  } catch (error) {
    console.error("Get articles count error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching articles count",
      error: error.message,
    });
  }
};

// @desc    Get all articles with optional filtering
// @access  Public
const getAllArticles = async (req, res) => {
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

    // Add published filter if specified, otherwise show all articles
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
    const articles = await Article.find(filter)
      .populate("author", "name email profilePicture")
      .populate("category", "name slug color icon")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select("-htmlData"); // Exclude full HTML content for list view

    // Get total count for pagination
    const total = await Article.countDocuments(filter);

    res.json({
      success: true,
      message: "Articles retrieved successfully",
      data: articles,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get articles error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching articles",
      error: error.message,
    });
  }
};

// @desc    Get articles in short format (for viewInshort)
// @access  Public
const getArticlesInShort = async (req, res) => {
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

    // Add published filter if specified, otherwise show all articles
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
    const articles = await Article.find(filter)
      .populate("author", "name")
      .populate("category", "name")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select(
        "title subtitle category publishDate author views featuredImage htmlData readTime likes shares"
      );

    // Transform data to brief format
    const briefArticles = articles.map((article) => {
      // Create brief content from HTML data (first 150 characters without HTML tags)
      let briefContent = "";
      if (article.htmlData) {
        const textContent = article.htmlData.replace(/<[^>]*>/g, "");
        briefContent =
          textContent.length > 150
            ? textContent.substring(0, 150) + "..."
            : textContent;
      }

      return {
        _id: article._id,
        title: article.title,
        subtitle: article.subtitle,
        briefContent: briefContent,
        category: article.category,
        author: article.author,
        publishDate: article.publishDate,
        views: article.views,
        featuredImage: article.featuredImage,
        readTime: article.readTime,
        likes: article.likes,
        shares: article.shares,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
      };
    });

    // Get total count for pagination
    const total = await Article.countDocuments(filter);

    res.json({
      success: true,
      message: "Articles in short format retrieved successfully",
      data: briefArticles,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get articles in short error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching articles in short format",
      error: error.message,
    });
  }
};

// @desc    Get article by ID (view)
// @access  Public
const getArticleById = async (req, res) => {
  try {
    const { id } = req.params;

    const article = await Article.findById(id)
      .populate("author", "name email profilePicture")
      .populate("category", "name slug color icon description");

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    // Increment view count
    article.views += 1;
    await article.save();

    res.json({
      success: true,
      message: "Article retrieved successfully",
      data: article,
    });
  } catch (error) {
    console.error("Get article by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching article",
      error: error.message,
    });
  }
};

// @desc    Create article
// @access  Private
const createArticle = async (req, res) => {
  try {
    const {
      category,
      title,
      subtitle,
      htmlData,
      publishDate,
      tags,
      featuredImage,
      isPublished = false,
      readTime,
      references,
      seoKeywords,
      seoDescription,
    } = req.body;

    // Validate required fields
    if (!category || !title || !htmlData) {
      return res.status(400).json({
        success: false,
        message: "Category, title, and HTML content are required",
      });
    }

    // Create article
    const article = new Article({
      category,
      title,
      subtitle,
      author: req.user.id, // From auth middleware
      htmlData,
      publishDate: publishDate ? new Date(publishDate) : new Date(),
      tags: tags || [],
      featuredImage,
      isPublished,
      readTime: readTime || 0,
      references: references || [],
      seoKeywords: seoKeywords || [],
      seoDescription,
    });

    await article.save();

    // Populate author and category details
    await article.populate("author", "name email profilePicture");
    await article.populate("category", "name slug color icon");

    res.status(201).json({
      success: true,
      message: "Article created successfully",
      data: article,
    });
  } catch (error) {
    console.error("Create article error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating article",
      error: error.message,
    });
  }
};

// @desc    Update article (edit)
// @access  Private
const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      category,
      title,
      subtitle,
      htmlData,
      publishDate,
      tags,
      featuredImage,
      isPublished,
      readTime,
      references,
      seoKeywords,
      seoDescription,
    } = req.body;

    // Find the article
    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    // Check if user is the author or admin
    if (article.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this article",
      });
    }

    // Update fields
    const updateData = {};
    if (category) updateData.category = category;
    if (title) updateData.title = title;
    if (subtitle !== undefined) updateData.subtitle = subtitle;
    if (htmlData) updateData.htmlData = htmlData;
    if (publishDate) updateData.publishDate = new Date(publishDate);
    if (tags !== undefined) updateData.tags = tags;
    if (featuredImage !== undefined) updateData.featuredImage = featuredImage;
    if (isPublished !== undefined) updateData.isPublished = isPublished;
    if (readTime !== undefined) updateData.readTime = readTime;
    if (references !== undefined) updateData.references = references;
    if (seoKeywords !== undefined) updateData.seoKeywords = seoKeywords;
    if (seoDescription !== undefined) updateData.seoDescription = seoDescription;

    const updatedArticle = await Article.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("author", "name email profilePicture")
      .populate("category", "name slug color icon");

    res.json({
      success: true,
      message: "Article updated successfully",
      data: updatedArticle,
    });
  } catch (error) {
    console.error("Update article error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating article",
      error: error.message,
    });
  }
};

// @desc    Delete article
// @access  Private
const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the article
    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    // Check if user is the author or admin
    if (article.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this article",
      });
    }

    await Article.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Article deleted successfully",
    });
  } catch (error) {
    console.error("Delete article error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting article",
      error: error.message,
    });
  }
};

// @desc    Like/Unlike article
// @access  Private
const toggleLikeArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    // Check if user already liked the article
    const hasLiked = article.likes > 0; // Simple implementation - you might want to track individual likes

    if (hasLiked) {
      article.likes = Math.max(0, article.likes - 1);
    } else {
      article.likes += 1;
    }

    await article.save();

    res.json({
      success: true,
      message: hasLiked ? "Article unliked successfully" : "Article liked successfully",
      data: { likes: article.likes },
    });
  } catch (error) {
    console.error("Toggle like article error:", error);
    res.status(500).json({
      success: false,
      message: "Error toggling like",
      error: error.message,
    });
  }
};

// @desc    Share article
// @access  Public
const shareArticle = async (req, res) => {
  try {
    const { id } = req.params;

    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    // Increment share count
    article.shares += 1;
    await article.save();

    res.json({
      success: true,
      message: "Article shared successfully",
      data: { shares: article.shares },
    });
  } catch (error) {
    console.error("Share article error:", error);
    res.status(500).json({
      success: false,
      message: "Error sharing article",
      error: error.message,
    });
  }
};

// @desc    Add comment to article
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

    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    article.comments.push({
      user: req.user.id,
      content,
    });

    await article.save();

    // Populate the new comment with user details
    await article.populate("comments.user", "name email profilePicture");

    res.json({
      success: true,
      message: "Comment added successfully",
      data: article.comments[article.comments.length - 1],
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

module.exports = {
  getAllArticles,
  getArticleById,
  getArticlesInShort,
  createArticle,
  updateArticle,
  deleteArticle,
  toggleLikeArticle,
  shareArticle,
  addComment,
  getArticlesCount,
}; 