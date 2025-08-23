const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config({ path: "./config.env" });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// MongoDB Connection
// mongodb://newApi:NewsApi@147.93.110.206:27017 //main api

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/news_api")
  .then(() => {
    console.log("✅ Connected to MongoDB successfully");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Basic route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to News API",
    status: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Health check route
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    database:
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    timestamp: new Date().toISOString(),
  });
});

// Import routes
const newsRoutes = require("./routes/news");
const authRoutes = require("./routes/auth");
const categoryRoutes = require("./routes/category");
const blogRoutes = require("./routes/blog");
const articleRoutes = require("./routes/article");

// Use routes
app.use("/api/news", newsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/article", articleRoutes);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
});

module.exports = app;
