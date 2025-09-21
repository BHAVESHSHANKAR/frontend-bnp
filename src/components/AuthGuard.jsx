import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { isValidSession } from '../utils/auth'

// Component to redirect authenticated users away from login/signup pages
const AuthGuard = ({ children }) => {
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        const checkAuth = () => {
            if (isValidSession()) {
                // User is already authenticated, redirect to dashboard
                const from = location.state?.from?.pathname || '/dashboard'
                navigate(from, { replace: true })
            }
        }

        checkAuth()
    }, [navigate, location])

    // If user is authenticated, don't render the auth pages
    if (isValidSession()) {
        return null
    }

    // If not authenticated, render the auth page (login/signup)
    return children
}

export default AuthGuard
