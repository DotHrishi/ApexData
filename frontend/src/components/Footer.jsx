import React from 'react';
import {SocialIcon} from 'react-social-icons';

const Footer = () => {
  return (
    <footer className="bg-black border-t border-white/10 relative z-10">
      <div className='text-white flex'>
        <div className='justify-right m-4'>
          2026 ApexData <span className='text-white/30'> | All rights reserved. | This is not affiliated with Formula 1® or FIA®.</span>
        </div>
        <div className='justify-left ml-auto mr-4'>
          <ul>
            <li className='inline-block mx-2'><SocialIcon borderRadius="0" url="https://github.com/DotHrishi" /></li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;