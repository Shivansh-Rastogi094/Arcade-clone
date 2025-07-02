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

// CORS configuration for production
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000", // For development
  "https://localhost:3000",
  "https://arcade-clone-p0u0.onrender.com"// For development with HTTPS
]

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true)

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        console.log("❌ CORS blocked origin:", origin)
        callback(new Error("Not allowed by CORS"))
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

// Body parsing middleware
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))

// Session configuration
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI || "mongodb://localhost:27017/arcade-clone",
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  }),
)

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

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
