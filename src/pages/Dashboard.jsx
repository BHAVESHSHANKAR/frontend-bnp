import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
    Upload, 
    Shield,
    MessageSquare,
    LogOut,
    User,
    ChevronDown
} from 'lucide-react'
import { toast } from 'react-toastify'
import axios from 'axios'
import UploadComponent from '../components/UploadComponent'
import RiskAnalysisComponent from '../components/RiskAnalysisComponent'
import HistoryComponent from '../components/HistoryComponent'
import { getAdmin, logout as authLogout, isValidSession } from '../utils/auth'

const Dashboard = () => {
    const navigate = useNavigate()
    const [admin, setAdmin] = useState(null)
    const [activeTab, setActiveTab] = useState('upload')
    const [loading, setLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState({
        pendingDecisions: 0
    })
    const [showProfileDropdown, setShowProfileDropdown] = useState(false)
    const [showMobileMenu, setShowMobileMenu] = useState(false)
    const [uploadData, setUploadData] = useState(null)
    const profileRef = useRef(null)
    const mobileMenuRef = useRef(null)

    useEffect(() => {
        // Check if user session is valid
        if (!isValidSession()) {
            console.log('Invalid session detected in Dashboard')
            navigate('/login')
            return
        }

        try {
            const adminData = getAdmin()
            if (adminData) {
                setAdmin(adminData)
                fetchDashboardData()
            } else {
                console.log('No admin data found')
                navigate('/login')
            }
        } catch (error) {
            console.error('Error getting admin data:', error)
            navigate('/login')
        }
    }, [navigate])

    // Handle clicking outside dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfileDropdown(false)
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
                setShowMobileMenu(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const fetchDashboardData = async () => {
        try {
            // Fetch pending decisions count for badge
            const pendingResponse = await axios.get(`${import.meta.env.VITE_API}/api/files/pending-decisions`)
            if (pendingResponse.data.success) {
                setDashboardData({
                    pendingDecisions: pendingResponse.data.data.pending_decisions.length
                })
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error)
            
            // Check if it's an authentication error
            if (error.response?.status === 401) {
                console.log('Authentication failed while fetching dashboard data')
                toast.error('Session expired. Please login again.')
                authLogout()
                return
            }
            
            toast.error('Failed to load dashboard data')
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        try {
            // Optional: Call backend logout endpoint
            const token = localStorage.getItem('token')
            if (token) {
                try {
                    await axios.post(`${import.meta.env.VITE_API}/api/admin/logout`)
                } catch (error) {
                    // Ignore logout endpoint errors
                    console.log('Backend logout failed, proceeding with local logout')
                }
            }
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            // Always perform local logout
            authLogout()
            toast.success('Logged out successfully')
        }
    }

    const handleAnalysisComplete = (data) => {
        setUploadData(data)
        setActiveSection('risk-analysis')
        fetchDashboardData() // Refresh pending count
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Floating Pill Navbar */}
            <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-6xl px-4">
                <div className="bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-gray-200/60 px-6 sm:px-10 py-4 w-full max-w-5xl mx-auto">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center">
                            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Risk Analyzer</h1>
                        </div>

                        {/* Navigation Links */}
                        <div className="hidden md:flex items-center space-x-8">
                            <button 
                                onClick={() => setActiveTab('upload')}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${
                                    activeTab === 'upload' 
                                        ? 'bg-green-100 text-green-700 shadow-sm' 
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <span className="text-sm font-medium">Document Upload</span>
                            </button>
                            
                            <button 
                                onClick={() => setActiveTab('analysis')}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${
                                    activeTab === 'analysis' 
                                        ? 'bg-green-100 text-green-700 shadow-sm' 
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                <span className="text-sm font-medium">Risk Analysis</span>
                            </button>
                            
                            <button 
                                onClick={() => setActiveTab('history')}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${
                                    activeTab === 'history' 
                                        ? 'bg-green-100 text-green-700 shadow-sm' 
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm font-medium">History</span>
                            </button>
                        </div>

                        {/* Mobile Navigation Menu */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setShowMobileMenu(!showMobileMenu)}
                                className="flex items-center space-x-2 px-3 py-2 rounded-full hover:bg-gray-100 transition-all duration-200"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>

                        {/* Profile Dropdown */}
                        <div className="relative" ref={profileRef}>
                            <button
                                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                                onMouseEnter={() => setShowProfileDropdown(true)}
                                className="flex items-center space-x-2 px-3 py-2 rounded-full hover:bg-gray-100 transition-all duration-200"
                            >
                                <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center">
                                    <User size={16} className="text-white" />
                                </div>
                                <ChevronDown size={16} className="text-gray-500" />
                            </button>

                            {/* Profile Dropdown Menu */}
                            {showProfileDropdown && (
                                <div 
                                    className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
                                    onMouseLeave={() => setShowProfileDropdown(false)}
                                >
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center">
                                                <User size={20} className="text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{admin?.full_name}</p>
                                                <p className="text-xs text-gray-500">{admin?.email}</p>
                                                <p className="text-xs text-gray-500">{admin?.bank_name}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="py-1">
                                        <button 
                                            onClick={handleLogout}
                                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                        >
                                            <LogOut size={16} className="mr-3" />
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {showMobileMenu && (
                    <div 
                        ref={mobileMenuRef}
                        className="md:hidden absolute top-full left-4 right-4 mt-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/60 py-2 z-40"
                    >
                        <button 
                            onClick={() => {
                                setActiveTab('upload')
                                setShowMobileMenu(false)
                            }}
                            className={`flex items-center w-full px-6 py-3 text-sm transition-all duration-200 ${
                                activeTab === 'upload' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            Document Upload
                        </button>
                        
                        <button 
                            onClick={() => {
                                setActiveTab('analysis')
                                setShowMobileMenu(false)
                            }}
                            className={`flex items-center w-full px-6 py-3 text-sm transition-all duration-200 ${
                                activeTab === 'analysis' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Risk Analysis
                        </button>
                        
                        <button 
                            onClick={() => {
                                setActiveTab('history')
                                setShowMobileMenu(false)
                            }}
                            className={`flex items-center w-full px-6 py-3 text-sm transition-all duration-200 ${
                                activeTab === 'history' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            History
                        </button>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <div className="pt-32 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Content based on active tab */}
                    {activeTab === 'upload' && (
                        <UploadComponent onAnalysisComplete={handleAnalysisComplete} />
                    )}
                    {activeTab === 'analysis' && (
                        <RiskAnalysisComponent uploadData={uploadData} />
                    )}
                    {activeTab === 'history' && (
                        <HistoryComponent />
                    )}
                </div>
            </div>

        </div>
    )
}

export default Dashboard
