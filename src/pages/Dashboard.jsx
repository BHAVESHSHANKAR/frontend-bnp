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
    const [activeSection, setActiveSection] = useState('upload')
    const [loading, setLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState({
        pendingDecisions: 0
    })
    const [showProfileDropdown, setShowProfileDropdown] = useState(false)
    const [uploadData, setUploadData] = useState(null)
    const profileRef = useRef(null)

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

    // Handle clicking outside profile dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfileDropdown(false)
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
            <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-4xl px-4">
                <div className="bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-gray-200/60 px-4 sm:px-8 py-4 w-full max-w-2xl mx-auto">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center">
                            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Risk Analyzer</h1>
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
            </nav>

            {/* Main Content */}
            <div className="pt-32 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Horizontal Navigation */}
                    <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-8">
                        <button
                            onClick={() => setActiveSection('upload')}
                            className={`w-full sm:w-auto flex items-center justify-center px-4 sm:px-6 py-3 rounded-lg transition-all duration-200 text-sm sm:text-base ${
                                activeSection === 'upload'
                                    ? 'bg-green-600 text-white shadow-md'
                                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-green-50 hover:text-green-600 hover:border-green-200'
                            }`}
                        >
                            <Upload size={18} className="mr-2" />
                            <span className="hidden sm:inline">Upload Documents</span>
                            <span className="sm:hidden">Upload</span>
                        </button>

                        <button
                            onClick={() => setActiveSection('risk-analysis')}
                            className={`w-full sm:w-auto flex items-center justify-center px-4 sm:px-6 py-3 rounded-lg transition-all duration-200 relative text-sm sm:text-base ${
                                activeSection === 'risk-analysis'
                                    ? 'bg-green-600 text-white shadow-md'
                                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-green-50 hover:text-green-600 hover:border-green-200'
                            }`}
                        >
                            <Shield size={18} className="mr-2" />
                            <span className="hidden sm:inline">Risk Analysis</span>
                            <span className="sm:hidden">Risk</span>
                            {dashboardData.pendingDecisions > 0 && (
                                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                                    {dashboardData.pendingDecisions}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => setActiveSection('history')}
                            className={`w-full sm:w-auto flex items-center justify-center px-4 sm:px-6 py-3 rounded-lg transition-all duration-200 text-sm sm:text-base ${
                                activeSection === 'history'
                                    ? 'bg-green-600 text-white shadow-md'
                                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-green-50 hover:text-green-600 hover:border-green-200'
                            }`}
                        >
                            <MessageSquare size={18} className="mr-2" />
                            <span className="hidden sm:inline">History</span>
                            <span className="sm:hidden">History</span>
                        </button>
                    </div>

                    {/* Main Content Area */}
                    <div>
                        {/* Upload Section */}
                        {activeSection === 'upload' && (
                            <UploadComponent onAnalysisComplete={handleAnalysisComplete} />
                        )}

                        {/* Risk Analysis Section */}
                        {activeSection === 'risk-analysis' && (
                            <RiskAnalysisComponent uploadData={uploadData} />
                        )}

                        {/* History Section */}
                        {activeSection === 'history' && (
                            <HistoryComponent />
                        )}
                    </div>
                </div>
            </div>

        </div>
    )
}

export default Dashboard
