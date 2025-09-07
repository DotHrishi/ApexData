const Footer = () => {
  return (
    <footer className="relative bg-black">
      {/* Top racing stripe */}
      <div className="h-1 bg-gradient-to-r from-[#ff0000] via-[#0037ff] to-[#ffb700]"></div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
          
          {/* Brand and Copyright */}
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold tracking-wider">
              <span className="text-red-400"><img src="../public/Logo2.png" alt="ApexData Logo" className="w-30 h-10"/></span>
            </h2>
            <span className="text-white text-sm">© 2025 All rights reserved</span>
            <span className="text-gray-400 text-xs">*This webiste is not affiliated with Formula1 in any manner.</span>
          </div>

          {/* Quick Links */}
          <div className="flex items-center space-x-6 text-sm">
            <a href="#" className="text-gray-300 hover:text-red-400 transition-colors duration-200">Privacy</a>
            <a href="#" className="text-gray-300 hover:text-red-400 transition-colors duration-200">Terms</a>
            <a href="#" className="text-gray-300 hover:text-red-400 transition-colors duration-200">Contact</a>
            
            {/* Live indicator */}
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-gray-400">Live</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
