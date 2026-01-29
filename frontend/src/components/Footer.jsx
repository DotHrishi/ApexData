import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-black border-t border-white/10 py-8 relative z-10">
      <div className="container mx-auto px-4 text-center">
        <p className="text-gray-400 font-orbitron text-sm">
          &copy; {new Date().getFullYear()} <span className="text-white font-bold">ApexData</span> | All rights reserved. | This site is not associated with Formula 1 .
        </p>
        <div className="flex justify-center gap-6 mt-4 text-gray-500 text-xs">
          <a href="#" className="hover:text-blue-500 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-blue-500 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-blue-500 transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;