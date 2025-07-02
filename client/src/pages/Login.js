"use client"

import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "../contexts/AuthContext"
import toast from "react-hot-toast"
import { Chrome, ArrowRight, Shield, Zap, Users } from "lucide-react"

const Login = () => {
  const { user, loginWithGoogle, loading } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    if (user) {
      navigate("/dashboard")
    }

    // Check for auth error
    const error = searchParams.get("error")
    if (error === "auth_failed") {
      toast.error("Authentication failed. Please try again.")
    }
  }, [user, navigate, searchParams])

  const handleGoogleLogin = (e) => {
    e.preventDefault()
    console.log("🔄 Initiating Google OAuth...")
    loginWithGoogle()
  }

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure Authentication",
      description: "Your data is protected with Google's enterprise-grade security",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Quick Setup",
      description: "Get started in seconds with your existing Google account",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Team Collaboration",
      description: "Easily share and collaborate with your team members",
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Side - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-xl p-8 lg:p-12 border border-gray-200"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-6">
              <span className="text-white font-bold text-2xl">A</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
            <p className="text-gray-600">Sign in to continue creating amazing product demos</p>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="group w-full flex items-center justify-center px-6 py-4 bg-white border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Chrome className="w-6 h-6 mr-3 text-blue-600" />
            Continue with Google
            <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              By signing in, you agree to our{" "}
              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                Privacy Policy
              </a>
            </p>
          </div>
        </motion.div>

        {/* Right Side - Features */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-8"
        >
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Why choose our platform?</h3>
            <p className="text-gray-600 text-lg">
              Create professional product demonstrations that engage your audience and drive conversions.
            </p>
          </div>

          <div className="space-y-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                className="flex items-start space-x-4"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center text-blue-600">
                  {feature.icon}
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">{feature.title}</h4>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white"
          >
            <h4 className="text-lg font-semibold mb-2">🚀 Ready to get started?</h4>
            <p className="text-blue-100">
              Join over 10,000+ teams who trust our platform to showcase their products effectively.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default Login
