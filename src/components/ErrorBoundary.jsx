import { Component } from 'react'

class ErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null, errorInfo: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true }
    }

    componentDidCatch(error, errorInfo) {
        console.error('❌ Error caught by boundary:', error, errorInfo)
        this.setState({
            error: error,
            errorInfo: errorInfo
        })
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-2xl w-full">
                        <div className="text-center mb-6">
                            <div className="text-6xl mb-4">🚨</div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                                Oops! Something went wrong
                            </h1>
                            <p className="text-gray-600">
                                We encountered an unexpected error. Please try refreshing the page.
                            </p>
                        </div>

                        {process.env.NODE_ENV === 'development' && (
                            <details className="mb-6">
                                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                                    View Error Details (Development Only)
                                </summary>
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                    <h3 className="font-semibold text-red-600 mb-2">Error:</h3>
                                    <pre className="text-xs text-red-800 mb-4 overflow-auto">
                                        {this.state.error && this.state.error.toString()}
                                    </pre>
                                    <h3 className="font-semibold text-red-600 mb-2">Stack Trace:</h3>
                                    <pre className="text-xs text-red-800 overflow-auto">
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                </div>
                            </details>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                            >
                                Refresh Page
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                            >
                                Go Home
                            </button>
                        </div>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary