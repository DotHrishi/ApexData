const Hero = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-6 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: "url('/hero.jpg')" }}>

      <div className="absolute inset-0 bg-black/30"></div>
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          <span className="text-red-400">Apex</span>Data
        </h1>
        <p className="text-xl text-gray-200 mb-8 leading-relaxed">
          ApexData delivers live telemetry, historical comparisons, and AI-powered predictions — 
          giving fans and professionals the edge they need on and off the track.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-3 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg" onClick={() => window.location.href = '/analytics'}>
            Analyze Data
          </button>
          <button className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-black transition-all duration-200" onClick={() => window.location.href = '/technical_guides'}>
            Technical Guides
          </button>
        </div>
      </div>
    </div>
  )
}

export default Hero