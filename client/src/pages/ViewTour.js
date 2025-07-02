"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { motion } from "framer-motion"
import axios from "axios"
import toast from "react-hot-toast"
import { Edit, Share2, Eye, Calendar, User } from "lucide-react"
import LoadingSpinner from "../components/LoadingSpinner"
import TourPlayer from "../components/TourPlayer"

const ViewTour = () => {
  const { id } = useParams()
  const [tour, setTour] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTour()
  }, [id])

  const fetchTour = async () => {
    try {
      const response = await axios.get(`/api/tours/${id}`)
      setTour(response.data)
    } catch (error) {
      toast.error("Failed to fetch tour")
    } finally {
      setLoading(false)
    }
  }

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/share/${tour.shareId}`
    navigator.clipboard.writeText(shareUrl)
    toast.success("Share link copied to clipboard")
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
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{tour.title}</h1>
            {tour.description && <p className="text-gray-600 mt-2">{tour.description}</p>}
          </div>

          <div className="flex space-x-3">
            <Link
              to={`/edit/${tour._id}`}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit size={16} />
              <span>Edit</span>
            </Link>
            <button
              onClick={copyShareLink}
              className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Share2 size={16} />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Tour Info */}
        <div className="flex items-center space-x-6 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <User size={16} />
            <span>{tour.creator.name}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar size={16} />
            <span>{new Date(tour.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Eye size={16} />
            <span>{tour.views} views</span>
          </div>
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              tour.visibility === "public" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
            }`}
          >
            {tour.visibility}
          </span>
        </div>
      </motion.div>

      {/* Tour Player */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <TourPlayer steps={tour.steps} />
      </motion.div>
    </div>
  )
}

export default ViewTour
