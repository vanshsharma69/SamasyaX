const express = require("express")
const cors = require("cors")
const path = require("path")
const multer = require("multer")

// Import configuration
const connectDB = require("./config/database")
const { uploadsDir } = require("./config/upload")

// Import routes
const authRoutes = require("./routes/auth")
const dashboardRoutes = require("./routes/dashboard")
const projectRoutes = require("./routes/projects")
const issueRoutes = require("./routes/issues")
const userRoutes = require("./routes/users")

const app = express()
const PORT = process.env.PORT || 5000

// Connect to database
connectDB()

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://bug-logger-coral.vercel.app",
      process.env.FRONTEND_URL
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
)

app.options("*", cors())
app.use(express.json())

// Serve uploaded files
app.use("/uploads", express.static(uploadsDir))

// Health check endpoints
app.get("/", (req, res) => {
  res.json({
    message: "SamasyaX API is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    features: ["dark-mode", "image-upload", "user-management", "project-assignment", "client-role"],
  })
})

app.get("/api/test", (req, res) => {
  res.json({
    message: "Backend connection successful!",
    timestamp: new Date().toISOString(),
    headers: req.headers,
  })
})

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() })
})

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/dashboard", dashboardRoutes)
app.use("/api/projects", projectRoutes)
app.use("/api/issues", issueRoutes)
app.use("/api/users", userRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File too large. Maximum size is 5MB." })
    }
  }
  res.status(500).json({ message: "Something went wrong!" })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" })
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log("SamasyaX API is ready!")
  console.log("Environment:", process.env.NODE_ENV || "development")
  console.log("Frontend URL:", process.env.FRONTEND_URL)
  console.log("\nMVC Architecture implemented successfully!")
  console.log("\nRole-based Features:")
  console.log("👑 Admin: Full access - create/delete projects, manage users, delete issues")
  console.log("🔧 Developer: Create/edit issues, view assigned projects")
  console.log("👁️  Client: View only own issues and admin-created issues in assigned projects")
  console.log("\nAvailable endpoints:")
  console.log("GET / - Health check")
  console.log("GET /api/test - Connection test")
  console.log("GET /api/dashboard/stats - Dashboard statistics (role-filtered)")
  console.log("POST /api/auth/register - Register new user")
  console.log("POST /api/auth/login - Login user")
  console.log("GET /api/projects - Get projects (role-filtered)")
  console.log("POST /api/projects - Create new project (Admin only)")
  console.log("DELETE /api/projects/:id - Delete project (Admin only)")
  console.log("GET /api/issues - Get all issues (role-filtered)")
  console.log("GET /api/issues/:projectId - Get issues for project (role-filtered)")
  console.log("POST /api/issues - Create new issue (Admin/Developer only)")
  console.log("PUT /api/issues/:id - Update issue (Admin/Developer only)")
  console.log("DELETE /api/issues/:id - Delete issue (Admin only)")
  console.log("GET /api/users - Get all users (Admin only)")
  console.log("PUT /api/users/:id/assign-projects - Assign projects to user (Admin only)")
  console.log("PUT /api/users/:id/update-role - Update user role (Admin only)")
  console.log("PUT /api/users/:id/toggle-status - Toggle user active status (Admin only)")
  console.log("PUT /api/users/change-password - Change user password")
  console.log("GET /api/users/export/user-data - Export user data (role-filtered)")
})
