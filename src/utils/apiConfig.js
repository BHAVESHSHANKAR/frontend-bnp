// API Configuration for deployment
const API_CONFIG = {
    EXPRESS_BACKEND: 'https://bnp-backend.vercel.app',
    ML_BACKEND: 'https://ml-bnp-backend.onrender.com',
    // Fallback to local development if environment variable is not set
    LOCAL_EXPRESS: 'http://localhost:5000',
    LOCAL_ML: 'http://localhost:8000'
}

// Get the appropriate API URL based on environment
export const getApiUrl = () => {
    // Check if we're in production (deployed)
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        console.log('🌐 Production environment detected, using deployed backend:', API_CONFIG.EXPRESS_BACKEND)
        return API_CONFIG.EXPRESS_BACKEND
    }
    // Use environment variable if available, otherwise fallback to local
    const apiUrl = import.meta.env.VITE_API || API_CONFIG.LOCAL_EXPRESS
    console.log('🏠 Development environment detected, using API URL:', apiUrl)
    return apiUrl
}

// Get ML Backend URL
export const getMLApiUrl = () => {
    // Check if we're in production (deployed)
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        console.log('🤖 Production environment detected, using deployed ML backend:', API_CONFIG.ML_BACKEND)
        return API_CONFIG.ML_BACKEND
    }
    // Use environment variable if available, otherwise fallback to local
    const mlApiUrl = import.meta.env.VITE_ML_API || API_CONFIG.LOCAL_ML
    console.log('🤖 Development environment detected, using ML API URL:', mlApiUrl)
    return mlApiUrl
}

// Export the config object for direct access if needed
export { API_CONFIG }

export default {
    getApiUrl,
    getMLApiUrl,
    API_CONFIG
}
