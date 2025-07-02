"use client"

import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { useDropzone } from "react-dropzone"
import axios from "axios"
import toast from "react-hot-toast"
import { Plus, Upload, ImageIcon, Trash2, GripVertical, Monitor, Save } from "lucide-react"
import LoadingSpinner from "./LoadingSpinner"
import ScreenRecorder from "./ScreenRecorder"

const TourEditor = ({ initialData = null, onSave }) => {
  const [tourData, setTourData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    visibility: initialData?.visibility || "private",
    steps: initialData?.steps || [],
  })

  const [uploading, setUploading] = useState(false)
  const [showRecorder, setShowRecorder] = useState(false)

  const onDrop = useCallback(
    async (acceptedFiles) => {
      setUploading(true)

      try {
        const formData = new FormData()
        formData.append("file", acceptedFiles[0])

        const response = await axios.post("/api/upload/single", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })

        const newStep = {
          id: Date.now().toString(),
          type: acceptedFiles[0].type.startsWith("video/") ? "video" : "image",
          content: response.data.fileUrl,
          annotation: {
            text: "",
            position: { x: 50, y: 50 },
          },
          transition: "fade",
          duration: 3000,
          order: tourData.steps.length,
        }

        setTourData((prev) => ({
          ...prev,
          steps: [...prev.steps, newStep],
        }))

        toast.success("File uploaded successfully")
      } catch (error) {
        toast.error("Failed to upload file")
      } finally {
        setUploading(false)
      }
    },
    [tourData.steps.length],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
      "video/*": [".mp4", ".webm", ".mov"],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
  })

  const handleDragEnd = (result) => {
    if (!result.destination) return

    const items = Array.from(tourData.steps)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update order property
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index,
    }))

    setTourData((prev) => ({
      ...prev,
      steps: updatedItems,
    }))
  }

  const updateStep = (stepId, updates) => {
    setTourData((prev) => ({
      ...prev,
      steps: prev.steps.map((step) => (step.id === stepId ? { ...step, ...updates } : step)),
    }))
  }

  const deleteStep = (stepId) => {
    setTourData((prev) => ({
      ...prev,
      steps: prev.steps.filter((step) => step.id !== stepId),
    }))
  }

  const handleRecordingComplete = (recordingUrl) => {
    const newStep = {
      id: Date.now().toString(),
      type: "video",
      content: recordingUrl,
      annotation: {
        text: "",
        position: { x: 50, y: 50 },
      },
      transition: "fade",
      duration: 3000,
      order: tourData.steps.length,
    }

    setTourData((prev) => ({
      ...prev,
      steps: [...prev.steps, newStep],
    }))

    setShowRecorder(false)
    toast.success("Screen recording added to tour")
  }

  const handleSave = () => {
    if (!tourData.title.trim()) {
      toast.error("Please enter a tour title")
      return
    }

    if (tourData.steps.length === 0) {
      toast.error("Please add at least one step to your tour")
      return
    }

    onSave(tourData)
  }

  return (
    <div className="space-y-8">
      {/* Tour Settings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Tour Settings</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tour Title *</label>
            <input
              type="text"
              value={tourData.title}
              onChange={(e) => setTourData((prev) => ({ ...prev, title: e.target.value }))}
              className="input-field"
              placeholder="Enter tour title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
            <select
              value={tourData.visibility}
              onChange={(e) => setTourData((prev) => ({ ...prev, visibility: e.target.value }))}
              className="input-field"
            >
              <option value="private">Private</option>
              <option value="public">Public</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={tourData.description}
            onChange={(e) => setTourData((prev) => ({ ...prev, description: e.target.value }))}
            className="input-field"
            rows={3}
            placeholder="Describe your tour"
          />
        </div>
      </motion.div>

      {/* Add Content Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Content</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* File Upload */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <LoadingSpinner size="md" />
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">{isDragActive ? "Drop files here" : "Upload images or videos"}</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF, MP4, WebM (max 50MB)</p>
              </>
            )}
          </div>

          {/* Screen Recording */}
          <button
            onClick={() => setShowRecorder(true)}
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
          >
            <Monitor className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Record Screen</p>
            <p className="text-xs text-gray-500 mt-1">Capture your screen directly</p>
          </button>

          {/* Quick Actions */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">More options</p>
            <p className="text-xs text-gray-500 mt-1">Coming soon</p>
          </div>
        </div>
      </motion.div>

      {/* Steps List */}
      {tourData.steps.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Tour Steps ({tourData.steps.length})</h2>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="steps">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                  {tourData.steps.map((step, index) => (
                    <Draggable key={step.id} draggableId={step.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`border rounded-lg p-4 bg-white ${
                            snapshot.isDragging ? "shadow-lg" : "shadow-sm"
                          }`}
                        >
                          <div className="flex items-start space-x-4">
                            <div
                              {...provided.dragHandleProps}
                              className="flex-shrink-0 mt-2 text-gray-400 hover:text-gray-600 cursor-grab"
                            >
                              <GripVertical size={20} />
                            </div>

                            <div className="flex-shrink-0">
                              {step.type === "image" ? (
                                <ImageIcon
                                  src={step.content || "/placeholder.svg"}
                                  alt={`Step ${index + 1}`}
                                  className="w-20 h-20 object-cover rounded-lg"
                                />
                              ) : (
                                <video src={step.content} className="w-20 h-20 object-cover rounded-lg" muted />
                              )}
                            </div>

                            <div className="flex-1 space-y-3">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-500">Step {index + 1}</span>
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{step.type}</span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Annotation Text
                                  </label>
                                  <input
                                    type="text"
                                    value={step.annotation.text}
                                    onChange={(e) =>
                                      updateStep(step.id, {
                                        annotation: {
                                          ...step.annotation,
                                          text: e.target.value,
                                        },
                                      })
                                    }
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="Add annotation text"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Transition Effect
                                  </label>
                                  <select
                                    value={step.transition}
                                    onChange={(e) => updateStep(step.id, { transition: e.target.value })}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  >
                                    <option value="fade">Fade</option>
                                    <option value="slide">Slide</option>
                                    <option value="zoom">Zoom</option>
                                  </select>
                                </div>
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Duration (ms)</label>
                                <input
                                  type="number"
                                  value={step.duration}
                                  onChange={(e) => updateStep(step.id, { duration: Number.parseInt(e.target.value) })}
                                  className="w-32 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  min="1000"
                                  max="10000"
                                  step="500"
                                />
                              </div>
                            </div>

                            <button
                              onClick={() => deleteStep(step.id)}
                              className="flex-shrink-0 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </motion.div>
      )}

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-end space-x-4"
      >
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save size={20} />
          <span>Save Tour</span>
        </button>
      </motion.div>

      {/* Screen Recorder Modal */}
      {showRecorder && <ScreenRecorder onComplete={handleRecordingComplete} onClose={() => setShowRecorder(false)} />}
    </div>
  )
}

export default TourEditor
