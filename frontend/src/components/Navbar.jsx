const Navbar = () => {
  return (
    <nav className="relative bg-[#000]">
      {/* Main navbar container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo/Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-white tracking-wider">
                <a href="/"><img src="../public/Logo2.png" alt="ApexData Logo" className="w-44 h-14"/></a>
              </h1>
            </div>
            
            {/* Desktop Navigation Links */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="/" className="text-white hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors duration-200">
                  Home
                </a>
                <a href="#" className="text-gray-300 hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors duration-200">
                  Drivers
                </a>
                <a href="/teams" className="text-gray-300 hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors duration-200">
                  Teams
                </a>
                <a href="#" className="text-gray-300 hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors duration-200">
                  Technical
                </a>
              </div>
            </div>
          </div>

          {/* Right side - Search and Profile */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="search"
                placeholder="Search drivers, teams..."
                className="bg-black/30 text-white placeholder-gray-400 px-4 py-2 pr-10 rounded-full border border-gray-600 focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-blue-400 w-64"
              />
              <svg className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Profile/User Menu */}
            <div className="relative">
              <button className="flex items-center space-x-2 text-white hover:text-red-400 transition-colors duration-200">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-700 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold">U</span>
                </div>
                <span className="text-sm font-medium">Profile</span>
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-white hover:text-red-400 p-2">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom gradient border */}
      <div className="h-1 bg-gradient-to-r from-[#ff0000] via-[#0037ff] to-[#ffb700]"></div>
      
      {/* Racing stripe effect */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"></div>
    </nav>
  )
}

export default Navbar