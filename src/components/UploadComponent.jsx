import React, { useState } from 'react'
import { Upload, Plus, X, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import { toast } from 'react-toastify'
import axios from 'axios'

const UploadComponent = ({ onAnalysisComplete }) => {
    const [uploadForm, setUploadForm] = useState({
        customerId: '',
        personName: '',
        mobileNumber: '',
        files: []
    })
    const [uploading, setUploading] = useState(false)
    const [dragActive, setDragActive] = useState(false)

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
        
        if (!uploadForm.customerId || !uploadForm.personName || !uploadForm.mobileNumber || uploadForm.files.length === 0) {
            toast.error('Please fill all fields and select files')
            return
        }

        setUploading(true)

        try {
            const token = localStorage.getItem('token')
            const formData = new FormData()
            
            formData.append('personName', uploadForm.personName)
            formData.append('mobileNumber', uploadForm.mobileNumber)
            
            uploadForm.files.forEach(file => {
                formData.append('files', file)
            })

            const response = await axios.post(
                `http://localhost:6969/api/files/upload/${uploadForm.customerId}`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            )

            if (response.data.success) {
                toast.success('Files uploaded and processed successfully!')
                setUploadForm({ customerId: '', personName: '', mobileNumber: '', files: [] })
                
                // Call the callback to switch to risk analysis with the data
                if (onAnalysisComplete) {
                    onAnalysisComplete({
                        customerId: uploadForm.customerId,
                        personName: uploadForm.personName,
                        uploadResults: response.data.data
                    })
                }
            } else {
                toast.error(response.data.message || 'Upload failed')
            }

        } catch (error) {
            console.error('Upload error:', error)
            toast.error(error.response?.data?.message || 'Upload failed')
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Customer ID *
                            </label>
                            <input
                                type="text"
                                value={uploadForm.customerId}
                                onChange={(e) => setUploadForm(prev => ({ ...prev, customerId: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Enter customer ID"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Person Name *
                            </label>
                            <input
                                type="text"
                                value={uploadForm.personName}
                                onChange={(e) => setUploadForm(prev => ({ ...prev, personName: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Enter person name"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mobile Number *
                            </label>
                            <input
                                type="tel"
                                value={uploadForm.mobileNumber}
                                onChange={(e) => setUploadForm(prev => ({ ...prev, mobileNumber: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Enter mobile number"
                                required
                            />
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
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer transition-colors duration-200"
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
        </div>
    )
}

export default UploadComponent
