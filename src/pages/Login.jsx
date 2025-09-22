import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { toast } from 'react-toastify'
import axios from 'axios'
import { setToken, setAdmin } from '../utils/auth'
import { getApiUrl } from '../utils/apiConfig'

const Login = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    })
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})
    const [showPassword, setShowPassword] = useState(false)
    
    // Get the redirect path from location state
    const from = location.state?.from?.pathname || '/dashboard'

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required'
        }

        if (!formData.password) {
            newErrors.password = 'Password is required'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!validateForm()) {
            toast.error('Please fill in all required fields')
            return
        }

        setLoading(true)

        try {
            const apiUrl = getApiUrl()
            console.log('🔗 Login - Using API URL:', apiUrl)
            console.log('📤 Login request data:', {
                username: formData.username,
                passwordLength: formData.password.length
            })
            
            // Create a fresh axios instance to avoid interceptor conflicts
            const loginAxios = axios.create({
                timeout: 30000,
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            
            const response = await loginAxios.post(`${apiUrl}/api/admin/login`, {
                username: formData.username,
                password: formData.password
            })
            
            console.log('✅ Login response received:', {
                status: response.status,
                statusText: response.statusText,
                hasData: !!response.data,
                success: response.data?.success
            })

            if (response.data.success) {
                // Store token and user data using auth utilities
                setToken(response.data.data.token)
                setAdmin(response.data.data.admin)
                
                toast.success(`Welcome back, ${response.data.data.admin.full_name}!`)
                
                // Redirect to the intended page or dashboard
                setTimeout(() => {
                    navigate(from, { replace: true })
                }, 1500)
            }
        } catch (error) {
            console.error('❌ Login error:', error)
            console.error('❌ Login error details:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                code: error.code,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    headers: error.config?.headers
                }
            })
            
            let errorMessage = 'Login failed. Please try again.'
            
            if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
                errorMessage = 'Network error - please check your internet connection'
            } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                errorMessage = 'Login timeout - please try again'
            } else if (error.response?.status === 401) {
                errorMessage = 'Invalid username or password'
            } else if (error.response?.status === 403) {
                errorMessage = 'Access forbidden - account may be disabled'
            } else if (error.response?.status === 404) {
                errorMessage = 'Login service not found - please contact support'
            } else if (error.response?.status === 500) {
                errorMessage = 'Server error - please try again later'
            } else if (error.response?.status === 502 || error.response?.status === 503) {
                errorMessage = 'Service temporarily unavailable - please try again'
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message
            } else if (error.message) {
                errorMessage = `Login error: ${error.message}`
            }
            
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 py-12 px-4 sm:px-6 lg:px-8">
            {/* Back to Home Button */}
            <div className="max-w-md mx-auto mb-8">
                <Link 
                    to="/" 
                    className="inline-flex items-center text-gray-600 hover:text-green-600 font-medium transition-colors duration-200"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Back to Home
                </Link>
            </div>

            <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                    <p className="text-gray-600">Sign in to your admin account</p>
                </div>

                <div className="bg-white/20 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/30">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Username */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                value={formData.username}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                                    errors.username ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Enter your username"
                                autoComplete="username"
                            />
                            {errors.username && (
                                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 pr-12 ${
                                        errors.password ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>

                        {/* Forgot Password */}
                        <div className="text-right">
                            <a href="#" className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors duration-200">
                                Forgot password?
                            </a>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Signing In...
                                </div>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>


                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Don't have an account?{' '}
                            <Link 
                                to="/signup" 
                                className="text-green-600 hover:text-green-700 font-medium transition-colors duration-200"
                            >
                                Create one here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login