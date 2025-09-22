import { useState, useEffect } from 'react'
import { getApiUrl, testApiConnection } from '../utils/apiConfig'
import axiosInstance from '../utils/axiosConfig'

const ApiTest = () => {
    const [apiStatus, setApiStatus] = useState('testing')
    const [apiUrl, setApiUrl] = useState('')
    const [testResults, setTestResults] = useState([])

    useEffect(() => {
        runApiTests()
    }, [])

    const runApiTests = async () => {
        const url = getApiUrl()
        setApiUrl(url)
        
        const tests = [
            {
                name: 'Basic Connection Test',
                test: () => testApiConnection()
            },
            {
                name: 'Ping Endpoint',
                test: async () => {
                    try {
                        const response = await axiosInstance.get('/ping')
                        return { success: true, data: response.data }
                    } catch (error) {
                        return { success: false, error: error.message }
                    }
                }
            },
            {
                name: 'Health Check',
                test: async () => {
                    try {
                        const response = await axiosInstance.get('/health/db')
                        return { success: true, data: response.data }
                    } catch (error) {
                        return { success: false, error: error.message }
                    }
                }
            }
        ]

        const results = []
        for (const test of tests) {
            console.log(`Running test: ${test.name}`)
            try {
                const result = await test.test()
                results.push({
                    name: test.name,
                    success: result.success,
                    data: result.data,
                    error: result.error
                })
            } catch (error) {
                results.push({
                    name: test.name,
                    success: false,
                    error: error.message
                })
            }
        }

        setTestResults(results)
        setApiStatus('completed')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
                        API Connection Test
                    </h1>
                    
                    <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                        <h2 className="text-lg font-semibold text-gray-700 mb-2">Configuration</h2>
                        <p className="text-sm text-gray-600">
                            <strong>API URL:</strong> {apiUrl}
                        </p>
                        <p className="text-sm text-gray-600">
                            <strong>Environment:</strong> {window.location.hostname === 'localhost' ? 'Development' : 'Production'}
                        </p>
                        <p className="text-sm text-gray-600">
                            <strong>Status:</strong> {apiStatus}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800">Test Results</h2>
                        
                        {testResults.length === 0 && apiStatus === 'testing' && (
                            <div className="text-center py-8">
                                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                                <p className="text-gray-600">Running API tests...</p>
                            </div>
                        )}

                        {testResults.map((result, index) => (
                            <div 
                                key={index}
                                className={`p-4 rounded-xl border-2 ${
                                    result.success 
                                        ? 'border-green-200 bg-green-50' 
                                        : 'border-red-200 bg-red-50'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold text-gray-800">{result.name}</h3>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        result.success 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {result.success ? '✅ Pass' : '❌ Fail'}
                                    </span>
                                </div>
                                
                                {result.error && (
                                    <p className="text-red-600 text-sm mb-2">
                                        <strong>Error:</strong> {result.error}
                                    </p>
                                )}
                                
                                {result.data && (
                                    <details className="text-sm">
                                        <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                                            View Response Data
                                        </summary>
                                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                                            {JSON.stringify(result.data, null, 2)}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 text-center">
                        <button
                            onClick={runApiTests}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-xl transition-all duration-300"
                        >
                            Run Tests Again
                        </button>
                    </div>

                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                        <h3 className="font-semibold text-yellow-800 mb-2">Troubleshooting Tips</h3>
                        <ul className="text-sm text-yellow-700 space-y-1">
                            <li>• Make sure your backend server is running</li>
                            <li>• Check if the API URL is correct</li>
                            <li>• Verify CORS settings allow your frontend domain</li>
                            <li>• Check browser console for detailed error messages</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ApiTest