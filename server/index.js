const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const helmet = require("helmet")
const session = require("express-session")
const MongoStore = require("connect-mongo")
const passport = require("passport")
const crypto = require("crypto")
const path = require("path")

// Load environment variables FIRST
require("dotenv").config()

// Auto-generate session secret for development if not provided
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(64).toString("hex")

// Debug: Check if environment variables are loaded
console.log("🔍 Environment Variables Check:")
console.log("- GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "✅ Set" : "❌ Missing")
console.log("- GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET ? "✅ Set" : "❌ Missing")
console.log("- MONGODB_URI:", process.env.MONGODB_URI ? "✅ Set" : "❌ Missing")
console.log("- SESSION_SECRET:", process.env.SESSION_SECRET ? "✅ Set" : "🔄 Auto-generated")
console.log("- CLIENT_URL:", process.env.CLIENT_URL || "❌ Missing")

const app = express()

// Trust proxy for Render
app.set("trust proxy", 1)

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable for Google OAuth
    crossOriginEmbedderPolicy: false,
  }),
)

// ENHANCED CORS configuration for Render cross-domain issues
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL,
      "http://localhost:3000",
      "https://localhost:3000",
      "https://arcade-clone-frontend.onrender.com",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  }),
)

// Handle preflight requests
app.options("*", cors())

// Body parsing middleware
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))

// FIXED: Enhanced session configuration for cross-domain
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI || "mongodb://localhost:27017/arcade-clone",
      touchAfter: 24 * 3600, // lazy session update
    }),
    cookie: {
      secure: true, // HTTPS only
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: "none", // Required for cross-domain
    },
    name: "arcade.session", // Custom session name
  }),
)

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Add session debugging middleware
app.use((req, res, next) => {
  console.log("🔍 Session Debug:")
  console.log("  - Session ID:", req.sessionID)
  console.log("  - User ID:", req.user ? req.user._id : "No user")
  console.log("  - Session exists:", !!req.session)
  console.log("  - Cookies:", req.headers.cookie)
  next()
})

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads")
if (!require("fs").existsSync(uploadsDir)) {
  require("fs").mkdirSync(uploadsDir, { recursive: true })
}

// Static files
app.use("/uploads", express.static("uploads"))

// Import routes
const authRoutes = require("./routes/auth")
const tourRoutes = require("./routes/tours")
const uploadRoutes = require("./routes/upload")

// Import passport config AFTER environment variables are loaded
require("./config/passport")

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/tours", tourRoutes)
app.use("/api/upload", uploadRoutes)

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    port: process.env.PORT || 5000,
    session: !!req.session,
    user: !!req.user,
  })
})

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Arcade Clone API",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      tours: "/api/tours",
      upload: "/api/upload",
    },
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack)
  res.status(500).json({ message: "Something went wrong!" })
})

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/arcade-clone", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ MongoDB connection error:", err))

const PORT = process.env.PORT || 5000
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`🌐 API available at: http://localhost:${PORT}`)
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`)
})
