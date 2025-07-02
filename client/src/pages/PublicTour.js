"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { motion } from "framer-motion"
import axios from "axios"
import toast from "react-hot-toast"
import { Calendar, User, Eye } from "lucide-react"
import LoadingSpinner from "../components/LoadingSpinner"
import TourPlayer from "../components/TourPlayer"

const PublicTour = () => {
  const { shareId } = useParams()
  const [tour, setTour] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTour()
  }, [shareId])

  const fetchTour = async () => {
    try {
      const response = await axios.get(`/api/tours/share/${shareId}`)
      setTour(response.data)
    } catch (error) {
      toast.error("Tour not found or not accessible")
    } finally {
      setLoading(false)
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
          <p className="text-gray-600">This tour doesn't exist or is not publicly accessible.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{tour.title}</h1>
        {tour.description && <p className="text-gray-600 mt-2">{tour.description}</p>}

        {/* Tour Info */}
        <div className="flex items-center space-x-6 text-sm text-gray-500 mt-4">
          <div className="flex items-center space-x-1">
            <User size={16} />
            <span>By {tour.creator.name}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar size={16} />
            <span>{new Date(tour.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Eye size={16} />
            <span>{tour.views} views</span>
          </div>
        </div>
      </motion.div>

      {/* Tour Player */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <TourPlayer steps={tour.steps} />
      </motion.div>
    </div>
  )
}

export default PublicTour
