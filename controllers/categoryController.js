const Category = require("../models/Category");
const News = require("../models/News");

// @desc    Get total count of categories
// @access  Public
const getCategoriesCount = async (req, res) => {
  try {
    const count = await Category.countDocuments({});
    res.json({
      success: true,
      message: "Total categories count retrieved successfully",
      count,
    });
  } catch (error) {
    console.error("Get categories count error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching categories count",
      error: error.message,
    });
  }
};
// @desc    Get all categories
// @access  Public
const getAllCategories = async (req, res) => {
  try {
    const {
      isActive = true,
      page = 1,
      limit = 50,
      sortBy = "name",
      sortOrder = "asc",
      search,
    } = req.query;

    // Build filter object
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with population
    const categories = await Category.find(filter)
      .populate("createdBy", "name email")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Category.countDocuments(filter);

    res.json({
      success: true,
      message: "Categories retrieved successfully",
      data: categories,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching categories",
      error: error.message,
    });
  }
};

// @desc    Get category by ID
// @access  Public
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id).populate(
      "createdBy",
      "name email profilePicture"
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      message: "Category retrieved successfully",
      data: category,
    });
  } catch (error) {
    console.error("Get category by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching category",
      error: error.message,
    });
  }
};

// @desc    Get category by slug
// @access  Public
const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({ slug }).populate(
      "createdBy",
      "name email profilePicture"
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      message: "Category retrieved successfully",
      data: category,
    });
  } catch (error) {
    console.error("Get category by slug error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching category",
      error: error.message,
    });
  }
};

// @desc    Create category
// @access  Private
const createCategory = async (req, res) => {
  try {
    const { name, description, slug, color, icon, isActive = true } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    // Check if category with same name or slug already exists
    const existingCategory = await Category.findOne({
      $or: [
        { name: name.toLowerCase() },
        { slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-") },
      ],
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category with this name or slug already exists",
      });
    }

    // Create category
    const category = new Category({
      name: name.toLowerCase(),
      description,
      slug,
      color,
      icon,
      isActive,
      createdBy: req.user.id, // From auth middleware
    });

    await category.save();

    // Populate creator details
    await category.populate("createdBy", "name email profilePicture");

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating category",
      error: error.message,
    });
  }
};

// @desc    Update category
// @access  Private
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, slug, color, icon, isActive } = req.body;

    // Find the category
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check if user is the creator or admin
    if (
      category.createdBy.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this category",
      });
    }

    // Check if new name/slug conflicts with existing categories
    if (name || slug) {
      const newName = name || category.name;
      const newSlug = slug || newName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      const existingCategory = await Category.findOne({
        $and: [
          { _id: { $ne: id } },
          { $or: [{ name: newName.toLowerCase() }, { slug: newSlug }] },
        ],
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: "Category with this name or slug already exists",
        });
      }
    }

    // Update fields
    const updateData = {};
    if (name) updateData.name = name.toLowerCase();
    if (description !== undefined) updateData.description = description;
    if (slug) updateData.slug = slug;
    if (color) updateData.color = color;
    if (icon !== undefined) updateData.icon = icon;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedCategory = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("createdBy", "name email profilePicture");

    res.json({
      success: true,
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating category",
      error: error.message,
    });
  }
};

// @desc    Delete category
// @access  Private
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the category
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check if user is the creator or admin
    if (
      category.createdBy.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this category",
      });
    }

    // Check if category has associated news
    const newsCount = await News.countDocuments({ category: id });
    if (newsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It has ${newsCount} associated news articles. Please reassign or delete the news articles first.`,
      });
    }

    await Category.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting category",
      error: error.message,
    });
  }
};

// @desc    Get news by category
// @access  Public
const getNewsByCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      page = 1,
      limit = 10,
      sortBy = "publishDate",
      sortOrder = "desc",
      published,
    } = req.query;

    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter object
    const filter = { category: id };

    // Add published filter if specified
    if (published !== undefined) {
      filter.isPublished = published === "true";
    }

    // Execute query with population
    const news = await News.find(filter)
      .populate("author", "name email profilePicture")
      .populate("category", "name slug color")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await News.countDocuments(filter);

    res.json({
      success: true,
      message: "News by category retrieved successfully",
      data: {
        category,
        news,
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get news by category error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching news by category",
      error: error.message,
    });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  getNewsByCategory,
  getCategoriesCount,
};
