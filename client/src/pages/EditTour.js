"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import axios from "axios"
import toast from "react-hot-toast"
import TourEditor from "../components/TourEditor"
import LoadingSpinner from "../components/LoadingSpinner"

const EditTour = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tour, setTour] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchTour()
  }, [id])

  const fetchTour = async () => {
    try {
      const response = await axios.get(`/api/tours/${id}`)
      setTour(response.data)
    } catch (error) {
      toast.error("Failed to fetch tour")
      navigate("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (tourData) => {
    setSaving(true)

    try {
      await axios.put(`/api/tours/${id}`, tourData)
      toast.success("Tour updated successfully!")
      navigate(`/tour/${id}`)
    } catch (error) {
      toast.error("Failed to update tour")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!tour) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tour not found</h2>
          <p className="text-gray-600">The tour you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Tour</h1>
        <p className="text-gray-600 mt-2">Update your product demonstration</p>
      </motion.div>

      {saving && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-center">Saving changes...</p>
          </div>
        </div>
      )}

      <TourEditor initialData={tour} onSave={handleSave} />
    </div>
  )
}

export default EditTour
