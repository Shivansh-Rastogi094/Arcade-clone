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
    res.redirect(`${process.env.CLIENT_URL}/dashboard`)
  },
)

// Get current user
router.get("/me", auth, (req, res) => {
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
