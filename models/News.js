const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema(
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
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
newsSchema.index({ category: 1, publishDate: -1 });
newsSchema.index({ author: 1 });
newsSchema.index({ isPublished: 1, publishDate: -1 });
newsSchema.index({ title: "text", subtitle: "text" });

// Virtual for short content (for viewInshort)
newsSchema.virtual("shortContent").get(function () {
  if (!this.htmlData) return "";

  // Remove HTML tags and get first 150 characters
  const textContent = this.htmlData.replace(/<[^>]*>/g, "");
  return textContent.length > 150
    ? textContent.substring(0, 150) + "..."
    : textContent;
});

// Ensure virtual fields are serialized
newsSchema.set("toJSON", { virtuals: true });
newsSchema.set("toObject", { virtuals: true });

// Post-save middleware to update category news count
newsSchema.post("save", async function () {
  const Category = require("./Category");
  await Category.updateNewsCount(this.category);
});

// Post-remove middleware to update category news count
newsSchema.post("remove", async function () {
  const Category = require("./Category");
  await Category.updateNewsCount(this.category);
});

module.exports = mongoose.model("News", newsSchema);
