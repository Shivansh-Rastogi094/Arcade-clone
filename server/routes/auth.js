const express = require("express")
const passport = require("passport")
const auth = require("../middleware/auth")

const router = express.Router()

// Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
)

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/login?error=auth_failed`,
  }),
  (req, res) => {
    // Successful authentication
    console.log("✅ OAuth success, user:", req.user.name)
    console.log("✅ Session ID:", req.sessionID)

    // Set CORS headers explicitly
    res.header("Access-Control-Allow-Credentials", "true")
    res.header("Access-Control-Allow-Origin", process.env.CLIENT_URL)

    // Save session before redirect
    req.session.save((err) => {
      if (err) {
        console.error("❌ Session save error:", err)
      } else {
        console.log("✅ Session saved successfully")
      }

      // Redirect to dashboard
      res.redirect(`${process.env.CLIENT_URL}/dashboard`)
    })
  },
)

// Get current user with enhanced debugging
router.get("/me", (req, res) => {
  console.log("🔍 /me endpoint called")
  console.log("  - Session ID:", req.sessionID)
  console.log("  - User:", req.user ? req.user.name : "No user")
  console.log("  - Is authenticated:", req.isAuthenticated())
  console.log("  - Session passport:", req.session.passport)

  if (req.isAuthenticated()) {
    res.json(req.user)
  } else {
    res.status(401).json({ message: "Not authenticated" })
  }
})

// Logout
router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" })
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Session destruction failed" })
      }
      res.clearCookie("arcade.session")
      res.json({ message: "Logged out successfully" })
    })
  })
})

module.exports = router
