const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      maxlength: [50, "Category name cannot exceed 50 characters"],
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      required: [true, "Category slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    color: {
      type: String,
      default: "#3B82F6", // Default blue color
      validate: {
        validator: function (v) {
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
        },
        message: "Color must be a valid hex color code",
      },
    },
    icon: {
      type: String,
      default: "folder", // Default icon
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator is required"],
    },
    newsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
categorySchema.index({ slug: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ createdBy: 1 });
categorySchema.index({ name: "text", description: "text" });

// Virtual for formatted name (capitalize first letter)
categorySchema.virtual("displayName").get(function () {
  return this.name.charAt(0).toUpperCase() + this.name.slice(1);
});

// Ensure virtual fields are serialized
categorySchema.set("toJSON", { virtuals: true });
categorySchema.set("toObject", { virtuals: true });

// Pre-save middleware to generate slug if not provided
categorySchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

// Static method to update news count
categorySchema.statics.updateNewsCount = async function (categoryId) {
  const News = require("./News");
  const count = await News.countDocuments({ category: categoryId });
  await this.findByIdAndUpdate(categoryId, { newsCount: count });
  return count;
};

module.exports = mongoose.model("Category", categorySchema);
