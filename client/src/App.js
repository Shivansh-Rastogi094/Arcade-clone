import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { AuthProvider } from "./contexts/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"
import Navbar from "./components/Navbar"
import EnvCheck from "./components/EnvCheck"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import CreateTour from "./pages/CreateTour"
import EditTour from "./pages/EditTour"
import ViewTour from "./pages/ViewTour"
import PublicTour from "./pages/PublicTour"
import Test from "./pages/Test"

function App() {
  return (
    <AuthProvider>
      <EnvCheck />
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/test" element={<Test />} />
              <Route path="/share/:shareId" element={<PublicTour />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create"
                element={
                  <ProtectedRoute>
                    <CreateTour />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit/:id"
                element={
                  <ProtectedRoute>
                    <EditTour />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tour/:id"
                element={
                  <ProtectedRoute>
                    <ViewTour />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#fff",
                color: "#374151",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
