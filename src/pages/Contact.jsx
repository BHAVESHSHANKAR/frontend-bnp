import { useState } from 'react'
import Header from '../components/Header'
import Lottie from 'lottie-react'
import businessAnimation from '../assets/animations/Business Analysis.json'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission here
    console.log('Form submitted:', formData)
    alert('Thank you for your message! We\'ll get back to you soon.')
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
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
            Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Us</span>
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto animate-fade-in">
            We're here to help. Reach out to us anytime and we'll get back to you as soon as possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 max-w-7xl mx-auto">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10 animate-slide-in-left">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8 flex items-center">
              <span className="text-3xl mr-3">📝</span>
              Send us a Message
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="animate-fade-in-up">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-300"
                  />
                </div>
                <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-300"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-300"
                  />
                </div>
                <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-300"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="account">Account Support</option>
                    <option value="loans">Loans & Mortgages</option>
                    <option value="investments">Investment Services</option>
                    <option value="business">Business Banking</option>
                  </select>
                </div>
              </div>
              
              <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-300 resize-none"
                  placeholder="Tell us how we can help you..."
                ></textarea>
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 sm:py-4 px-6 rounded-xl text-base sm:text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg animate-fade-in-up"
                style={{ animationDelay: '0.5s' }}
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-6 sm:space-y-8">
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10 animate-slide-in-right">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8 flex items-center">
                <span className="text-3xl mr-3">📞</span>
                Get in Touch
              </h2>
              
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-start p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 hover:shadow-md transition-all duration-300 animate-fade-in-up">
                  <div className="text-2xl sm:text-3xl mr-4 animate-bounce">📍</div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-1 text-sm sm:text-base">Visit Us</h3>
                    <p className="text-gray-600 text-sm sm:text-base">
                      123 Banking Street<br />
                      Financial District<br />
                      New York, NY 10001
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start p-4 rounded-xl bg-gradient-to-r from-green-50 to-green-100 hover:shadow-md transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                  <div className="text-2xl sm:text-3xl mr-4 animate-bounce" style={{ animationDelay: '0.1s' }}>📞</div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-1 text-sm sm:text-base">Call Us</h3>
                    <p className="text-gray-600 text-sm sm:text-base">
                      Main: (555) 123-4567<br />
                      Support: (555) 123-4568<br />
                      Toll-free: 1-800-BANKING
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start p-4 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100 hover:shadow-md transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  <div className="text-2xl sm:text-3xl mr-4 animate-bounce" style={{ animationDelay: '0.2s' }}>✉️</div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-1 text-sm sm:text-base">Email Us</h3>
                    <p className="text-gray-600 text-sm sm:text-base">
                      General: info@bank.com<br />
                      Support: support@bank.com<br />
                      Business: business@bank.com
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start p-4 rounded-xl bg-gradient-to-r from-orange-50 to-orange-100 hover:shadow-md transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                  <div className="text-2xl sm:text-3xl mr-4 animate-bounce" style={{ animationDelay: '0.3s' }}>🕒</div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-1 text-sm sm:text-base">Business Hours</h3>
                    <p className="text-gray-600 text-sm sm:text-base">
                      Monday - Friday: 9:00 AM - 6:00 PM<br />
                      Saturday: 9:00 AM - 2:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl shadow-xl p-6 sm:p-8 text-white animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center mb-4">
                <div className="text-3xl mr-3 animate-pulse">🚨</div>
                <h3 className="text-xl sm:text-2xl font-bold">Emergency Support</h3>
              </div>
              <p className="text-red-100 mb-4 text-sm sm:text-base">
                For urgent matters outside business hours, our 24/7 emergency support line is available.
              </p>
              <div className="bg-white bg-opacity-20 rounded-xl p-4">
                <p className="text-lg sm:text-xl font-bold">Emergency: (555) 911-HELP</p>
              </div>
            </div>

            {/* Quick Contact Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center">
                <span className="text-xl mr-2">💬</span>
                Live Chat
              </button>
              <button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center">
                <span className="text-xl mr-2">📅</span>
                Book Meeting
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Contact