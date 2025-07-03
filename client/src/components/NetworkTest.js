"use client"

import { useState } from "react"
import axios from "axios"

const NetworkTest = () => {
  const [testResults, setTestResults] = useState({})
  const [testing, setTesting] = useState(false)

  const runTests = async () => {
    setTesting(true)
    const results = {}

    // Test 1: Health check
    try {
      const response = await axios.get("/api/health")
      results.health = { success: true, data: response.data }
    } catch (error) {
      results.health = { success: false, error: error.message, status: error.response?.status }
    }

    // Test 2: Auth check
    try {
      const response = await axios.get("/api/auth/me")
      results.auth = { success: true, data: response.data }
    } catch (error) {
      results.auth = { success: false, error: error.message, status: error.response?.status }
    }

    // Test 3: Tours check
    try {
      const response = await axios.get("/api/tours")
      results.tours = { success: true, data: response.data }
    } catch (error) {
      results.tours = { success: false, error: error.message, status: error.response?.status }
    }

    setTestResults(results)
    setTesting(false)
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-md">
      <h3 className="font-bold mb-2">Network Debug</h3>
      <button
        onClick={runTests}
        disabled={testing}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4 disabled:opacity-50"
      >
        {testing ? "Testing..." : "Run API Tests"}
      </button>

      {Object.keys(testResults).length > 0 && (
        <div className="space-y-2 text-sm">
          {Object.entries(testResults).map(([test, result]) => (
            <div key={test} className={`p-2 rounded ${result.success ? "bg-green-100" : "bg-red-100"}`}>
              <strong>{test}:</strong> {result.success ? "✅ Success" : `❌ ${result.error} (${result.status})`}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default NetworkTest
