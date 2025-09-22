import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { 
    getToken, 
    getAdmin, 
    setToken, 
    setAdmin, 
    removeToken, 
    isValidSession,
    validateTokenWithBackend 
} from '../utils/auth'
import { getApiUrl } from '../utils/apiConfig'
import { toast } from 'react-toastify'

// Auth Context
const AuthContext = createContext()

// Auth Actions
const AUTH_ACTIONS = {
    LOGIN_START: 'LOGIN_START',
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    LOGIN_FAILURE: 'LOGIN_FAILURE',
    LOGOUT: 'LOGOUT',
    TOKEN_VALIDATION_START: 'TOKEN_VALIDATION_START',
    TOKEN_VALIDATION_SUCCESS: 'TOKEN_VALIDATION_SUCCESS',
    TOKEN_VALIDATION_FAILURE: 'TOKEN_VALIDATION_FAILURE',
    SET_LOADING: 'SET_LOADING'
}

// Initial State
const initialState = {
    isAuthenticated: false,
    admin: null,
    token: null,
    loading: true,
    validatingToken: false,
    error: null
}

// Auth Reducer
const authReducer = (state, action) => {
    switch (action.type) {
        case AUTH_ACTIONS.LOGIN_START:
            return {
                ...state,
                loading: true,
                error: null
            }
        
        case AUTH_ACTIONS.LOGIN_SUCCESS:
            return {
                ...state,
                isAuthenticated: true,
                admin: action.payload.admin,
                token: action.payload.token,
                loading: false,
                error: null
            }
        
        case AUTH_ACTIONS.LOGIN_FAILURE:
            return {
                ...state,
                isAuthenticated: false,
                admin: null,
                token: null,
                loading: false,
                error: action.payload.error
            }
        
        case AUTH_ACTIONS.LOGOUT:
            return {
                ...state,
                isAuthenticated: false,
                admin: null,
                token: null,
                loading: false,
                error: null
            }
        
        case AUTH_ACTIONS.TOKEN_VALIDATION_START:
            return {
                ...state,
                validatingToken: true
            }
        
        case AUTH_ACTIONS.TOKEN_VALIDATION_SUCCESS:
            return {
                ...state,
                isAuthenticated: true,
                admin: action.payload.admin,
                token: action.payload.token,
                validatingToken: false,
                loading: false,
                error: null
            }
        
        case AUTH_ACTIONS.TOKEN_VALIDATION_FAILURE:
            return {
                ...state,
                isAuthenticated: false,
                admin: null,
                token: null,
                validatingToken: false,
                loading: false,
                error: action.payload.error
            }
        
        case AUTH_ACTIONS.SET_LOADING:
            return {
                ...state,
                loading: action.payload.loading
            }
        
        default:
            return state
    }
}

// Auth Provider Component
export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState)

    // Initialize authentication state on app load
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: { loading: true } })
                
                // Check if we have a valid local session
                if (isValidSession()) {
                    const token = getToken()
                    const admin = getAdmin()
                    
                    if (token && admin) {
                        // Validate token with backend
                        dispatch({ type: AUTH_ACTIONS.TOKEN_VALIDATION_START })
                        
                        const isValid = await validateTokenWithBackend()
                        
                        if (isValid) {
                            dispatch({
                                type: AUTH_ACTIONS.TOKEN_VALIDATION_SUCCESS,
                                payload: { admin, token }
                            })
                        } else {
                            // Token is invalid, clear local storage
                            removeToken()
                            dispatch({
                                type: AUTH_ACTIONS.TOKEN_VALIDATION_FAILURE,
                                payload: { error: 'Token validation failed' }
                            })
                        }
                    } else {
                        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: { loading: false } })
                    }
                } else {
                    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: { loading: false } })
                }
            } catch (error) {
                console.error('Auth initialization error:', error)
                removeToken()
                dispatch({
                    type: AUTH_ACTIONS.TOKEN_VALIDATION_FAILURE,
                    payload: { error: 'Authentication initialization failed' }
                })
            }
        }

        initializeAuth()
    }, [])

    // Login function
    const login = async (credentials) => {
        try {
            dispatch({ type: AUTH_ACTIONS.LOGIN_START })
            
            const apiUrl = getApiUrl()
            console.log('🔗 AuthContext Login - Using API URL:', apiUrl)
            
            const response = await fetch(`${apiUrl}/api/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            })
            
            const data = await response.json()
            
            if (data.success) {
                const { admin, token } = data.data
                
                // Store in localStorage
                setToken(token)
                setAdmin(admin)
                
                // Update state
                dispatch({
                    type: AUTH_ACTIONS.LOGIN_SUCCESS,
                    payload: { admin, token }
                })
                
                toast.success(`Welcome back, ${admin.full_name}!`)
                return { success: true, admin, token }
            } else {
                dispatch({
                    type: AUTH_ACTIONS.LOGIN_FAILURE,
                    payload: { error: data.message }
                })
                return { success: false, error: data.message }
            }
        } catch (error) {
            const errorMessage = error.message || 'Login failed'
            dispatch({
                type: AUTH_ACTIONS.LOGIN_FAILURE,
                payload: { error: errorMessage }
            })
            return { success: false, error: errorMessage }
        }
    }

    // Logout function
    const logout = async () => {
        try {
            // Optional: Call backend logout endpoint
            const token = getToken()
            if (token) {
                try {
                    const apiUrl = getApiUrl()
                    console.log('🔗 AuthContext Logout - Using API URL:', apiUrl)
                    
                    await fetch(`${apiUrl}/api/admin/logout`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    })
                } catch (error) {
                    console.log('Backend logout failed, proceeding with local logout')
                }
            }
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            // Always perform local logout
            removeToken()
            dispatch({ type: AUTH_ACTIONS.LOGOUT })
            toast.success('Logged out successfully')
        }
    }

    // Check authentication status
    const checkAuth = () => {
        return isValidSession() && state.isAuthenticated
    }

    // Refresh token validation
    const refreshAuth = async () => {
        if (!isValidSession()) {
            logout()
            return false
        }

        try {
            dispatch({ type: AUTH_ACTIONS.TOKEN_VALIDATION_START })
            
            const isValid = await validateTokenWithBackend()
            
            if (isValid) {
                const token = getToken()
                const admin = getAdmin()
                
                dispatch({
                    type: AUTH_ACTIONS.TOKEN_VALIDATION_SUCCESS,
                    payload: { admin, token }
                })
                return true
            } else {
                dispatch({
                    type: AUTH_ACTIONS.TOKEN_VALIDATION_FAILURE,
                    payload: { error: 'Token validation failed' }
                })
                logout()
                return false
            }
        } catch (error) {
            console.error('Auth refresh error:', error)
            dispatch({
                type: AUTH_ACTIONS.TOKEN_VALIDATION_FAILURE,
                payload: { error: 'Authentication refresh failed' }
            })
            logout()
            return false
        }
    }

    const value = {
        // State
        ...state,
        
        // Actions
        login,
        logout,
        checkAuth,
        refreshAuth
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export default AuthContext
