import React from 'react'
import { Link } from 'react-router-dom'
import Lottie from 'lottie-react'
import Header from '../components/Header'
import { useScrollAnimation, useStaggeredAnimation } from '../hooks/useScrollAnimation'
import businessAnimation from '../assets/animations/Business Analysis.json'

const LandingPage = () => {
    const [heroRef, heroVisible] = useScrollAnimation(0.3)
    const [featuresRef, featuresVisible] = useScrollAnimation(0.2)
    const [statsRef, statsVisible] = useScrollAnimation(0.2)

    const features = [
        {
            icon: '🔍',
            title: 'OCR Text Extraction',
            description: 'Advanced Tesseract OCR technology extracts text from PDFs, images, and scanned documents with high accuracy for comprehensive data analysis.'
        },
        {
            icon: '🧠',
            title: 'NLP Entity Recognition',
            description: 'SpaCy-powered Named Entity Recognition identifies names, dates, countries, and document numbers from unstructured text automatically.'
        },
        {
            icon: '⚖️',
            title: 'Risk Assessment Engine',
            description: 'Intelligent scoring system evaluates document completeness, consistency, and authenticity to generate comprehensive risk reports.'
        },
        {
            icon: '🔒',
            title: 'Secure File Processing',
            description: 'AES-256 encrypted file storage with Cloudinary integration ensures sensitive customer documents are protected throughout processing.'
        }
    ]

    const [setFeatureRef, visibleFeatures] = useStaggeredAnimation(features, 150)

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 overflow-hidden">
            <Header />

            <main className="pt-20">
                {/* Hero Section */}
                <section 
                    ref={heroRef}
                    className={`min-h-screen flex items-center transition-all duration-1000 ${
                        heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}
                >
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                            {/* Left Content */}
                            <div className={`space-y-8 transition-all duration-1000 delay-300 ${
                                heroVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
                            }`}>
                                <div className="space-y-6">
                                    <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-800 leading-tight">
                                        AI-Powered Document 
                                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 mt-2">
                                            Verification System
                                        </span>
                                    </h1>
                                    <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-2xl">
                                        Advanced ML-powered document processing and risk assessment platform for financial institutions. Automate KYC compliance with intelligent OCR and fraud detection.
                                    </p>
                                </div>
                                
                                {/* Document Processing Card */}
                                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 max-w-md transform hover:scale-105 transition-all duration-300 border border-green-200/50 hover:shadow-2xl">
                                    <div className="flex items-center mb-4">
                                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-3"></div>
                                        <h3 className="text-lg font-semibold text-gray-700">Document Processing Flow</h3>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                                <span className="text-green-600 font-bold text-sm">1</span>
                                            </div>
                                            <p className="text-sm text-gray-600">Upload customer documents</p>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                                <span className="text-green-600 font-bold text-sm">2</span>
                                            </div>
                                            <p className="text-sm text-gray-600">AI extracts & validates data</p>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                                <span className="text-green-600 font-bold text-sm">3</span>
                                            </div>
                                            <p className="text-sm text-gray-600">Get risk assessment report</p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* CTA Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Link 
                                        to="/signup"
                                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl text-center"
                                    >
                                        Signup
                                    </Link>
                                    <Link 
                                        to="/login"
                                        className="bg-white/80 backdrop-blur-sm hover:bg-white text-green-700 font-semibold py-4 px-8 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 border border-green-200 hover:shadow-xl text-center"
                                    >
                                        Login
                                    </Link>
                                </div>
                            </div>

                            {/* Right Animation */}
                            <div className={`flex justify-center lg:justify-end transition-all duration-1000 delay-500 ${
                                heroVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
                            }`}>
                                <Lottie
                                    animationData={businessAnimation}
                                    className="w-80 h-80 sm:w-96 sm:h-96 lg:w-[32rem] lg:h-[32rem] xl:w-[36rem] xl:h-[36rem] transform hover:scale-105 transition-all duration-500 animate-float"
                                    loop={true}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* How Our Document Processing System Works */}
                <section className="py-20 lg:py-32">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
                                How Our 
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600"> ML Processing Engine </span>
                                Works
                            </h2>
                            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                                Advanced machine learning pipeline for automated document verification and KYC compliance
                            </p>
                        </div>

                        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
                            {/* Document Processing */}
                            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-green-200/50 hover:shadow-2xl transition-all duration-300">
                                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                                    <span className="text-white text-2xl">📄</span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-4">Document Processing</h3>
                                <ul className="space-y-3 text-gray-600">
                                    <li className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                        <span>PDF, DOCX, TXT, ZIP file support</span>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                        <span>Tesseract OCR for image text extraction</span>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                        <span>Batch processing for multiple documents</span>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                        <span>Encrypted storage with Cloudinary</span>
                                    </li>
                                </ul>
                            </div>

                            {/* AI Data Extraction */}
                            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-green-200/50 hover:shadow-2xl transition-all duration-300">
                                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                                    <span className="text-white text-2xl">🤖</span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-4">AI Data Extraction</h3>
                                <ul className="space-y-3 text-gray-600">
                                    <li className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                        <span>SpaCy NLP for entity recognition</span>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                        <span>Name, DOB, country extraction</span>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                        <span>Card expiry date detection</span>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                        <span>ISO country code mapping</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Risk Assessment */}
                            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-green-200/50 hover:shadow-2xl transition-all duration-300">
                                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                                    <span className="text-white text-2xl">⚖️</span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-4">Risk Assessment</h3>
                                <ul className="space-y-3 text-gray-600">
                                    <li className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                        <span>0-100 risk scoring algorithm</span>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                        <span>Document completeness analysis</span>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                        <span>Consistency verification across files</span>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                        <span>Automated compliance recommendations</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section 
                    ref={featuresRef}
                    className={`py-20 lg:py-32 transition-all duration-1000 ${
                        featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}
                >
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
                                Advanced ML 
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600"> Capabilities</span>
                            </h2>
                            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                                Cutting-edge machine learning technologies that power our document verification platform
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {features.map((feature, index) => (
                                <div 
                                    key={index}
                                    ref={setFeatureRef(index)}
                                    className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 text-center hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border border-green-200/50 ${
                                        visibleFeatures.has(index) 
                                            ? 'opacity-100 translate-y-0' 
                                            : 'opacity-0 translate-y-10'
                                    }`}
                                >
                                    <div className="text-4xl lg:text-5xl mb-6 transform hover:scale-110 transition-transform duration-300">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl lg:text-2xl font-bold text-gray-800 mb-4">{feature.title}</h3>
                                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section 
                    ref={statsRef}
                    className={`py-20 lg:py-32 transition-all duration-1000 ${
                        statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}
                >
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl shadow-2xl p-8 lg:p-16 text-white relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 backdrop-blur-3xl"></div>
                            <div className="relative z-10">
                                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-4">
                                    Proven Performance
                                </h2>
                                <p className="text-lg sm:text-xl text-center text-green-100 mb-12 max-w-2xl mx-auto">
                                    Financial institutions worldwide trust our AI-powered document verification system
                                </p>
                                
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                                    <div className={`text-center transition-all duration-700 delay-100 ${
                                        statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                                    }`}>
                                        <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">1M+</div>
                                        <div className="text-green-100 text-sm sm:text-base">Documents Processed</div>
                                    </div>
                                    <div className={`text-center transition-all duration-700 delay-200 ${
                                        statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                                    }`}>
                                        <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">95%</div>
                                        <div className="text-green-100 text-sm sm:text-base">OCR Accuracy</div>
                                    </div>
                                    <div className={`text-center transition-all duration-700 delay-300 ${
                                        statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                                    }`}>
                                        <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">99.9%</div>
                                        <div className="text-green-100 text-sm sm:text-base">System Uptime</div>
                                    </div>
                                    <div className={`text-center transition-all duration-700 delay-400 ${
                                        statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                                    }`}>
                                        <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">&lt;20s</div>
                                        <div className="text-green-100 text-sm sm:text-base">Processing Time</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 lg:py-32">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="max-w-3xl mx-auto">
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
                                Ready to Automate Your 
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600"> KYC Process?</span>
                            </h2>
                            <p className="text-lg sm:text-xl text-gray-600 mb-8">
                                Transform your document verification workflow with our AI-powered platform. Reduce manual processing time by 90%.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link 
                                    to="/signup"
                                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl text-center"
                                >
                                    Signup
                                </Link>
                                <Link 
                                    to="/login"
                                    className="bg-white/80 backdrop-blur-sm hover:bg-white text-green-700 font-semibold py-4 px-8 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 border border-green-200 hover:shadow-xl text-center"
                                >
                                    Login
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}

export default LandingPage
