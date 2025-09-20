import React, { useState, useEffect } from 'react'
import { MessageSquare, Send, Star, TrendingUp, CheckCircle, AlertTriangle, Clock, User, Calendar } from 'lucide-react'
import { toast } from 'react-toastify'
import axios from 'axios'

const FeedbackComponent = () => {
    const [feedbackForm, setFeedbackForm] = useState({
        customerId: '',
        mlResultId: '',
        feedback: '',
        rating: 5,
        riskOverride: '',
        overrideReason: ''
    })
    const [recentDecisions, setRecentDecisions] = useState([])
    const [systemMetrics, setSystemMetrics] = useState({
        totalDecisions: 0,
        approvedCount: 0,
        rejectedCount: 0,
        pendingCount: 0,
        averageProcessingTime: 0,
        modelAccuracy: 0
    })
    const [submitting, setSubmitting] = useState(false)
    const [pendingDecisions, setPendingDecisions] = useState([])
    useEffect(() => {
        fetchRecentDecisions()
        fetchPendingDecisions()
    }, [])

    const fetchRecentDecisions = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await axios.get('http://localhost:6969/api/files/my-decisions', {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (response.data.success) {
                const decisions = response.data.data.decisions
                setRecentDecisions(decisions)
                
                // Calculate metrics
                const metrics = {
                    totalDecisions: decisions.length,
                    approvedCount: decisions.filter(d => d.decision === 'APPROVED').length,
                    rejectedCount: decisions.filter(d => d.decision === 'REJECTED').length,
                    pendingCount: decisions.filter(d => d.decision === 'NEEDS_REVIEW').length,
                    averageProcessingTime: 2.3, // Mock data
                    modelAccuracy: 94.5 // Mock data
                }
                setSystemMetrics(metrics)
            }
        } catch (error) {
            console.error('Error fetching decisions:', error)
            toast.error('Failed to load decision history')
        }
    }

    const fetchPendingDecisions = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await axios.get('http://localhost:6969/api/files/pending-decisions', {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (response.data.success) {
                setPendingDecisions(response.data.data.pending_decisions)
            }
        } catch (error) {
            console.error('Error fetching pending decisions:', error)
        }
    }

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault()
        
        if (!feedbackForm.customerId || !feedbackForm.feedback) {
            toast.error('Please fill in customer ID and feedback')
            return
        }

        if (submitting) {
            toast.warning('Submission already in progress...')
            return
        }

        setSubmitting(true)

        try {
            const token = localStorage.getItem('token')
            
            // Submit feedback through decision endpoint
            const response = await axios.post(
                `http://localhost:6969/api/files/decision/${feedbackForm.customerId}`,
                {
                    mlResultId: feedbackForm.mlResultId,
                    decision: 'FEEDBACK_PROVIDED',
                    feedback: feedbackForm.feedback,
                    riskOverride: feedbackForm.riskOverride,
                    overrideReason: feedbackForm.overrideReason
                },
                { headers: { Authorization: `Bearer ${token}` } }
            )

            if (response.data.success) {
                toast.success('Feedback submitted successfully!')
                setFeedbackForm({
                    customerId: '',
                    mlResultId: '',
                    feedback: '',
                    rating: 5,
                    riskOverride: '',
                    overrideReason: ''
                })
                fetchRecentDecisions() // Refresh data
            } else {
                toast.error(response.data.message || 'Failed to submit feedback')
            }
        } catch (error) {
            console.error('Feedback error:', error)
            toast.error(error.response?.data?.message || 'Failed to submit feedback')
        } finally {
            setSubmitting(false)
        }
    }

    const MetricCard = ({ title, value, icon: Icon, color, subtitle }) => (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
                <div className={`p-2 ${color} rounded-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
                </div>
            </div>
        </div>
    )

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Feedback & Reports</h1>
                <p className="text-gray-600">Provide feedback on ML decisions and view system performance</p>
            </div>

            {/* System Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Total Decisions"
                    value={systemMetrics.totalDecisions}
                    icon={MessageSquare}
                    color="bg-blue-500"
                />
                <MetricCard
                    title="Approved"
                    value={systemMetrics.approvedCount}
                    icon={CheckCircle}
                    color="bg-green-500"
                />
                <MetricCard
                    title="Rejected"
                    value={systemMetrics.rejectedCount}
                    icon={AlertTriangle}
                    color="bg-red-500"
                />
                <MetricCard
                    title="Pending Review"
                    value={systemMetrics.pendingCount}
                    icon={Clock}
                    color="bg-yellow-500"
                />
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">System Performance</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">ML Model Accuracy</span>
                            <span className="text-lg font-semibold text-green-600">{systemMetrics.modelAccuracy}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${systemMetrics.modelAccuracy}%` }}
                            ></div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Avg Processing Time</span>
                            <span className="text-lg font-semibold text-blue-600">{systemMetrics.averageProcessingTime}s</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Queue Status</span>
                            <span className="text-lg font-semibold text-yellow-600">{pendingDecisions.length} pending</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Decision Distribution</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                <span className="text-sm text-gray-600">Approved</span>
                            </div>
                            <span className="text-sm font-medium">{systemMetrics.approvedCount}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                                <span className="text-sm text-gray-600">Rejected</span>
                            </div>
                            <span className="text-sm font-medium">{systemMetrics.rejectedCount}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                                <span className="text-sm text-gray-600">Under Review</span>
                            </div>
                            <span className="text-sm font-medium">{systemMetrics.pendingCount}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feedback Form */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Submit Feedback</h3>
                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Customer ID *
                            </label>
                            <input
                                type="text"
                                value={feedbackForm.customerId}
                                onChange={(e) => setFeedbackForm(prev => ({ ...prev, customerId: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Enter customer ID"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                ML Result ID (Optional)
                            </label>
                            <input
                                type="text"
                                value={feedbackForm.mlResultId}
                                onChange={(e) => setFeedbackForm(prev => ({ ...prev, mlResultId: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Enter ML result ID"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Feedback *
                        </label>
                        <textarea
                            value={feedbackForm.feedback}
                            onChange={(e) => setFeedbackForm(prev => ({ ...prev, feedback: e.target.value }))}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Provide detailed feedback on the ML decision, document quality, or any concerns..."
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Risk Override (Optional)
                            </label>
                            <select
                                value={feedbackForm.riskOverride}
                                onChange={(e) => setFeedbackForm(prev => ({ ...prev, riskOverride: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <option value="">No Override</option>
                                <option value="LOW_RISK">Override to Low Risk</option>
                                <option value="MEDIUM_RISK">Override to Medium Risk</option>
                                <option value="HIGH_RISK">Override to High Risk</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Rating
                            </label>
                            <div className="flex items-center space-x-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setFeedbackForm(prev => ({ ...prev, rating: star }))}
                                        className={`p-1 ${
                                            star <= feedbackForm.rating 
                                                ? 'text-yellow-400' 
                                                : 'text-gray-300'
                                        }`}
                                    >
                                        <Star size={20} fill="currentColor" />
                                    </button>
                                ))}
                                <span className="ml-2 text-sm text-gray-600">
                                    {feedbackForm.rating}/5
                                </span>
                            </div>
                        </div>
                    </div>

                    {feedbackForm.riskOverride && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Override Reason *
                            </label>
                            <textarea
                                value={feedbackForm.overrideReason}
                                onChange={(e) => setFeedbackForm(prev => ({ ...prev, overrideReason: e.target.value }))}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Explain why you are overriding the ML risk assessment..."
                                required
                            />
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors duration-200"
                        >
                            {submitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send size={16} className="mr-2" />
                                    Submit Feedback
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Recent Decisions */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Recent Decisions</h3>
                </div>
                <div className="divide-y divide-gray-200">
                    {recentDecisions.slice(0, 10).map((decision, index) => (
                        <div key={index} className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <User size={20} className="text-gray-400" />
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900">{decision.person_name}</h4>
                                        <p className="text-sm text-gray-500">Customer ID: {decision.customer_id}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        decision.decision === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                        decision.decision === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {decision.decision}
                                    </span>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Calendar size={14} className="mr-1" />
                                        {new Date(decision.decision_timestamp).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                            {decision.notes && (
                                <p className="mt-2 text-sm text-gray-600">{decision.notes}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default FeedbackComponent
