"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from "lucide-react"

const TourPlayer = ({ steps }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let interval

    if (isPlaying && steps.length > 0) {
      const duration = steps[currentStep]?.duration || 3000
      const increment = 100 / (duration / 100)

      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            // Move to next step
            if (currentStep < steps.length - 1) {
              setCurrentStep((prev) => prev + 1)
              return 0
            } else {
              // End of tour
              setIsPlaying(false)
              return 100
            }
          }
          return prev + increment
        })
      }, 100)
    }

    return () => clearInterval(interval)
  }, [isPlaying, currentStep, steps])

  const handlePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setProgress(0)
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      setProgress(0)
    }
  }

  const handleRestart = () => {
    setCurrentStep(0)
    setProgress(0)
    setIsPlaying(false)
  }

  const handleStepClick = (index) => {
    setCurrentStep(index)
    setProgress(0)
    setIsPlaying(false)
  }

  if (!steps || steps.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No steps available in this tour.</p>
      </div>
    )
  }

  const currentStepData = steps[currentStep]
  const transitionVariants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slide: {
      initial: { x: 100, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: -100, opacity: 0 },
    },
    zoom: {
      initial: { scale: 0.8, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 1.2, opacity: 0 },
    },
  }

  const transition = transitionVariants[currentStepData?.transition] || transitionVariants.fade

  return (
    <div className="space-y-6">
      {/* Main Display */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="relative aspect-video bg-gray-100">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={transition.initial}
              animate={transition.animate}
              exit={transition.exit}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {currentStepData?.type === "image" ? (
                <img
                  src={currentStepData.content || "/placeholder.svg"}
                  alt={`Step ${currentStep + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <video
                  src={currentStepData.content}
                  className="max-w-full max-h-full object-contain"
                  controls={false}
                  autoPlay
                  muted
                  loop
                />
              )}

              {/* Annotation */}
              {currentStepData?.annotation?.text && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg max-w-xs"
                  style={{
                    left: `${currentStepData.annotation.position.x}%`,
                    top: `${currentStepData.annotation.position.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <div className="text-sm">{currentStepData.annotation.text}</div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-600"></div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-gray-200">
          <div
            className="h-full bg-blue-600 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Controls */}
        <div className="p-4 bg-gray-50 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRestart}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
                title="Restart"
              >
                <RotateCcw size={20} />
              </button>

              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous"
              >
                <SkipBack size={20} />
              </button>

              <button
                onClick={handlePlay}
                className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>

              <button
                onClick={handleNext}
                disabled={currentStep === steps.length - 1}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next"
              >
                <SkipForward size={20} />
              </button>
            </div>

            <div className="text-sm text-gray-600">
              {currentStep + 1} / {steps.length}
            </div>
          </div>
        </div>
      </div>

      {/* Step Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {steps.map((step, index) => (
          <button
            key={step.id}
            onClick={() => handleStepClick(index)}
            className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
              index === currentStep ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200 hover:border-gray-300"
            }`}
          >
            {step.type === "image" ? (
              <img
                src={step.content || "/placeholder.svg"}
                alt={`Step ${index + 1}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <video src={step.content} className="w-full h-full object-cover" muted />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
              <span className="text-white text-sm font-medium">{index + 1}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default TourPlayer
