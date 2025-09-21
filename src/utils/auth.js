import axios from 'axios'

// Token management utilities
export const getToken = () => {
    return localStorage.getItem('token')
}

export const setToken = (token) => {
    localStorage.setItem('token', token)
}

export const removeToken = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('admin')
}

export const getAdmin = () => {
    try {
        const adminData = localStorage.getItem('admin')
        return adminData ? JSON.parse(adminData) : null
    } catch (error) {
        console.error('Error parsing admin data:', error)
        return null
    }
}

export const setAdmin = (adminData) => {
    localStorage.setItem('admin', JSON.stringify(adminData))
}

// Check if user is authenticated
export const isAuthenticated = () => {
    const token = getToken()
    const admin = getAdmin()
    return !!(token && admin)
}

// Decode JWT token to check expiration
export const isTokenExpired = (token) => {
    if (!token) return true
    
    try {
        // JWT tokens have 3 parts separated by dots
        const parts = token.split('.')
        if (parts.length !== 3) return true
        
        // Decode the payload (second part)
        const payload = JSON.parse(atob(parts[1]))
        
        // Check if token has expiration time
        if (!payload.exp) return false
        
        // Check if current time is past expiration time
        const currentTime = Math.floor(Date.now() / 1000)
        return currentTime >= payload.exp
    } catch (error) {
        console.error('Error decoding token:', error)
        return true
    }
}

// Check if current session is valid
export const isValidSession = () => {
    const token = getToken()
    
    if (!token) {
        return false
    }
    
    if (isTokenExpired(token)) {
        // Token is expired, clean up
        removeToken()
        return false
    }
    
    return isAuthenticated()
}

// Logout function
export const logout = () => {
    removeToken()
    // Redirect to login page
    window.location.href = '/login'
}

// Setup axios interceptor for automatic token handling
export const setupAxiosInterceptors = () => {
    // Request interceptor to add token to headers
    axios.interceptors.request.use(
        (config) => {
            const token = getToken()
            if (token && !isTokenExpired(token)) {
                config.headers.Authorization = `Bearer ${token}`
            }
            return config
        },
        (error) => {
            return Promise.reject(error)
        }
    )

    // Response interceptor to handle token expiration
    axios.interceptors.response.use(
        (response) => {
            return response
        },
        (error) => {
            if (error.response?.status === 401) {
                // Token is invalid or expired
                console.log('Authentication failed - redirecting to login')
                logout()
            }
            return Promise.reject(error)
        }
    )
}

// Validate token with backend
export const validateTokenWithBackend = async () => {
    try {
        const token = getToken()
        if (!token) return false
        
        const response = await axios.get(`${import.meta.env.VITE_API}/api/admin/validate-token`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        
        return response.data.success
    } catch (error) {
        console.error('Token validation failed:', error)
        return false
    }
}

// Auto-refresh token if needed (optional - implement if backend supports refresh tokens)
export const refreshTokenIfNeeded = async () => {
    const token = getToken()
    if (!token) return false
    
    try {
        // Check if token expires in the next 5 minutes
        const parts = token.split('.')
        if (parts.length !== 3) return false
        
        const payload = JSON.parse(atob(parts[1]))
        const currentTime = Math.floor(Date.now() / 1000)
        const timeUntilExpiry = payload.exp - currentTime
        
        // If token expires in less than 5 minutes, try to refresh
        if (timeUntilExpiry < 300) {
            // Implement refresh logic here if backend supports it
            console.log('Token expires soon, consider implementing refresh logic')
        }
        
        return true
    } catch (error) {
        console.error('Error checking token expiry:', error)
        return false
    }
}
