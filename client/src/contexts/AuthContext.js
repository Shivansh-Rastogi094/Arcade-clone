"use client"

import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"

// Replace with your actual backend URL from Render
const API_BASE_URL = process.env.REACT_APP_API_URL || "https://your-backend-service-name.onrender.com"

// Configure axios base URL and credentials
axios.defaults.baseURL = API_BASE_URL
axios.defaults.withCredentials = true

// Add request interceptor for debugging
axios.interceptors.request.use(
  (config) => {
    console.log("🔍 API Request:", config.method?.toUpperCase(), config.url)
    return config
  },
  (error) => {
    console.error("❌ Request Error:", error)
    return Promise.reject(error)
  },
)

// Add response interceptor for debugging
axios.interceptors.response.use(
  (response) => {
    console.log("✅ API Response:", response.status, response.config.url)
    return response
  },
  (error) => {
    console.error("❌ API Error:", error.response?.status, error.config?.url, error.response?.data)
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
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      console.log("🔍 Fetching user from:", `${API_BASE_URL}/api/auth/me`)
      const response = await axios.get("/api/auth/me")
      console.log("✅ User fetched:", response.data)
      setUser(response.data)
    } catch (error) {
      console.error("❌ Failed to fetch user:", error.response?.status, error.response?.data)
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
      await axios.post("/api/auth/logout")
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
