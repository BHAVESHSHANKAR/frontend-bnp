import Header from '../components/Header'
import Lottie from 'lottie-react'
import businessAnimation from '../assets/animations/Business Analysis.json'

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12 sm:mb-16">
            <div className="flex justify-center mb-6 sm:mb-8">
              <div className="animate-pulse">
                <Lottie
                  animationData={businessAnimation}
                  className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48"
                  loop={true}
                />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4 sm:mb-6 animate-fade-in-up">
              About <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Us</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in">
              Pioneering the future of banking with innovation, security, and personalized service
            </p>
          </div>
          
          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 mb-12 sm:mb-16">
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10 animate-slide-in-left">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center">
                <span className="text-3xl mr-3">📖</span>
                Our Story
              </h2>
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
                Founded with a vision to revolutionize banking, we combine cutting-edge technology 
                with personalized service to deliver exceptional financial solutions. Our commitment 
                to innovation and customer satisfaction has made us a trusted partner for thousands 
                of individuals and businesses.
              </p>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Since our inception, we've grown from a small fintech startup to a leading digital 
                banking platform, always keeping our customers' needs at the heart of everything we do.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10 animate-slide-in-right">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center">
                <span className="text-3xl mr-3">🎯</span>
                Our Mission
              </h2>
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
                To empower our customers with secure, innovative, and accessible financial services 
                that help them achieve their goals and build a better future.
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 sm:p-6">
                <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">Our Vision</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  To be the world's most trusted and innovative digital banking platform, 
                  making financial services accessible to everyone, everywhere.
                </p>
              </div>
            </div>
          </div>
          
          {/* Why Choose Us Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-12 mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gray-800 mb-8 sm:mb-12 animate-fade-in">
              Why Choose Us
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              <div className="text-center p-4 sm:p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-fade-in-up">
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 animate-bounce">🏆</div>
                <h3 className="font-bold text-gray-800 mb-2 text-sm sm:text-base">Award-Winning Service</h3>
                <p className="text-gray-600 text-xs sm:text-sm">Recognized for excellence in customer service and innovation.</p>
              </div>
              <div className="text-center p-4 sm:p-6 rounded-xl bg-gradient-to-br from-green-50 to-green-100 hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 animate-bounce" style={{ animationDelay: '0.1s' }}>🔒</div>
                <h3 className="font-bold text-gray-800 mb-2 text-sm sm:text-base">Bank-Grade Security</h3>
                <p className="text-gray-600 text-xs sm:text-sm">Your data and money are protected with the highest security standards.</p>
              </div>
              <div className="text-center p-4 sm:p-6 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 animate-bounce" style={{ animationDelay: '0.2s' }}>💡</div>
                <h3 className="font-bold text-gray-800 mb-2 text-sm sm:text-base">Innovation First</h3>
                <p className="text-gray-600 text-xs sm:text-sm">Always at the forefront of financial technology and services.</p>
              </div>
              <div className="text-center p-4 sm:p-6 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 animate-bounce" style={{ animationDelay: '0.3s' }}>🤝</div>
                <h3 className="font-bold text-gray-800 mb-2 text-sm sm:text-base">Personal Touch</h3>
                <p className="text-gray-600 text-xs sm:text-sm">Dedicated support team ready to help you succeed.</p>
              </div>
            </div>
          </div>

          {/* Team Values */}
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 sm:p-8 text-white text-center transform hover:scale-105 transition-all duration-300 animate-fade-in-up">
              <div className="text-4xl sm:text-5xl mb-4">🌟</div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2">Excellence</h3>
              <p className="text-blue-100 text-sm sm:text-base">We strive for excellence in everything we do, from customer service to product innovation.</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl p-6 sm:p-8 text-white text-center transform hover:scale-105 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="text-4xl sm:text-5xl mb-4">🛡️</div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2">Trust</h3>
              <p className="text-green-100 text-sm sm:text-base">Building lasting relationships through transparency, reliability, and unwavering integrity.</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 sm:p-8 text-white text-center transform hover:scale-105 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="text-4xl sm:text-5xl mb-4">🚀</div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2">Innovation</h3>
              <p className="text-purple-100 text-sm sm:text-base">Continuously pushing boundaries to create better financial solutions for our customers.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default About