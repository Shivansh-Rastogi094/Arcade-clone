const passport = require("passport")
const GoogleStrategy = require("passport-google-oauth20").Strategy
const User = require("../models/User")

// Check if required environment variables are present
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error("❌ Missing Google OAuth credentials!")
  console.error("Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file")
  process.exit(1)
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("🔍 Google OAuth callback received for user:", profile.displayName)

        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id })

        if (user) {
          console.log("✅ Existing user found:", user.email)
          return done(null, user)
        }

        // Create new user
        user = new User({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile.photos[0].value,
        })

        await user.save()
        console.log("✅ New user created:", user.email)
        done(null, user)
      } catch (error) {
        console.error("❌ Error in Google OAuth callback:", error)
        done(error, null)
      }
    },
  ),
)

passport.serializeUser((user, done) => {
  done(null, user._id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id)
    done(null, user)
  } catch (error) {
    done(error, null)
  }
})

console.log("✅ Passport Google OAuth strategy configured")
