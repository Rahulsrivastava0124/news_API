const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: [500, "Subtitle cannot exceed 500 characters"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
    },
    publishDate: {
      type: Date,
      default: Date.now,
    },
    htmlData: {
      type: String,
      required: [true, "HTML content is required"],
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    featuredImage: {
      type: String,
      default: null,
    },
    readTime: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        content: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
blogSchema.index({ category: 1, publishDate: -1 });
blogSchema.index({ author: 1 });
blogSchema.index({ isPublished: 1, publishDate: -1 });
blogSchema.index({ title: "text", subtitle: "text" });

// Virtual for short content (for viewInshort)
blogSchema.virtual("shortContent").get(function () {
  if (!this.htmlData) return "";

  // Remove HTML tags and get first 150 characters
  const textContent = this.htmlData.replace(/<[^>]*>/g, "");
  return textContent.length > 150
    ? textContent.substring(0, 150) + "..."
    : textContent;
});

// Ensure virtual fields are serialized
blogSchema.set("toJSON", { virtuals: true });
blogSchema.set("toObject", { virtuals: true });

// Post-save middleware to update category blog count
blogSchema.post("save", async function () {
  const Category = require("./Category");
  await Category.updateBlogCount(this.category);
});

// Post-remove middleware to update category blog count
blogSchema.post("remove", async function () {
  const Category = require("./Category");
  await Category.updateBlogCount(this.category);
});

module.exports = mongoose.model("Blog", blogSchema); 