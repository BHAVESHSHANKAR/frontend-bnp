import React, { useState, useEffect } from 'react'
import { Shield, TrendingUp, AlertTriangle, CheckCircle, Clock, Eye, FileText, User, Phone, X } from 'lucide-react'
import { toast } from 'react-toastify'
import axios from 'axios'

// Track if rate limit toast is already shown to prevent multiple toasts
let rateLimitToastShown = false;

// Add response interceptor to handle rate limiting
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 429 && !rateLimitToastShown) {
            rateLimitToastShown = true;
            const retryAfter = error.response.data?.retryAfter || 45
            toast.error(`Please wait ${retryAfter} seconds before trying again.`, {
                autoClose: 8000,
                toastId: 'rate-limit' // Prevent duplicate toasts
            })
            // Reset flag after the wait time
            setTimeout(() => {
                rateLimitToastShown = false;
            }, retryAfter * 1000)
        }
        return Promise.reject(error)
    }
)

const RiskAnalysisComponent = ({ uploadData }) => {
    const [loading, setLoading] = useState(false)
    const [loadingFeedback, setLoadingFeedback] = useState(null) // Track which customer is loading
    const [loadingDecision, setLoadingDecision] = useState(null) // Track which decision button is loading
    const [pendingDecisions, setPendingDecisions] = useState([])
    const [selectedCustomer, setSelectedCustomer] = useState(null)
    const [mlResults, setMlResults] = useState(null)
    const [decisionStatuses, setDecisionStatuses] = useState({})
    const [showFeedbackPopup, setShowFeedbackPopup] = useState(false)
    const [currentCustomerData, setCurrentCustomerData] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(4)
    const [riskStats, setRiskStats] = useState({
        low: 0,
        medium: 0,
        high: 0,
        total: 0,
        actualScores: [] // Store actual risk scores for accurate average calculation
    })
    const [recentUploads, setRecentUploads] = useState([])
    const [fetchingUploads, setFetchingUploads] = useState(false)

    useEffect(() => {
        fetchPendingDecisions()
        fetchRecentUploads() // Fetch recent uploads for accurate risk distribution
        if (uploadData) {
            // If we have upload data, fetch ML results for that customer
            fetchMLResults(uploadData.customerId)
            // Refresh risk stats after new upload
            setTimeout(() => {
                fetchRecentUploads()
            }, 2000) // Wait 2 seconds for ML processing to complete
        }
    }, [uploadData])

    // Refresh data every 30 seconds to avoid overwhelming server
    useEffect(() => {
        const interval = setInterval(() => {
            // Only refresh if not currently fetching to prevent overlapping requests
            if (!fetchingUploads) {
                console.log('🔄 Auto-refreshing risk data...')
                fetchRecentUploads()
                fetchPendingDecisions()
            } else {
                console.log('⏳ Skipping refresh - already fetching data')
            }
        }, 30000) // 30 seconds

        return () => clearInterval(interval)
    }, [fetchingUploads])

    const fetchRecentUploads = async () => {
        // Prevent multiple simultaneous calls
        if (fetchingUploads) {
            console.log('📊 Already fetching uploads, skipping...')
            return
        }

        setFetchingUploads(true)
        try {
            const token = localStorage.getItem('token')
            
            // Try to get recent uploads from my-uploads endpoint
            const response = await axios.get('http://localhost:6969/api/files/my-uploads', {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (response.data.success) {
                const uploads = response.data.data.files || []
                setRecentUploads(uploads)
                
                // Calculate risk statistics from uploads with ML results
                const stats = { low: 0, medium: 0, high: 0, total: 0, actualScores: [] }
                
                // Get ML results for each customer and calculate risk distribution
                const processedCustomers = new Set()
                
                for (const upload of uploads) {
                    const customerId = upload.customer_id
                    
                    // Avoid counting the same customer multiple times
                    if (!processedCustomers.has(customerId)) {
                        processedCustomers.add(customerId)
                        
                        try {
                            // Fetch ML results for this customer
                            const mlResponse = await axios.get(`http://localhost:6969/api/files/ml-results/${customerId}`, {
                                headers: { Authorization: `Bearer ${token}` }
                            })
                            
                            if (mlResponse.data.success && mlResponse.data.data.ml_results.length > 0) {
                                const mlResult = mlResponse.data.data.ml_results[0]
                                // Use the extracted overall_risk_score from the database query
                                const riskScore = mlResult.overall_risk_score || 0
                                
                                console.log(`Customer ${customerId}: Risk Score = ${riskScore} (Status: ${mlResult.overall_status}, Category: ${mlResult.risk_category})`)
                                
                                // Store actual risk score for accurate average calculation
                                stats.actualScores.push(riskScore)
                                
                                // Categorize based on ML backend logic (corrected thresholds)
                                if (riskScore <= 39) {
                                    stats.low++
                                } else if (riskScore <= 69) {
                                    stats.medium++
                                } else {
                                    stats.high++
                                }
                                stats.total++
                            }
                        } catch (mlError) {
                            console.log(`No ML results found for customer ${customerId}`)
                        }
                    }
                }
                
                console.log('📊 Updated Risk Stats:', stats)
                console.log('📊 Processed customers:', Array.from(processedCustomers))
                console.log('📊 Total uploads found:', uploads.length)
                setRiskStats(stats)
            }
        } catch (error) {
            console.error('Error fetching recent uploads:', error)
            // Fallback to pending decisions if my-uploads fails
            console.log('Falling back to pending decisions for risk stats')
        } finally {
            setFetchingUploads(false)
        }
    }

    const fetchPendingDecisions = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await axios.get('http://localhost:6969/api/files/pending-decisions', {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (response.data.success) {
                const decisions = response.data.data.pending_decisions
                setPendingDecisions(decisions)
                
                // Only calculate risk statistics from pending decisions if we don't have recent uploads
                if (recentUploads.length === 0) {
                    const stats = decisions.reduce((acc, item) => {
                        const score = item.overall_risk_score || 0
                        
                        // Store actual risk score for accurate average calculation
                        acc.actualScores.push(score)
                        
                        // Use proper ML backend risk categorization
                        if (score <= 39) acc.low++
                        else if (score <= 69) acc.medium++
                        else acc.high++
                        acc.total++
                        return acc
                    }, { low: 0, medium: 0, high: 0, total: 0, actualScores: [] })
                    
                    console.log('📊 Fallback Risk Stats from Pending Decisions:', stats)
                    setRiskStats(stats)
                }
                
                // Fetch decision statuses for each customer
                await fetchDecisionStatuses(decisions)
            }
        } catch (error) {
            console.error('Error fetching pending decisions:', error)
            toast.error('Failed to load pending decisions')
        } finally {
            setLoading(false)
        }
    }

    const fetchDecisionStatuses = async (decisions) => {
        try {
            const token = localStorage.getItem('token')
            const statuses = {}
            
            // Check each customer for existing decisions
            for (const decision of decisions) {
                try {
                    const response = await axios.get(`http://localhost:6969/api/files/ml-results/${decision.customer_id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                    
                    if (response.data.success && response.data.data.ml_results.length > 0) {
                        const mlResult = response.data.data.ml_results[0]
                        if (mlResult.decision && mlResult.feedback) {
                            statuses[decision.customer_id] = {
                                hasFeedback: true,
                                decision: mlResult.decision,
                                feedback: mlResult.feedback
                            }
                        } else {
                            statuses[decision.customer_id] = {
                                hasFeedback: false,
                                decision: mlResult.decision || null,
                                feedback: null
                            }
                        }
                    } else {
                        statuses[decision.customer_id] = {
                            hasFeedback: false,
                            decision: null,
                            feedback: null
                        }
                    }
                } catch (error) {
                    // If error, assume no feedback
                    statuses[decision.customer_id] = {
                        hasFeedback: false,
                        decision: null,
                        feedback: null
                    }
                }
            }
            
            setDecisionStatuses(statuses)
        } catch (error) {
            console.error('Error fetching decision statuses:', error)
        }
    }

    const openFeedbackPopup = async (customerData) => {
        setLoadingFeedback(customerData.customer_id)
        try {
            const token = localStorage.getItem('token')
            const response = await axios.get(`http://localhost:6969/api/files/ml-results/${customerData.customer_id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (response.data.success) {
                const customerDataWithResults = {
                    ...customerData,
                    customer_id: customerData.customer_id, // Ensure customer_id is explicitly set
                    mlResults: response.data.data
                }
                
                console.log('📋 Setting current customer data:', {
                    original_customerData: customerData,
                    final_customerData: customerDataWithResults,
                    has_customer_id: !!customerDataWithResults.customer_id,
                    ml_results_count: response.data.data.ml_results?.length || 0
                })
                
                setCurrentCustomerData(customerDataWithResults)
                setShowFeedbackPopup(true)
            } else {
                toast.error('No ML results found for this customer')
            }
        } catch (error) {
            console.error('Error fetching ML results:', error)
            toast.error('Failed to load ML results')
        } finally {
            setLoadingFeedback(null)
        }
    }


    const closeFeedbackPopup = () => {
        // Prevent closing if a decision is being processed
        if (loadingDecision) {
            toast.info('Please wait for the current decision to complete')
            return
        }
        
        console.log('📋 Closing feedback popup and clearing customer data')
        setShowFeedbackPopup(false)
        setCurrentCustomerData(null)
    }

    const fetchMLResults = async (customerId) => {
        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            const response = await axios.get(`http://localhost:6969/api/files/ml-results/${customerId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (response.data.success) {
                setMlResults(response.data.data)
                setSelectedCustomer(customerId)
            } else {
                toast.error('No ML results found for this customer')
            }
        } catch (error) {
            console.error('Error fetching ML results:', error)
            toast.error('Failed to load ML results')
        } finally {
            setLoading(false)
        }
    }

    const handleDecisionWithFeedback = async (mlResultId, decision) => {
        setLoadingDecision(`${mlResultId}-${decision}`) // Set loading for specific button
        try {
            const feedbackElement = document.getElementById(`feedback-${mlResultId}`)
            const feedback = feedbackElement ? feedbackElement.value.trim() : ''
            
            // Validate feedback is provided
            if (!feedback) {
                toast.error('Feedback is required for all decisions')
                return
            }

            // Get customer ID from current customer data with multiple fallback methods
            let customerId = currentCustomerData?.customer_id
            
            // Fallback 1: Try to get from ML results
            if (!customerId && currentCustomerData?.mlResults?.ml_results?.length > 0) {
                customerId = currentCustomerData.mlResults.ml_results[0].customer_id
            }
            
            // Fallback 2: Try to get from pending decisions list
            if (!customerId && pendingDecisions.length > 0) {
                const matchingDecision = pendingDecisions.find(decision => decision.id === mlResultId)
                if (matchingDecision) {
                    customerId = matchingDecision.customer_id
                }
            }
            
            console.log('🔍 Customer ID resolution:', {
                from_currentCustomerData: currentCustomerData?.customer_id,
                from_mlResults: currentCustomerData?.mlResults?.ml_results?.[0]?.customer_id,
                final_customerId: customerId,
                mlResultId: mlResultId,
                currentCustomerData: currentCustomerData
            })
            
            if (!customerId) {
                toast.error('Customer ID not found. Please close and reopen the feedback popup.')
                console.error('❌ Customer ID resolution failed:', {
                    currentCustomerData,
                    pendingDecisions: pendingDecisions.slice(0, 2), // Log first 2 for debugging
                    mlResultId
                })
                return
            }

            const token = localStorage.getItem('token')
            
            // Debug: Log all the data being sent
            console.log(`📝 Submitting decision:`, {
                decision: decision,
                customerId: customerId,
                mlResultId: mlResultId,
                feedback: feedback.substring(0, 50) + '...',
                endpoint: `http://localhost:6969/api/files/decision/${customerId}`,
                currentCustomerData: currentCustomerData
            })
            
            const requestData = { 
                mlResultId: mlResultId,
                decision: decision, 
                feedback: feedback 
            }
            
            console.log(`📤 Request payload:`, requestData)
            
            const response = await axios.post(
                `http://localhost:6969/api/files/decision/${customerId}`,
                requestData,
                { headers: { Authorization: `Bearer ${token}` } }
            )

            if (response.data.success) {
                toast.success(`Decision "${decision}" recorded successfully with feedback`)
                
                // Clear feedback textarea
                if (feedbackElement) {
                    feedbackElement.value = ''
                }
                
                // Close popup and refresh data
                closeFeedbackPopup()
                fetchPendingDecisions() // Refresh data
                if (selectedCustomer) {
                    fetchMLResults(selectedCustomer) // Refresh ML results
                }
            } else {
                toast.error(response.data.message || 'Failed to record decision')
            }
        } catch (error) {
            console.error('❌ Decision submission error:', error)
            console.error('❌ Error response:', error.response?.data)
            
            let errorMessage = 'Failed to record decision'
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message
            } else if (error.response?.data?.available_ml_results) {
                errorMessage = `${error.response.data.message}. Available ML results: ${error.response.data.available_ml_results.map(r => r.id).join(', ')}`
            } else if (error.message) {
                errorMessage = error.message
            }
            
            toast.error(errorMessage)
        } finally {
            setLoadingDecision(null) // Clear loading state
        }
    }

    const getRiskColor = (score) => {
        // Match ML backend risk categorization exactly
        if (score >= 70) return 'text-red-600 bg-red-100'
        if (score >= 40) return 'text-yellow-600 bg-yellow-100'
        return 'text-green-600 bg-green-100'
    }

    const getRiskLabel = (score) => {
        // Match ML backend risk categorization exactly
        if (score >= 70) return 'High Risk'
        if (score >= 40) return 'Medium Risk'
        return 'Low Risk'
    }

    const getRiskLevel = (score) => {
        // Match ML backend get_risk_level function
        if (score === 0) return 'MINIMAL'
        if (score <= 25) return 'LOW'
        if (score <= 50) return 'MEDIUM'
        if (score <= 75) return 'HIGH'
        return 'CRITICAL'
    }

    // Pagination functions
    const getPaginatedDecisions = () => {
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        return pendingDecisions.slice(startIndex, endIndex)
    }

    const getTotalPages = () => {
        return Math.ceil(pendingDecisions.length / itemsPerPage)
    }

    const goToPage = (page) => {
        setCurrentPage(page)
    }

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1)
        }
    }

    const goToNextPage = () => {
        if (currentPage < getTotalPages()) {
            setCurrentPage(currentPage + 1)
        }
    }

    const RiskChart = ({ stats }) => {
        const total = stats.total || 1
        const lowPercent = (stats.low / total) * 100
        const mediumPercent = (stats.medium / total) * 100
        const highPercent = (stats.high / total) * 100

        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Risk Distribution</span>
                    <span className="text-sm text-gray-500">{total} total cases</span>
                </div>
                
                {/* Enhanced Progress Bar with better visibility */}
                <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden shadow-inner">
                    <div className="h-full flex">
                        {stats.low > 0 && (
                            <div 
                                className="bg-green-500 flex items-center justify-center text-white text-xs font-medium" 
                                style={{ width: `${lowPercent}%`, minWidth: lowPercent > 10 ? 'auto' : '0px' }}
                            >
                                {lowPercent > 15 ? `${Math.round(lowPercent)}%` : ''}
                            </div>
                        )}
                        {stats.medium > 0 && (
                            <div 
                                className="bg-yellow-500 flex items-center justify-center text-white text-xs font-medium" 
                                style={{ width: `${mediumPercent}%`, minWidth: mediumPercent > 10 ? 'auto' : '0px' }}
                            >
                                {mediumPercent > 15 ? `${Math.round(mediumPercent)}%` : ''}
                            </div>
                        )}
                        {stats.high > 0 && (
                            <div 
                                className="bg-red-500 flex items-center justify-center text-white text-xs font-medium" 
                                style={{ width: `${highPercent}%`, minWidth: highPercent > 10 ? 'auto' : '0px' }}
                            >
                                {highPercent > 15 ? `${Math.round(highPercent)}%` : ''}
                            </div>
                        )}
                    </div>
                </div>

                {/* Enhanced Legend with percentages */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                            <span className="font-medium">Low</span>
                        </div>
                        <div className="text-right">
                            <div className="font-bold text-green-700">{stats.low}</div>
                            <div className="text-xs text-green-600">{Math.round(lowPercent)}%</div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                            <span className="font-medium">Medium</span>
                        </div>
                        <div className="text-right">
                            <div className="font-bold text-yellow-700">{stats.medium}</div>
                            <div className="text-xs text-yellow-600">{Math.round(mediumPercent)}%</div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                            <span className="font-medium">High</span>
                        </div>
                        <div className="text-right">
                            <div className="font-bold text-red-700">{stats.high}</div>
                            <div className="text-xs text-red-600">{Math.round(highPercent)}%</div>
                        </div>
                    </div>
                </div>

                {/* Risk Score Ranges */}
                <div className="mt-4 p-3 bg-gray-50 rounded text-xs">
                    <div className="font-medium text-gray-700 mb-2">Risk Score Ranges:</div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="text-green-600">
                            <div className="font-medium">Low Risk</div>
                            <div>0-39 points</div>
                        </div>
                        <div className="text-yellow-600">
                            <div className="font-medium">Medium Risk</div>
                            <div>40-69 points</div>
                        </div>
                        <div className="text-red-600">
                            <div className="font-medium">High Risk</div>
                            <div>70-100 points</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Risk Analysis Dashboard</h1>
                <p className="text-gray-600">Review ML-powered risk assessments and make decisions</p>
            </div>

            {/* Risk Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Total Cases</p>
                            <p className="text-2xl font-bold text-gray-900">{riskStats.total}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Low Risk</p>
                            <p className="text-2xl font-bold text-gray-900">{riskStats.low}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Clock className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Medium Risk</p>
                            <p className="text-2xl font-bold text-gray-900">{riskStats.medium}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">High Risk</p>
                            <p className="text-2xl font-bold text-gray-900">{riskStats.high}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Risk Distribution Chart */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Risk Distribution Chart</h3>
                    <div className="flex space-x-2">
                        <button
                            onClick={async () => {
                                toast.info('Refreshing risk statistics...')
                                // Clear current stats to show loading state
                                setRiskStats({ low: 0, medium: 0, high: 0, total: 0, actualScores: [] })
                                setRecentUploads([])
                                
                                // Force refresh both data sources
                                await fetchRecentUploads()
                                await fetchPendingDecisions()
                                
                                toast.success('Risk statistics updated!')
                            }}
                            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        >
                            🔄 Refresh
                        </button>
                        <button
                            onClick={async () => {
                                try {
                                    const token = localStorage.getItem('token')
                                    const response = await axios.get('http://localhost:6969/api/files/debug/risk-data', {
                                        headers: { Authorization: `Bearer ${token}` }
                                    })
                                    console.log('🔍 Debug Risk Data:', response.data)
                                    toast.info('Check console for debug data')
                                } catch (error) {
                                    console.error('Debug error:', error)
                                    toast.error('Debug failed')
                                }
                            }}
                            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                        >
                            🐛 Debug
                        </button>
                    </div>
                </div>
                <RiskChart stats={riskStats} />
                
                {/* Risk Statistics Summary */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{riskStats.low}</div>
                            <div className="text-sm text-gray-600">Low Risk</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600">{riskStats.medium}</div>
                            <div className="text-sm text-gray-600">Medium Risk</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{riskStats.high}</div>
                            <div className="text-sm text-gray-600">High Risk</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                {riskStats.actualScores && riskStats.actualScores.length > 0 ? 
                                    Math.round((riskStats.actualScores.reduce((sum, score) => sum + score, 0) / riskStats.actualScores.length) * 10) / 10
                                    : 0}
                            </div>
                            <div className="text-sm text-gray-600">Avg Score</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ML Results Display */}
            {mlResults && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        ML Analysis Results - Customer {selectedCustomer}
                    </h3>
                    
                    {mlResults.ml_results.map((result, index) => (
                        <div key={index} className="border rounded-lg p-4 mb-4">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <User size={20} className="text-gray-500" />
                                    <div>
                                        <h4 className="font-medium text-gray-900">{result.person_name}</h4>
                                        <p className="text-sm text-gray-500">
                                            <Phone size={14} className="inline mr-1" />
                                            {result.mobile_number}
                                        </p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getRiskColor(result.overall_risk_score)}`}>
                                    Risk Score: {result.overall_risk_score}/100
                                </span>
                            </div>

                            {/* Individual File Results */}
                            {result.individual_results && result.individual_results.length > 0 && (
                                <div className="mb-4">
                                    <h5 className="font-medium text-gray-900 mb-2">File Analysis:</h5>
                                    <div className="space-y-2">
                                        {result.individual_results.map((fileResult, fileIndex) => (
                                            <div key={fileIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                <span className="text-sm text-gray-700">{fileResult.file || `File ${fileIndex + 1}`}</span>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm font-medium">{fileResult.risk_score}/100</span>
                                                    <span className={`px-2 py-1 text-xs rounded ${
                                                        fileResult.status === 'Verified' ? 'bg-green-100 text-green-800' :
                                                        fileResult.status === 'Flagged' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {fileResult.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Overall Assessment */}
                            {(result.overall_risk_score !== undefined || result.overall_status || result.risk_category) && (
                                <div className="mb-4">
                                    <h5 className="font-medium text-gray-900 mb-2">Overall Assessment:</h5>
                                    <div className="bg-gray-50 p-3 rounded">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium">Status:</span>
                                                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                                                    result.overall_status === 'VERIFIED' ? 'bg-green-100 text-green-800' :
                                                    result.overall_status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                    result.overall_status === 'FLAGGED' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {result.overall_status || 'PENDING'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="font-medium">Risk Category:</span>
                                                <span className="ml-2">{result.risk_category || 'Not Available'}</span>
                                            </div>
                                            <div>
                                                <span className="font-medium">Score:</span>
                                                <span className="ml-2">{result.overall_risk_score || 0}/100</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Processing Summary */}
                            {result.processing_summary && (
                                <div className="mb-4">
                                    <h5 className="font-medium text-gray-900 mb-2">Processing Summary:</h5>
                                    <div className="text-sm text-gray-600">
                                        <p>Total Files: {result.processing_summary.total_files}</p>
                                        <p>Successfully Processed: {result.processing_summary.successful_processing}</p>
                                        <p>Failed Processing: {result.processing_summary.failed_processing}</p>
                                    </div>
                                </div>
                            )}

                            {/* Decision Actions with Feedback */}
                            <div className="pt-4 border-t">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Add Feedback <span className="text-red-500">*</span>
                                        <span className="text-xs text-gray-500 block">Required for Accept/Reject decisions</span>
                                    </label>
                                    <textarea
                                        id={`feedback-${result.id}`}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        placeholder="Provide detailed feedback about your decision (required)..."
                                        required
                                    />
                                </div>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => handleDecisionWithFeedback(result.id, 'APPROVED')}
                                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                    >
                                        <CheckCircle size={16} className="mr-2" />
                                        Accept
                                    </button>
                                    <button
                                        onClick={() => handleDecisionWithFeedback(result.id, 'REJECTED')}
                                        className="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                    >
                                        <AlertTriangle size={16} className="mr-2" />
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pending Decisions Table */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Pending Decisions</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Risk Score
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {getPaginatedDecisions().map((item, index) => {
                                const status = decisionStatuses[item.customer_id] || { hasFeedback: false }
                                return (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{item.person_name}</div>
                                                <div className="text-sm text-gray-500">ID: {item.customer_id}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(item.overall_risk_score)}`}>
                                                {item.overall_risk_score}/100
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(item.overall_risk_score)}`}>
                                                {getRiskLabel(item.overall_risk_score)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            {status.hasFeedback ? (
                                                <button
                                                    className="inline-flex items-center px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full cursor-default"
                                                    disabled
                                                >
                                                    <CheckCircle size={14} className="mr-1" />
                                                    Feedback Done
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => openFeedbackPopup(item)}
                                                    disabled={loadingFeedback === item.customer_id}
                                                    className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full transition-colors cursor-pointer ${
                                                        loadingFeedback === item.customer_id
                                                            ? 'text-gray-500 bg-gray-100 cursor-wait'
                                                            : 'text-blue-700 bg-blue-100 hover:bg-blue-200'
                                                    }`}
                                                >
                                                    {loadingFeedback === item.customer_id ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-500 mr-1"></div>
                                                            Loading...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FileText size={14} className="mr-1" />
                                                            Feedback
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination Controls */}
                {pendingDecisions.length > itemsPerPage && (
                    <div className="px-6 py-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, pendingDecisions.length)} of {pendingDecisions.length} results
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={goToPreviousPage}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                
                                {/* Page Numbers */}
                                <div className="flex space-x-1">
                                    {Array.from({ length: getTotalPages() }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => goToPage(page)}
                                            className={`px-3 py-1 text-sm border rounded ${
                                                currentPage === page
                                                    ? 'bg-green-600 text-white border-green-600'
                                                    : 'border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>
                                
                                <button
                                    onClick={goToNextPage}
                                    disabled={currentPage === getTotalPages()}
                                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {loading && (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    <span className="ml-2 text-gray-600">Loading ML results...</span>
                </div>
            )}

            {/* Feedback Popup Modal */}
            {showFeedbackPopup && currentCustomerData && (
                <div className="fixed inset-0 bg-white/20 backdrop-blur-lg flex items-center justify-center z-50 p-4">
                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/30">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Risk Analysis & Feedback</h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    Customer: {currentCustomerData.person_name} (ID: {currentCustomerData.customer_id})
                                </p>
                            </div>
                            <button
                                onClick={closeFeedbackPopup}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            {currentCustomerData.mlResults && currentCustomerData.mlResults.ml_results && currentCustomerData.mlResults.ml_results.length > 0 ? (
                                currentCustomerData.mlResults.ml_results.map((result, index) => (
                                    <div key={index} className="bg-white/60 backdrop-blur-md rounded-xl shadow-lg border border-white/40 mb-6">
                                        {/* Risk Assessment Header */}
                                        <div className="bg-white/40 backdrop-blur-sm px-6 py-4 border-b border-white/30">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-lg font-medium text-gray-900">Risk Assessment Results</h3>
                                                    <p className="text-sm text-gray-600">Overall Risk Score: {result.overall_risk_score}/100</p>
                                                </div>
                                                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(result.overall_risk_score)}`}>
                                                    {getRiskLabel(result.overall_risk_score)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Individual File Results */}
                                        {result.individual_results && result.individual_results.length > 0 && (
                                            <div className="p-6 border-b border-white/30">
                                                <h4 className="text-md font-medium text-gray-900 mb-4">Individual File Analysis</h4>
                                                <div className="grid gap-4">
                                                    {result.individual_results.map((fileResult, fileIndex) => (
                                                        <div key={fileIndex} className="bg-white/50 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="font-medium text-gray-900">{fileResult.file}</span>
                                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(fileResult.risk_score)}`}>
                                                                    {fileResult.risk_score}/100
                                                                </span>
                                                            </div>
                                                            <div className="text-sm text-gray-600">
                                                                Status: {fileResult.status} | Risk Level: {fileResult.risk_level}
                                                            </div>
                                                            {fileResult.risk_details && fileResult.risk_details.length > 0 && (
                                                                <div className="mt-2">
                                                                    <p className="text-xs text-gray-500 mb-1">Risk Factors:</p>
                                                                    <ul className="text-xs text-gray-600 list-disc list-inside">
                                                                        {fileResult.risk_details.map((detail, detailIndex) => (
                                                                            <li key={detailIndex}>{detail}</li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Decision Actions with Feedback */}
                                        <div className="p-6">
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Add Feedback <span className="text-red-500">*</span>
                                                    <span className="text-xs text-gray-500 block">Required for Accept/Reject decisions</span>
                                                </label>
                                                <textarea
                                                    id={`feedback-${result.id}`}
                                                    rows={4}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                    placeholder="Provide detailed feedback about your decision (required)..."
                                                    required
                                                />
                                            </div>
                                            <div className="flex space-x-3">
                                                <button
                                                    onClick={() => handleDecisionWithFeedback(result.id, 'APPROVED')}
                                                    disabled={loadingDecision === `${result.id}-APPROVED`}
                                                    className={`flex items-center px-4 py-2 rounded transition-colors ${
                                                        loadingDecision === `${result.id}-APPROVED`
                                                            ? 'bg-gray-400 cursor-not-allowed'
                                                            : 'bg-green-600 hover:bg-green-700'
                                                    } text-white`}
                                                >
                                                    {loadingDecision === `${result.id}-APPROVED` ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle size={16} className="mr-2" />
                                                            Accept
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleDecisionWithFeedback(result.id, 'REJECTED')}
                                                    disabled={loadingDecision === `${result.id}-REJECTED`}
                                                    className={`flex items-center px-4 py-2 rounded transition-colors ${
                                                        loadingDecision === `${result.id}-REJECTED`
                                                            ? 'bg-gray-400 cursor-not-allowed'
                                                            : 'bg-red-600 hover:bg-red-700'
                                                    } text-white`}
                                                >
                                                    {loadingDecision === `${result.id}-REJECTED` ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <AlertTriangle size={16} className="mr-2" />
                                                            Reject
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleDecisionWithFeedback(result.id, 'REVIEW_REQUIRED')}
                                                    disabled={loadingDecision === `${result.id}-REVIEW_REQUIRED`}
                                                    className={`flex items-center px-4 py-2 rounded transition-colors ${
                                                        loadingDecision === `${result.id}-REVIEW_REQUIRED`
                                                            ? 'bg-gray-400 cursor-not-allowed'
                                                            : 'bg-yellow-600 hover:bg-yellow-700'
                                                    } text-white`}
                                                >
                                                    {loadingDecision === `${result.id}-REVIEW_REQUIRED` ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Clock size={16} className="mr-2" />
                                                            Review Required
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No ML Results Found</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        No risk analysis results available for this customer.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

export default RiskAnalysisComponent
