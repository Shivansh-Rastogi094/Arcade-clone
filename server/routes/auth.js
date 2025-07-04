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
    // Successful authentication - redirect to frontend dashboard
    console.log("✅ OAuth success, user:", req.user.name)
    console.log("✅ Session ID:", req.sessionID)
    console.log("✅ Session data:", req.session)
    console.log("✅ Redirecting to:", `${process.env.CLIENT_URL}/dashboard`)

    // Set additional headers to help with cookies
    res.header("Access-Control-Allow-Credentials", "true")
    res.header("Access-Control-Allow-Origin", process.env.CLIENT_URL)

    // Use a more explicit redirect
    res.redirect(301, `${process.env.CLIENT_URL}/dashboard`)
  },
)

// Get current user - ENHANCED with debugging
router.get("/me", auth, (req, res) => {
  console.log("🔍 /me endpoint called")
  console.log("  - Session ID:", req.sessionID)
  console.log("  - User:", req.user ? req.user.name : "No user")
  console.log("  - Session:", req.session)
  res.json(req.user)
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
      res.clearCookie("connect.sid")
      res.json({ message: "Logged out successfully" })
    })
  })
})

module.exports = router
