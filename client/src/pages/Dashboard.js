"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import axios from "axios"
import toast from "react-hot-toast"
import { Plus, Eye, Edit, Trash2, Share2, Calendar, MoreVertical, Search, Filter } from "lucide-react"
import LoadingSpinner from "../components/LoadingSpinner"

const Dashboard = () => {
  const [tours, setTours] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterBy, setFilterBy] = useState("all")

  useEffect(() => {
    fetchTours()
  }, [])

  const fetchTours = async () => {
    try {
      console.log("🔍 Fetching tours...")
      const response = await axios.get("/api/tours")
      console.log("✅ Tours fetched:", response.data)
      setTours(response.data)
      setError(null)
    } catch (error) {
      console.error("❌ Failed to fetch tours:", error)
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch tours"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const deleteTour = async (id) => {
    if (!window.confirm("Are you sure you want to delete this tour?")) {
      return
    }

    try {
      await axios.delete(`/api/tours/${id}`)
      setTours(tours.filter((tour) => tour._id !== id))
      toast.success("Tour deleted successfully")
    } catch (error) {
      console.error("❌ Failed to delete tour:", error)
      toast.error("Failed to delete tour")
    }
  }

  const copyShareLink = (shareId) => {
    const shareUrl = `${window.location.origin}/share/${shareId}`
    navigator.clipboard.writeText(shareUrl)
    toast.success("Share link copied to clipboard")
  }

  const filteredTours = tours.filter((tour) => {
    const matchesSearch = tour.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterBy === "all" || tour.visibility === filterBy
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading your tours...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Dashboard</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={fetchTours}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <Link
              to="/"
              className="block w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Tours</h1>
              <p className="text-gray-600 mt-2">Manage your product demonstration tours</p>
            </div>
            <Link
              to="/create"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Plus size={20} />
              <span>Create New Tour</span>
            </Link>
          </div>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search tours..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Tours</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Tours Grid */}
        {filteredTours.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center py-16"
          >
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plus size={32} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm || filterBy !== "all" ? "No tours found" : "No tours yet"}
              </h3>
              <p className="text-gray-600 mb-8">
                {searchTerm || filterBy !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Create your first product demonstration tour to get started."}
              </p>
              {!searchTerm && filterBy === "all" && (
                <Link
                  to="/create"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <Plus size={20} />
                  <span>Create Your First Tour</span>
                </Link>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTours.map((tour, index) => (
              <motion.div
                key={tour._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-300 overflow-hidden"
              >
                {/* Tour Thumbnail */}
                <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 relative overflow-hidden">
                  {tour.steps && tour.steps.length > 0 ? (
                    <img
                      src={tour.steps[0].content || "/placeholder.svg"}
                      alt={tour.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <Plus className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No content yet</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        tour.visibility === "public" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {tour.visibility}
                    </span>
                  </div>
                </div>

                {/* Tour Content */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 truncate flex-1 mr-2">{tour.title}</h3>
                    <div className="relative">
                      <button className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>

                  {tour.description && <p className="text-gray-600 text-sm mb-4 line-clamp-2">{tour.description}</p>}

                  <div className="flex items-center text-sm text-gray-500 mb-6">
                    <Calendar size={16} className="mr-2" />
                    <span>{new Date(tour.createdAt).toLocaleDateString()}</span>
                    <span className="mx-2">•</span>
                    <Eye size={16} className="mr-1" />
                    <span>{tour.views} views</span>
                    <span className="mx-2">•</span>
                    <span>{tour.steps?.length || 0} steps</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Link
                        to={`/tour/${tour._id}`}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View tour"
                      >
                        <Eye size={16} />
                      </Link>
                      <Link
                        to={`/edit/${tour._id}`}
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Edit tour"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => copyShareLink(tour.shareId)}
                        className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Copy share link"
                      >
                        <Share2 size={16} />
                      </button>
                    </div>
                    <button
                      onClick={() => deleteTour(tour._id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete tour"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
