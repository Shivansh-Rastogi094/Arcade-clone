"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { X, Play, Square, Download } from "lucide-react"
import toast from "react-hot-toast"

const ScreenRecorder = ({ onComplete, onClose }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef(null)
  const streamRef = useRef(null)
  const timerRef = useRef(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          mediaSource: "screen",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: true,
      })

      streamRef.current = stream
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
      })

      mediaRecorderRef.current = mediaRecorder
      const chunks = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" })
        setRecordedBlob(blob)
        setIsRecording(false)
        clearInterval(timerRef.current)
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)

      // Handle stream end (user stops sharing)
      stream.getVideoTracks()[0].onended = () => {
        stopRecording()
      }

      toast.success("Screen recording started")
    } catch (error) {
      console.error("Error starting screen recording:", error)
      toast.error("Failed to start screen recording")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      streamRef.current?.getTracks().forEach((track) => track.stop())
      clearInterval(timerRef.current)
      toast.success("Recording stopped")
    }
  }

  const saveRecording = async () => {
    if (!recordedBlob) return

    try {
      const formData = new FormData()
      const file = new File([recordedBlob], `recording-${Date.now()}.webm`, {
        type: "video/webm",
      })
      formData.append("file", file)

      const response = await fetch("/api/upload/single", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        onComplete(data.fileUrl)
        toast.success("Recording saved successfully")
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error("Error saving recording:", error)
      toast.error("Failed to save recording")
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Screen Recorder</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="text-center space-y-6">
          {!isRecording && !recordedBlob && (
            <div>
              <p className="text-gray-600 mb-4">Click start to begin recording your screen</p>
              <button
                onClick={startRecording}
                className="flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors mx-auto"
              >
                <Play size={20} />
                <span>Start Recording</span>
              </button>
            </div>
          )}

          {isRecording && (
            <div>
              <div className="text-2xl font-mono text-red-600 mb-4">{formatTime(recordingTime)}</div>
              <p className="text-gray-600 mb-4">Recording in progress...</p>
              <button
                onClick={stopRecording}
                className="flex items-center space-x-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors mx-auto"
              >
                <Square size={20} />
                <span>Stop Recording</span>
              </button>
            </div>
          )}

          {recordedBlob && (
            <div>
              <p className="text-gray-600 mb-4">Recording completed!</p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => {
                    setRecordedBlob(null)
                    setRecordingTime(0)
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Record Again
                </button>
                <button
                  onClick={saveRecording}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download size={16} />
                  <span>Save & Add to Tour</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default ScreenRecorder
