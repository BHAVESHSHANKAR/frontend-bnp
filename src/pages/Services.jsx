import Header from '../components/Header'
import Lottie from 'lottie-react'
import businessAnimation from '../assets/animations/Business Analysis.json'

const Services = () => {
  const services = [
    {
      icon: '💳',
      title: 'Personal Banking',
      description: 'Checking and savings accounts, debit cards, and personal loans tailored to your needs.',
      features: ['No monthly fees', 'Mobile check deposit', 'ATM fee reimbursement', '24/7 customer support'],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: '🏢',
      title: 'Business Banking',
      description: 'Comprehensive business solutions including merchant services and commercial loans.',
      features: ['Business checking', 'Merchant services', 'Payroll processing', 'Commercial lending'],
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: '📈',
      title: 'Investment Services',
      description: 'Grow your wealth with our investment and retirement planning services.',
      features: ['Portfolio management', 'Retirement planning', 'Financial advisory', 'Market research'],
      color: 'from-purple-500 to-violet-500'
    },
    {
      icon: '🏠',
      title: 'Mortgage & Loans',
      description: 'Competitive rates on home loans, auto loans, and personal financing options.',
      features: ['Home mortgages', 'Auto loans', 'Personal loans', 'Refinancing options'],
      color: 'from-orange-500 to-red-500'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="animate-spin-slow">
              <Lottie
                animationData={businessAnimation}
                className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48"
                loop={true}
              />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4 sm:mb-6 animate-fade-in-up">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Services</span>
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto animate-fade-in">
            Comprehensive financial solutions designed to meet all your banking needs
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 max-w-7xl mx-auto mb-12 sm:mb-16 lg:mb-20">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="text-4xl sm:text-5xl mr-4 animate-bounce" style={{ animationDelay: `${index * 0.2}s` }}>
                  {service.icon}
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">{service.title}</h3>
              </div>
              
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base lg:text-lg leading-relaxed">
                {service.description}
              </p>
              
              <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                {service.features.map((feature, featureIndex) => (
                  <div 
                    key={featureIndex} 
                    className="flex items-center text-gray-700 animate-slide-in-right"
                    style={{ animationDelay: `${(index * 0.1) + (featureIndex * 0.05)}s` }}
                  >
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="text-white text-xs sm:text-sm font-bold">✓</span>
                    </div>
                    <span className="text-sm sm:text-base">{feature}</span>
                  </div>
                ))}
              </div>
              
              <button className={`w-full sm:w-auto bg-gradient-to-r ${service.color} hover:shadow-lg text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl text-sm sm:text-base transition-all duration-300 transform hover:scale-105`}>
                Learn More
              </button>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-12 max-w-4xl mx-auto text-white animate-fade-in-up">
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="animate-pulse">
                <Lottie
                  animationData={businessAnimation}
                  className="w-20 h-20 sm:w-24 sm:h-24"
                  loop={true}
                />
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">Ready to Get Started?</h2>
            <p className="text-lg sm:text-xl text-blue-100 mb-6 sm:mb-8 max-w-2xl mx-auto">
              Contact us today to learn more about how our services can help you achieve your financial goals.
            </p>
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <button className="w-full sm:w-auto bg-white hover:bg-gray-100 text-blue-600 font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl text-base sm:text-lg transition-all duration-300 transform hover:scale-105">
                Open an Account
              </button>
              <button className="w-full sm:w-auto bg-transparent border-2 border-white hover:bg-white hover:text-blue-600 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl text-base sm:text-lg transition-all duration-300 transform hover:scale-105">
                Schedule Consultation
              </button>
            </div>
          </div>
        </div>

        {/* Additional Features */}
        <div className="mt-16 sm:mt-20 lg:mt-24">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gray-800 mb-8 sm:mb-12">
            Why Choose Our Services?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center p-4 sm:p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fade-in-up">
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 animate-bounce">⚡</div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Lightning Fast</h3>
              <p className="text-gray-600 text-sm sm:text-base">Quick approvals and instant transactions</p>
            </div>
            <div className="text-center p-4 sm:p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 animate-bounce" style={{ animationDelay: '0.1s' }}>🔒</div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Secure & Safe</h3>
              <p className="text-gray-600 text-sm sm:text-base">Bank-grade security for all transactions</p>
            </div>
            <div className="text-center p-4 sm:p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 animate-bounce" style={{ animationDelay: '0.2s' }}>💰</div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Best Rates</h3>
              <p className="text-gray-600 text-sm sm:text-base">Competitive rates and low fees</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Services