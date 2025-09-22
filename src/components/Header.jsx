import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          {/* Logo */}
          <Link to="/" className="flex items-center z-10">
            <span className={`text-2xl font-bold transition-colors duration-300 ${
              isScrolled ? 'text-gray-900' : 'text-gray-800'
            }`}>Risk Analyzer</span>
          </Link>

          {/* Desktop Navigation - Clean Style */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`font-medium transition-all duration-300 hover:text-green-600 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-green-600 after:transition-all after:duration-300 hover:after:w-full ${
                isScrolled 
                  ? 'text-gray-700' 
                  : 'text-gray-800'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/about" 
              className={`font-medium transition-all duration-300 hover:text-green-600 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-green-600 after:transition-all after:duration-300 hover:after:w-full ${
                isScrolled 
                  ? 'text-gray-700' 
                  : 'text-gray-800'
              }`}
            >
              About
            </Link>
            <Link 
              to="/services" 
              className={`font-medium transition-all duration-300 hover:text-green-600 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-green-600 after:transition-all after:duration-300 hover:after:w-full ${
                isScrolled 
                  ? 'text-gray-700' 
                  : 'text-gray-800'
              }`}
            >
              Services
            </Link>
            <Link 
              to="/contact" 
              className={`font-medium transition-all duration-300 hover:text-green-600 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-green-600 after:transition-all after:duration-300 hover:after:w-full ${
                isScrolled 
                  ? 'text-gray-700' 
                  : 'text-gray-800'
              }`}
            >
              Contact
            </Link>
            {/* Debug link - only show in development */}
            {(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
              <Link 
                to="/api-test" 
                className={`font-medium transition-all duration-300 hover:text-red-600 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-red-600 after:transition-all after:duration-300 hover:after:w-full ${
                  isScrolled 
                    ? 'text-red-500' 
                    : 'text-red-600'
                }`}
                title="API Debug Tool"
              >
                🔧 API Test
              </Link>
            )}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              to="/login"
              className={`font-medium px-6 py-2 transition-all duration-300 hover:text-green-600 ${
                isScrolled 
                  ? 'text-gray-700' 
                  : 'text-gray-800'
              }`}
            >
              Login
            </Link>
            <Link 
              to="/signup"
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:from-green-700 hover:to-green-800 hover:scale-105 hover:shadow-lg transform"
            >
              Signup
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`md:hidden p-2 rounded-full transition-all duration-300 ${
              isScrolled 
                ? 'text-gray-700 hover:bg-green-50' 
                : 'text-gray-700 hover:bg-white/30'
            }`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-green-200/30 bg-white/95 backdrop-blur-md rounded-b-2xl mt-2 mx-4 shadow-xl animate-fade-in-up">
            <div className="flex flex-col space-y-2 px-4">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-green-600 hover:bg-green-50 px-4 py-3 rounded-xl transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/about" 
                className="text-gray-700 hover:text-green-600 hover:bg-green-50 px-4 py-3 rounded-xl transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                to="/services" 
                className="text-gray-700 hover:text-green-600 hover:bg-green-50 px-4 py-3 rounded-xl transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Services
              </Link>
              <Link 
                to="/contact" 
                className="text-gray-700 hover:text-green-600 hover:bg-green-50 px-4 py-3 rounded-xl transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="flex flex-col space-y-3 pt-4 border-t border-green-200/50">
                <Link 
                  to="/login"
                  className="text-green-600 font-medium text-left px-4 py-2 hover:bg-green-50 rounded-xl transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/signup"
                  className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl font-medium hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Signup
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header