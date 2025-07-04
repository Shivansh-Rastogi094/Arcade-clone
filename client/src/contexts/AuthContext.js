"use client"

import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"

// Your backend URL
const API_BASE_URL = "https://arcade-clone-backend.onrender.com"

// Configure axios with enhanced cookie handling
axios.defaults.baseURL = API_BASE_URL
axios.defaults.withCredentials = true
axios.defaults.headers.common["Content-Type"] = "application/json"

// Add detailed logging
axios.interceptors.request.use(
  (config) => {
    console.log("🔍 Making API request:")
    console.log("  - Method:", config.method?.toUpperCase())
    console.log("  - URL:", `${config.baseURL}${config.url}`)
    console.log("  - With credentials:", config.withCredentials)
    console.log("  - Headers:", config.headers)
    return config
  },
  (error) => {
    console.error("❌ Request setup error:", error)
    return Promise.reject(error)
  },
)

axios.interceptors.response.use(
  (response) => {
    console.log("✅ API success:", response.status, response.config.url)
    return response
  },
  (error) => {
    console.error("❌ API error details:")
    console.error("  - Status:", error.response?.status)
    console.error("  - URL:", error.config?.url)
    console.error("  - With credentials:", error.config?.withCredentials)
    console.error("  - Response headers:", error.response?.headers)
    console.error("  - Error:", error.response?.data || error.message)
    return Promise.reject(error)
  },
)

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log("🔍 AuthProvider mounted, API_BASE_URL:", API_BASE_URL)
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      console.log("🔍 Attempting to fetch user...")

      // ENHANCED: Try with explicit credentials
      const response = await axios.get("/api/auth/me", {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("✅ User fetched successfully:", response.data)
      setUser(response.data)
    } catch (error) {
      console.error("❌ Failed to fetch user")
      console.error("  - Status:", error.response?.status)
      console.error("  - This is normal if user is not logged in")
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const loginWithGoogle = () => {
    const googleAuthUrl = `${API_BASE_URL}/api/auth/google`
    console.log("🔗 Redirecting to Google OAuth:", googleAuthUrl)
    window.location.href = googleAuthUrl
  }

  const logout = async () => {
    try {
      await axios.post(
        "/api/auth/logout",
        {},
        {
          withCredentials: true,
        },
      )
      setUser(null)
      window.location.href = "/"
    } catch (error) {
      console.error("❌ Logout failed:", error)
    }
  }

  const value = {
    user,
    loginWithGoogle,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
