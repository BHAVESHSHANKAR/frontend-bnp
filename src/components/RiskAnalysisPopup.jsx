import React, { useState, useEffect } from 'react'
import { X, FileText, AlertTriangle, CheckCircle, Clock, Eye, Download, Send } from 'lucide-react'
import { toast } from 'react-toastify'
import axios from 'axios'

const RiskAnalysisPopup = ({ isOpen, onClose, customerData }) => {
    const [mlResults, setMlResults] = useState(null)
    const [loading, setLoading] = useState(false)
    const [sendingToExpress, setSendingToExpress] = useState(false)
    const [selectedFileDetails, setSelectedFileDetails] = useState(null)

    useEffect(() => {
        if (isOpen && customerData) {
            fetchDetailedMLResults()
        }
    }, [isOpen, customerData])

    const fetchDetailedMLResults = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            const response = await axios.get(`${import.meta.env.VITE_API}/api/files/ml-results/${customerData.customer_id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (response.data.success) {
                setMlResults(response.data.data)
            } else {
                toast.error('Failed to load ML results')
            }
        } catch (error) {
            console.error('Error fetching ML results:', error)
            toast.error('Failed to load ML results')
        } finally {
            setLoading(false)
        }
    }

    const getRiskColor = (score) => {
        if (score >= 70) return 'text-red-600 bg-red-100'
        if (score >= 40) return 'text-yellow-600 bg-yellow-100'
        return 'text-green-600 bg-green-100'
    }

    const getRiskLabel = (score) => {
        if (score >= 70) return 'High Risk'
        if (score >= 40) return 'Medium Risk'
        return 'Low Risk'
    }

    const sendToExpress = async () => {
        setSendingToExpress(true)
        try {
            const token = localStorage.getItem('token')
            
            // Prepare comprehensive analysis data
            const analysisData = {
                customer_id: customerData.customer_id,
                overall_risk_score: mlResults.ml_results[0]?.overall_risk_score || 0,
                risk_category: getRiskLabel(mlResults.ml_results[0]?.overall_risk_score || 0),
                individual_files: mlResults.ml_results[0]?.individual_results || [],
                overall_assessment: mlResults.ml_results[0]?.overall_risk_assessment || {},
                processing_summary: mlResults.ml_results[0]?.processing_summary || {},
                timestamp: new Date().toISOString()
            }

            // Send to Express backend
            const response = await axios.post(`${import.meta.env.VITE_API}/api/files/send-analysis-to-express`, 
                analysisData,
                { headers: { Authorization: `Bearer ${token}` } }
            )

            if (response.data.success) {
                toast.success('Analysis results sent to Express backend successfully!')
            } else {
                toast.error('Failed to send analysis to Express backend')
            }
        } catch (error) {
            console.error('Error sending to Express:', error)
            toast.error('Failed to send analysis to Express backend')
        } finally {
            setSendingToExpress(false)
        }
    }

    const showFileDetails = (fileResult) => {
        setSelectedFileDetails(fileResult)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            Risk Analysis Details - Customer {customerData?.customer_id}
                        </h2>
                        <p className="text-sm text-gray-600">Customer ID: {customerData?.customer_id}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={sendToExpress}
                            disabled={sendingToExpress || !mlResults}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {sendingToExpress ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send size={16} className="mr-2" />
                                    Send to Express
                                </>
                            )}
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-gray-600">Loading analysis results...</span>
                        </div>
                    ) : mlResults && mlResults.ml_results.length > 0 ? (
                        <div className="space-y-6">
                            {mlResults.ml_results.map((result, index) => (
                                <div key={index}>
                                    {/* Overall Risk Summary */}
                                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Overall Risk Assessment</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="text-center">
                                                <div className={`inline-flex px-4 py-2 rounded-full text-lg font-bold ${getRiskColor(result.overall_risk_score)}`}>
                                                    {result.overall_risk_score}/100
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">Risk Score</p>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-gray-900">
                                                    {getRiskLabel(result.overall_risk_score)}
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">Risk Level</p>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-gray-900">
                                                    {result.processing_summary?.total_files || 0}
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">Files Processed</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Individual File Analysis */}
                                    <div className="bg-white border rounded-lg">
                                        <div className="px-6 py-4 border-b border-gray-200">
                                            <h3 className="text-lg font-medium text-gray-900">Individual File Analysis</h3>
                                            <p className="text-sm text-gray-600">OCR extraction and risk assessment for each file</p>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            File Name
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Extracted Data
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
                                                    {result.individual_results?.map((fileResult, fileIndex) => (
                                                        <tr key={fileIndex} className="hover:bg-gray-50">
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex items-center">
                                                                    <FileText size={16} className="text-gray-400 mr-2" />
                                                                    <span className="text-sm font-medium text-gray-900">
                                                                        {fileResult.File || `File ${fileIndex + 1}`}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="text-sm text-gray-900">
                                                                    <div><strong>Name:</strong> {fileResult.NAME || 'Not found'}</div>
                                                                    <div><strong>DOB:</strong> {fileResult.DOB || 'Not found'}</div>
                                                                    <div><strong>Country:</strong> {fileResult.COUNTRY || 'Not found'}</div>
                                                                    <div><strong>Card Expiry:</strong> {fileResult.CARD_EXPIRY_DATE || 'Not found'}</div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(fileResult.Risk_Score)}`}>
                                                                    {fileResult.Risk_Score}/100
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                    fileResult.Status === 'Verified' ? 'bg-green-100 text-green-800' :
                                                                    fileResult.Status === 'Flagged' ? 'bg-red-100 text-red-800' :
                                                                    'bg-yellow-100 text-yellow-800'
                                                                }`}>
                                                                    {fileResult.Status}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                                <button
                                                                    onClick={() => showFileDetails(fileResult)}
                                                                    className="text-blue-600 hover:text-blue-900"
                                                                >
                                                                    <Eye size={16} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Risk Factors and Recommendations */}
                                    {result.overall_risk_assessment && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-white border rounded-lg p-6">
                                                <h4 className="text-lg font-medium text-gray-900 mb-4">Risk Factors</h4>
                                                <ul className="space-y-2">
                                                    {result.overall_risk_assessment.risk_factors?.map((factor, idx) => (
                                                        <li key={idx} className="flex items-start">
                                                            <AlertTriangle size={16} className="text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                                                            <span className="text-sm text-gray-700">{factor}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="bg-white border rounded-lg p-6">
                                                <h4 className="text-lg font-medium text-gray-900 mb-4">Recommendations</h4>
                                                <ul className="space-y-2">
                                                    {result.overall_risk_assessment.recommendations?.map((rec, idx) => (
                                                        <li key={idx} className="flex items-start">
                                                            <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                                            <span className="text-sm text-gray-700">{rec}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No ML results found for this customer</p>
                        </div>
                    )}
                </div>
            </div>

            {/* File Details Modal */}
            {selectedFileDetails && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900">
                                OCR Extraction Details - {selectedFileDetails.File}
                            </h3>
                            <button
                                onClick={() => setSelectedFileDetails(null)}
                                className="p-2 text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Extracted Text Preview:</h4>
                                    <div className="bg-gray-50 p-4 rounded border text-sm font-mono">
                                        {selectedFileDetails.Extracted_Text_Preview || 'No text preview available'}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Risk Analysis:</h4>
                                    <div className="bg-gray-50 p-4 rounded border">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div><strong>Risk Score:</strong> {selectedFileDetails.Risk_Score}/100</div>
                                            <div><strong>Status:</strong> {selectedFileDetails.Status}</div>
                                            <div><strong>Card Validity:</strong> {selectedFileDetails.Card_Validity}</div>
                                        </div>
                                        {selectedFileDetails.Risk_Details && (
                                            <div className="mt-4">
                                                <strong>Risk Details:</strong>
                                                <ul className="list-disc list-inside mt-2">
                                                    {selectedFileDetails.Risk_Details.map((detail, idx) => (
                                                        <li key={idx} className="text-sm text-gray-700">{detail}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default RiskAnalysisPopup
