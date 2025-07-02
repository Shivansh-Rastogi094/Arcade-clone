"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import axios from "axios"
import toast from "react-hot-toast"
import TourEditor from "../components/TourEditor"
import LoadingSpinner from "../components/LoadingSpinner"

const CreateTour = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSave = async (tourData) => {
    setLoading(true)

    try {
      const response = await axios.post("/api/tours", tourData)
      toast.success("Tour created successfully!")
      navigate(`/tour/${response.data._id}`)
    } catch (error) {
      toast.error("Failed to create tour")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Tour</h1>
        <p className="text-gray-600 mt-2">Build an interactive product demonstration</p>
      </motion.div>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-center">Creating tour...</p>
          </div>
        </div>
      )}

      <TourEditor onSave={handleSave} />
    </div>
  )
}

export default CreateTour
