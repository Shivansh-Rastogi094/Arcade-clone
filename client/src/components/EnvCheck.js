"use client"

import { useEffect } from "react"

const EnvCheck = () => {
  useEffect(() => {
    console.log("🔍 Environment Variables Check:")
    console.log("- NODE_ENV:", process.env.NODE_ENV)
    console.log("- REACT_APP_API_URL:", process.env.REACT_APP_API_URL)

    if (!process.env.REACT_APP_API_URL) {
      console.error("❌ REACT_APP_API_URL is not set!")
    }
  }, [])

  return null
}

export default EnvCheck
