"use client"

import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"

// Configure axios base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000"
axios.defaults.baseURL = API_BASE_URL
axios.defaults.withCredentials = true

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
      const response = await axios.get("/api/auth/me")
      setUser(response.data)
    } catch (error) {
      console.error("Failed to fetch user:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const loginWithGoogle = () => {
    // Use window.location.href to navigate directly to backend
    window.location.href = `${API_BASE_URL}/api/auth/google`
  }

  const logout = async () => {
    try {
      await axios.post("/api/auth/logout")
      setUser(null)
      window.location.href = "/"
    } catch (error) {
      console.error("Logout failed:", error)
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
