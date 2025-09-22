// API Configuration for deployment
const API_CONFIG = {
    EXPRESS_BACKEND: 'https://bnp-backend.vercel.app',
    ML_BACKEND: 'https://ml-bnp-backend.onrender.com',
    // Fallback to local development if environment variable is not set
    LOCAL_EXPRESS: 'http://localhost:6969', // Updated to match your backend port
    LOCAL_ML: 'http://localhost:5001' // Updated to match your ML backend port
}

// Get the appropriate API URL based on environment
export const getApiUrl = () => {
    try {
        // Check if we're in production (deployed)
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            console.log('🌐 Production environment detected, using deployed backend:', API_CONFIG.EXPRESS_BACKEND)
            return API_CONFIG.EXPRESS_BACKEND
        }
        // Use environment variable if available, otherwise fallback to local
        const apiUrl = import.meta.env.VITE_API_URL || API_CONFIG.LOCAL_EXPRESS
        console.log('🏠 Development environment detected, using API URL:', apiUrl)
        return apiUrl
    } catch (error) {
        console.error('❌ Error getting API URL:', error)
        return API_CONFIG.EXPRESS_BACKEND // Fallback to production
    }
}

// Get ML Backend URL
export const getMLApiUrl = () => {
    try {
        // Check if we're in production (deployed)
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            console.log('🤖 Production environment detected, using deployed ML backend:', API_CONFIG.ML_BACKEND)
            return API_CONFIG.ML_BACKEND
        }
        // Use environment variable if available, otherwise fallback to local
        const mlApiUrl = import.meta.env.VITE_ML_API_URL || API_CONFIG.LOCAL_ML
        console.log('🤖 Development environment detected, using ML API URL:', mlApiUrl)
        return mlApiUrl
    } catch (error) {
        console.error('❌ Error getting ML API URL:', error)
        return API_CONFIG.ML_BACKEND // Fallback to production
    }
}

// Test API connection
export const testApiConnection = async () => {
    try {
        const apiUrl = getApiUrl()
        const response = await fetch(`${apiUrl}/ping`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        
        if (response.ok) {
            const data = await response.json()
            console.log('✅ API connection successful:', data)
            return { success: true, data }
        } else {
            console.log('⚠️ API connection failed with status:', response.status)
            return { success: false, error: `HTTP ${response.status}` }
        }
    } catch (error) {
        console.error('❌ API connection test failed:', error)
        return { success: false, error: error.message }
    }
}

// Export the config object for direct access if needed
export { API_CONFIG }

export default {
    getApiUrl,
    getMLApiUrl,
    API_CONFIG
}
