import axios from 'axios'
import { getApiUrl } from './apiConfig'

// Create axios instance with default config
const axiosInstance = axios.create({
    timeout: 120000, // 2 minutes timeout for file uploads
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor to add auth token and API URL
axiosInstance.interceptors.request.use(
    (config) => {
        // Set base URL dynamically
        if (!config.baseURL && !config.url.startsWith('http')) {
            config.baseURL = getApiUrl()
        }
        
        // Add auth token if available (use 'token' not 'adminToken')
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        
        // Handle file uploads - don't set Content-Type for FormData
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type']
            config.timeout = 300000 // 5 minutes for file uploads
            console.log(`📤 File Upload Request: ${config.method?.toUpperCase()} ${config.baseURL || ''}${config.url}`)
        } else {
            console.log(`🔗 API Request: ${config.method?.toUpperCase()} ${config.baseURL || ''}${config.url}`)
        }
        
        return config
    },
    (error) => {
        console.error('❌ Request interceptor error:', error)
        return Promise.reject(error)
    }
)

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
    (response) => {
        console.log(`✅ API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`)
        return response
    },
    (error) => {
        console.error('❌ Axios response error:', error)
        
        // Handle different error types
        if (error.code === 'ECONNABORTED') {
            console.error('❌ Request timeout')
            error.message = 'Request timeout - please try again'
        } else if (error.code === 'ERR_NETWORK') {
            console.error('❌ Network error')
            error.message = 'Network error - please check your connection'
        } else if (error.response) {
            // Server responded with error status
            const status = error.response.status
            const message = error.response.data?.message || error.message
            
            console.error(`❌ Server error ${status}:`, message)
            
            if (status === 401) {
                // Unauthorized - redirect to login
                localStorage.removeItem('adminToken')
                window.location.href = '/login'
                return Promise.reject(new Error('Session expired - please login again'))
            } else if (status === 403) {
                error.message = 'Access denied'
            } else if (status === 404) {
                error.message = 'Resource not found'
            } else if (status === 429) {
                error.message = 'Too many requests - please wait and try again'
            } else if (status >= 500) {
                error.message = 'Server error - please try again later'
            }
        } else if (error.request) {
            // Request was made but no response received
            console.error('❌ No response received:', error.request)
            error.message = 'No response from server - please check your connection'
        }
        
        console.error('❌ Upload error details:', {
            message: error.message,
            code: error.code,
            status: error.response?.status,
            url: error.config?.url,
            method: error.config?.method
        })
        
        return Promise.reject(error)
    }
)

export default axiosInstance