import React, { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { isValidSession, validateTokenWithBackend, logout } from '../utils/auth'
import { toast } from 'react-toastify'

const ProtectedRoute = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const location = useLocation()

    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                // First check local session validity
                const localSessionValid = isValidSession()
                
                if (!localSessionValid) {
                    console.log('Local session invalid - redirecting to login')
                    setIsAuthenticated(false)
                    setIsLoading(false)
                    return
                }

                // Then validate with backend
                const backendValidation = await validateTokenWithBackend()
                
                if (!backendValidation) {
                    console.log('Backend validation failed - session expired')
                    toast.error('Your session has expired. Please login again.')
                    logout()
                    setIsAuthenticated(false)
                } else {
                    setIsAuthenticated(true)
                }
            } catch (error) {
                console.error('Authentication check failed:', error)
                toast.error('Authentication check failed. Please login again.')
                logout()
                setIsAuthenticated(false)
            } finally {
                setIsLoading(false)
            }
        }

        checkAuthentication()
    }, [location.pathname])

    // Show loading spinner while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Verifying authentication...</p>
                </div>
            </div>
        )
    }

    // If not authenticated, redirect to login with return URL
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    // If authenticated, render the protected component
    return children
}

export default ProtectedRoute
