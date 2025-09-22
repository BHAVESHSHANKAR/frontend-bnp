import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useEffect } from 'react'
import LandingPage from './pages/LandingPage'
import About from './pages/About'
import Services from './pages/Services'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import ApiTest from './pages/ApiTest'
import ProtectedRoute from './components/ProtectedRoute'
import AuthGuard from './components/AuthGuard'
import ErrorBoundary from './components/ErrorBoundary'
import { setupAxiosInterceptors } from './utils/auth'

function App() {
  // Setup axios interceptors for automatic token handling
  useEffect(() => {
    setupAxiosInterceptors()
  }, [])

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/api-test" element={<ApiTest />} />
            
            {/* Auth Routes - Redirect to dashboard if already logged in */}
            <Route 
              path="/login" 
              element={
                <AuthGuard>
                  <Login />
                </AuthGuard>
              } 
            />
            <Route 
              path="/signup" 
              element={
                <AuthGuard>
                  <Signup />
                </AuthGuard>
              } 
            />
            
            {/* Protected Routes - Require authentication */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch all route - redirect to home */}
            <Route path="*" element={<LandingPage />} />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            toastClassName="!bg-white !text-gray-800 !shadow-lg !border !border-gray-200"
            progressClassName="!bg-green-500"
          />
        </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App
