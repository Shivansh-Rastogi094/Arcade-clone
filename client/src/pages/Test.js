"use client"

import { useState, useEffect } from "react"

const Test = () => {
  const [apiTest, setApiTest] = useState("Testing...")

  useEffect(() => {
    testAPI()
  }, [])

  const testAPI = async () => {
    try {
      const response = await fetch("https://arcade-clone-backend.onrender.com/api/health")
      const data = await response.json()
      setApiTest(`✅ API Working: ${data.message}`)
    } catch (error) {
      setApiTest(`❌ API Failed: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Frontend Test Page</h1>
        <div className="space-y-4">
          <div>
            <strong>Frontend Status:</strong> ✅ Working
          </div>
          <div>
            <strong>API Status:</strong> {apiTest}
          </div>
          <div>
            <strong>Current URL:</strong> {window.location.href}
          </div>
          <button onClick={testAPI} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Test API Again
          </button>
        </div>
      </div>
    </div>
  )
}

export default Test
