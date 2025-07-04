"use client"

import { useState, useEffect } from "react"

const SimpleDebug = () => {
  const [results, setResults] = useState({})

  useEffect(() => {
    runTests()
  }, [])

  const runTests = async () => {
    // FIXED: Use HTTPS for backend URL
    const backendUrl = "https://arcade-clone-backend.onrender.com"

    console.log("🔍 Testing backend URL:", backendUrl)

    // Test 1: Basic fetch to health endpoint
    try {
      const response = await fetch(`${backendUrl}/api/health`)
      const data = await response.json()
      setResults((prev) => ({
        ...prev,
        health: { success: true, status: response.status, data },
      }))
      console.log("✅ Health check success:", data)
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        health: { success: false, error: error.message },
      }))
      console.error("❌ Health check failed:", error)
    }

    // Test 2: Basic fetch to root
    try {
      const response = await fetch(`${backendUrl}/`)
      const data = await response.json()
      setResults((prev) => ({
        ...prev,
        root: { success: true, status: response.status, data },
      }))
      console.log("✅ Root endpoint success:", data)
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        root: { success: false, error: error.message },
      }))
      console.error("❌ Root endpoint failed:", error)
    }

    // Test 3: Test with credentials
    try {
      const response = await fetch(`${backendUrl}/api/auth/me`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })
      const data = await response.json()
      setResults((prev) => ({
        ...prev,
        auth: { success: true, status: response.status, data },
      }))
      console.log("✅ Auth check success:", data)
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        auth: { success: false, error: error.message },
      }))
      console.error("❌ Auth check failed:", error)
    }
  }

  return (
    <div className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-md z-50">
      <h3 className="font-bold mb-4">Backend Debug Results</h3>
      <div className="space-y-2 text-sm">
        {Object.entries(results).map(([test, result]) => (
          <div key={test} className={`p-2 rounded ${result.success ? "bg-green-100" : "bg-red-100"}`}>
            <strong>{test}:</strong>
            <br />
            {result.success ? (
              <span className="text-green-700">✅ Status: {result.status}</span>
            ) : (
              <span className="text-red-700">❌ Error: {result.error}</span>
            )}
          </div>
        ))}
      </div>
      <button onClick={runTests} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded w-full">
        Run Tests Again
      </button>
    </div>
  )
}

export default SimpleDebug
