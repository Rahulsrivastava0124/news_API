const News = require("../models/News");
const User = require("../models/User");

// @desc    Get all news with optional filtering
// @access  Public
const getAllNews = async (req, res) => {
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

    // Add published filter if specified, otherwise show all news
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
    const news = await News.find(filter)
      .populate("author", "name email profilePicture")
      .populate("category", "name slug color icon")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select("-htmlData"); // Exclude full HTML content for list view

    // Get total count for pagination
    const total = await News.countDocuments(filter);

    res.json({
      success: true,
      message: "News retrieved successfully",
      data: news,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get news error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching news",
      error: error.message,
    });
  }
};

// @desc    Get news in short format (for viewInshort)
// @access  Public
const getNewsInShort = async (req, res) => {
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

    // Add published filter if specified, otherwise show all news
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
    const news = await News.find(filter)
      .populate("author", "name")
      .populate("category", "name")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select(
        "title subtitle category publishDate author views featuredImage htmlData"
      );

    // Transform data to brief format
    const briefNews = news.map((article) => {
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
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
      };
    });

    // Get total count for pagination
    const total = await News.countDocuments(filter);

    res.json({
      success: true,
      message: "News in short format retrieved successfully",
      data: briefNews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get news in short error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching news in short format",
      error: error.message,
    });
  }
};

// @desc    Get news by ID (view)
// @access  Public
const getNewsById = async (req, res) => {
  try {
    const { id } = req.params;

    const news = await News.findById(id)
      .populate("author", "name email profilePicture")
      .populate("category", "name slug color icon description");

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News article not found",
      });
    }

    // Increment view count
    news.views += 1;
    await news.save();

    res.json({
      success: true,
      message: "News retrieved successfully",
      data: news,
    });
  } catch (error) {
    console.error("Get news by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching news",
      error: error.message,
    });
  }
};

// @desc    Create news article
// @access  Private
const createNews = async (req, res) => {
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
    } = req.body;

    // Validate required fields
    if (!category || !title || !htmlData) {
      return res.status(400).json({
        success: false,
        message: "Category, title, and HTML content are required",
      });
    }

    // Create news article
    const news = new News({
      category,
      title,
      subtitle,
      author: req.user.id, // From auth middleware
      htmlData,
      publishDate: publishDate ? new Date(publishDate) : new Date(),
      tags: tags || [],
      featuredImage,
      isPublished,
    });

    await news.save();

    // Populate author and category details
    await news.populate("author", "name email profilePicture");
    await news.populate("category", "name slug color icon");

    res.status(201).json({
      success: true,
      message: "News article created successfully",
      data: news,
    });
  } catch (error) {
    console.error("Create news error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating news article",
      error: error.message,
    });
  }
};

// @desc    Update news article (edit)
// @access  Private
const updateNews = async (req, res) => {
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
    } = req.body;

    // Find the news article
    const news = await News.findById(id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News article not found",
      });
    }

    // Check if user is the author or admin
    if (news.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this news article",
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

    const updatedNews = await News.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("author", "name email profilePicture")
      .populate("category", "name slug color icon");

    res.json({
      success: true,
      message: "News article updated successfully",
      data: updatedNews,
    });
  } catch (error) {
    console.error("Update news error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating news article",
      error: error.message,
    });
  }
};

// @desc    Delete news article
// @access  Private
const deleteNews = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the news article
    const news = await News.findById(id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News article not found",
      });
    }

    // Check if user is the author or admin
    if (news.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this news article",
      });
    }

    await News.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "News article deleted successfully",
    });
  } catch (error) {
    console.error("Delete news error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting news article",
      error: error.message,
    });
  }
};

module.exports = {
  getAllNews,
  getNewsById,
  getNewsInShort,
  createNews,
  updateNews,
  deleteNews,
};
