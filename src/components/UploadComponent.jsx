import React, { useState, useEffect } from 'react'
import { Upload, Plus, X, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import { toast } from 'react-toastify'
import axios from 'axios'
import { getApiUrl } from '../utils/apiConfig'

const UploadComponent = ({ onAnalysisComplete }) => {
    const [uploadForm, setUploadForm] = useState({
        customerId: '',
        files: []
    })
    const [uploading, setUploading] = useState(false)
    const [dragActive, setDragActive] = useState(false)
    const [bankName] = useState('BNP') // Bank name - can be made configurable later
    const [customerCounter, setCustomerCounter] = useState(1)

    // Generate customer ID automatically on component load
    const generateCustomerId = async () => {
        try {
            const token = localStorage.getItem('token')
            const apiUrl = getApiUrl()
            console.log('🔗 Using API URL:', apiUrl) // Debug log
            
            const response = await axios.get(`${apiUrl}/api/files/next-customer-id`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { bankName }
            })
            
            if (response.data.success) {
                // Use the full customer ID from backend (e.g., "BNP1", "BNP2")
                const customerId = response.data.data.fullCustomerId || response.data.data.customer_id
                setUploadForm(prev => ({ ...prev, customerId: customerId }))
                setCustomerCounter(response.data.data.nextId)
            } else {
                // Fallback to local counter if API fails
                const nextId = `${bankName}${customerCounter}`
                setUploadForm(prev => ({ ...prev, customerId: nextId }))
            }
        } catch (error) {
            console.error('❌ Error generating customer ID:', error)
            console.error('❌ Error details:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data
            })
            // Fallback to local counter
            const nextId = `${bankName}${customerCounter}`
            setUploadForm(prev => ({ ...prev, customerId: nextId }))
            toast.warning('Using fallback customer ID generation')
        }
    }

    // Auto-generate customer ID on component load
    useEffect(() => {
        if (!uploadForm.customerId) {
            generateCustomerId()
        }
    }, [])

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files)
        setUploadForm(prev => ({ ...prev, files: [...prev.files, ...files] }))
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setDragActive(false)
        const files = Array.from(e.dataTransfer.files)
        setUploadForm(prev => ({ ...prev, files: [...prev.files, ...files] }))
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        setDragActive(true)
    }

    const handleDragLeave = (e) => {
        e.preventDefault()
        setDragActive(false)
    }

    const removeFile = (index) => {
        setUploadForm(prev => ({
            ...prev,
            files: prev.files.filter((_, i) => i !== index)
        }))
    }

    const handleUploadSubmit = async (e) => {
        e.preventDefault()
        
        if (uploadForm.files.length === 0) {
            toast.error('Please select files to upload')
            return
        }

        if (!uploadForm.customerId) {
            toast.error('Customer ID is being generated. Please wait a moment.')
            return
        }

        setUploading(true)

        try {
            const token = localStorage.getItem('token')
            const apiUrl = getApiUrl()
            
            console.log('🚀 Starting upload process...')
            console.log('🔗 API URL:', apiUrl)
            console.log('👤 Customer ID:', uploadForm.customerId)
            console.log('📁 Files count:', uploadForm.files.length)
            console.log('🔑 Token present:', !!token)
            
            if (!token) {
                toast.error('Authentication token not found. Please login again.')
                return
            }
            
            const formData = new FormData()
            
            // Only customer ID and files are needed
            uploadForm.files.forEach(file => {
                formData.append('files', file)
                console.log('📎 Adding file:', file.name, 'Size:', file.size)
            })

            const uploadUrl = `${apiUrl}/api/files/upload/${uploadForm.customerId}`
            console.log('🎯 Upload URL:', uploadUrl)

            const response = await axios.post(
                uploadUrl,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        // Don't set Content-Type manually for multipart/form-data
                        // Let axios set it automatically with boundary
                    },
                    timeout: 120000, // 2 minutes timeout to match backend
                    maxContentLength: Infinity,
                    maxBodyLength: Infinity,
                    // Add retry logic for network issues
                    validateStatus: function (status) {
                        return status < 500; // Resolve only if status is less than 500
                    }
                }
            )

            // Handle different response scenarios
            if (response.status >= 200 && response.status < 300) {
                if (response.data.success) {
                    toast.success('Files uploaded and processed successfully!')
                    
                    // Call the callback to switch to risk analysis with the data
                    if (onAnalysisComplete) {
                        onAnalysisComplete({
                            customerId: uploadForm.customerId,
                            uploadResults: response.data.data
                        })
                    }
                    
                    // Reset form and increment counter for next customer
                    setUploadForm({ customerId: '', files: [] })
                    setCustomerCounter(prev => prev + 1)
                    // Generate new customer ID for next upload
                    setTimeout(() => generateCustomerId(), 100)
                } else {
                    // Backend returned success=false
                    console.error('❌ Backend returned error:', response.data)
                    toast.error(response.data.message || 'Upload processing failed')
                }
            } else {
                // HTTP error status
                console.error('❌ HTTP Error:', response.status, response.statusText)
                toast.error(`Server error: ${response.status} ${response.statusText}`)
            }

        } catch (error) {
            console.error('❌ Upload error:', error)
            console.error('❌ Upload error details:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    headers: error.config?.headers
                }
            })
            
            // Provide more specific error messages
            let errorMessage = 'Upload failed'
            
            if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                errorMessage = 'Upload timeout - files may be too large or connection is slow. Please try again.'
            } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
                errorMessage = 'Network error - please check your internet connection and try again'
            } else if (error.response?.status === 401) {
                errorMessage = 'Authentication failed - please login again'
                // Clear invalid token
                localStorage.removeItem('token')
                localStorage.removeItem('admin')
            } else if (error.response?.status === 413) {
                errorMessage = 'Files too large - please reduce file size and try again'
            } else if (error.response?.status === 422) {
                errorMessage = 'Invalid file format or corrupted files detected'
            } else if (error.response?.status === 429) {
                errorMessage = 'Too many requests - please wait a moment and try again'
            } else if (error.response?.status === 500) {
                errorMessage = 'Server error - please try again later'
            } else if (error.response?.status === 502 || error.response?.status === 503) {
                errorMessage = 'Service temporarily unavailable - please try again in a few minutes'
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message
            } else if (error.message) {
                errorMessage = `Upload error: ${error.message}`
            }
            
            // Log additional debugging info for development
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                console.error('🔍 Debug Info:', {
                    apiUrl,
                    uploadUrl,
                    filesCount: uploadForm.files.length,
                    totalSize: uploadForm.files.reduce((sum, file) => sum + file.size, 0),
                    tokenPresent: !!token,
                    errorCode: error.code,
                    errorName: error.name
                })
            }
            
            toast.error(errorMessage)
        } finally {
            setUploading(false)
        }
    }

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Upload Customer Documents</h1>
                <p className="text-gray-600">Upload customer documents for AI-powered risk analysis and verification</p>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-6">
                {/* Customer Information */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="max-w-md">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Customer ID * (Auto-generated)
                            </label>
                            <input
                                type="text"
                                value={uploadForm.customerId}
                                readOnly
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                                placeholder={uploadForm.customerId ? uploadForm.customerId : "Generating..."}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Format: {bankName}1, {bankName}2, etc.
                            </p>
                        </div>
                    </div>
                </div>

                {/* File Upload Area */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Upload</h3>
                    
                    
                    {/* Drag and Drop Area */}
                    <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
                            dragActive 
                                ? 'border-green-500 bg-green-50' 
                                : 'border-gray-300 hover:border-green-400'
                        }`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                    >
                        <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-lg font-medium text-gray-900 mb-2">
                            Drag and drop files here, or click to select
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                            Supports all file formats (PDF, Images, Documents, etc.)
                        </p>
                        <input
                            type="file"
                            multiple
                            onChange={handleFileUpload}
                            className="hidden"
                            id="file-upload"
                            accept="*/*"
                        />
                        <label
                            htmlFor="file-upload"
                            className="inline-flex items-center px-4 py-2 rounded-lg transition-colors duration-200 bg-green-600 text-white hover:bg-green-700 cursor-pointer"
                        >
                            <Plus size={20} className="mr-2" />
                            Select Files
                        </label>
                    </div>

                    {/* Selected Files List */}
                    {uploadForm.files.length > 0 && (
                        <div className="mt-6">
                            <h4 className="text-md font-medium text-gray-900 mb-3">
                                Selected Files ({uploadForm.files.length})
                            </h4>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {uploadForm.files.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <FileText size={20} className="text-gray-500" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeFile(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-center">
                    <button
                        type="submit"
                        disabled={uploading || uploadForm.files.length === 0}
                        className="flex items-center px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                        {uploading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Processing...
                            </>
                        ) : (
                            <>
                                <Upload size={20} className="mr-2" />
                                Upload & Start Analysis
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Upload Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                    <AlertCircle size={20} className="text-blue-600 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-medium text-blue-900">Upload Guidelines</h4>
                        <ul className="text-sm text-blue-700 mt-2 space-y-1">
                            <li>• All file formats are supported (PDF, JPG, PNG, DOC, etc.)</li>
                            <li>• Multiple files can be uploaded simultaneously</li>
                            <li>• Files will be processed by AI for risk assessment</li>
                            <li>• Ensure customer information is accurate</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Risk Assessment Rules Reference */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <div className="mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Risk Assessment Rules</h4>
                    <p className="text-sm text-gray-600">The following rules will be automatically evaluated during document processing:</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Column */}
                    <div className="space-y-3">
                        {/* R01 */}
                        <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                            <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded flex-shrink-0 mt-0.5">R01</span>
                            <div>
                                <h5 className="text-sm font-medium text-gray-900">Document Expiry Check</h5>
                                <p className="text-xs text-gray-600 mt-1">Document expiry date &lt; today</p>
                            </div>
                        </div>

                        {/* R02 */}
                        <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                            <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded flex-shrink-0 mt-0.5">R02</span>
                            <div>
                                <h5 className="text-sm font-medium text-gray-900">Restricted Countries</h5>
                                <p className="text-xs text-gray-600 mt-1">Country code ∈ {'{IR, KP, SY, RU}'}</p>
                            </div>
                        </div>

                        {/* R03 */}
                        <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                            <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded flex-shrink-0 mt-0.5">R03</span>
                            <div>
                                <h5 className="text-sm font-medium text-gray-900">Image Quality Check</h5>
                                <p className="text-xs text-gray-600 mt-1">Blur score &gt; 0.75 OR contrast score &lt; 0.30</p>
                            </div>
                        </div>

                        {/* R04 */}
                        <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                            <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded flex-shrink-0 mt-0.5">R04</span>
                            <div>
                                <h5 className="text-sm font-medium text-gray-900">Name Matching</h5>
                                <p className="text-xs text-gray-600 mt-1">Name match score &lt; 0.60</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-3">
                        {/* R05 */}
                        <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                            <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded flex-shrink-0 mt-0.5">R05</span>
                            <div>
                                <h5 className="text-sm font-medium text-gray-900">Watchlist Screening</h5>
                                <p className="text-xs text-gray-600 mt-1">Watchlist match score &gt; 0.5</p>
                            </div>
                        </div>

                        {/* R06 */}
                        <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                            <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded flex-shrink-0 mt-0.5">R06</span>
                            <div>
                                <h5 className="text-sm font-medium text-gray-900">Tamper Detection</h5>
                                <p className="text-xs text-gray-600 mt-1">Tamper detection flag = TRUE</p>
                            </div>
                        </div>

                        {/* R07 */}
                        <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                            <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded flex-shrink-0 mt-0.5">R07</span>
                            <div>
                                <h5 className="text-sm font-medium text-gray-900">Escalation Rules</h5>
                                <p className="text-xs text-gray-600 mt-1">Any rule marked as "escalate"</p>
                            </div>
                        </div>

                        {/* Info Box */}
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center space-x-2">
                                <CheckCircle size={16} className="text-green-600" />
                                <p className="text-xs font-medium text-green-800">Automated Assessment</p>
                            </div>
                            <p className="text-xs text-green-700 mt-1">
                                All rules are evaluated automatically during document processing
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UploadComponent
