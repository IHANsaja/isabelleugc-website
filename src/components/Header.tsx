// components/Header.tsx
"use client"

import React, { useRef } from 'react';
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import NavigationOverlay from './NavigationOverlay';

const Header: React.FC = () => {
  const logoRef = useRef(null);

  // Define the speed and ease for the spin
  const spinDuration = 5.0; // Adjust for faster/slower spin

  // State for menu overlay
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  useGSAP(() => {
    // Rotation animation removed
  }, { scope: logoRef });

  return (
    <>
      <NavigationOverlay isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <header className="absolute top-5 left-0 w-full z-50 py-8 px-18">
        <div className="flex justify-between items-center">

          {/* Logo on the left */}
          <div className="flex items-center cursor-pointer">
            {/* Wrapper needed for 3D perspective.
              The 'perspective' class is crucial for rotationY to work.
            */}
            <div className="perspective">
              <img
                ref={logoRef}
                src="/assets/images/logo.png"
                alt="imagegang logo"
                // Adding transform-style to preserve 3D for better rendering
                className="w-16 h-16 bg-white rounded-full shadow-lg transform-style-preserve-3d"
              />
            </div>
          </div>

          {/* Menu button on the right */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`cursor-pointer px-4 py-2 text-black font-instrument-sans text-[10px] tracking-widest uppercase rounded-full shadow-lg transition-all duration-300 z-50 relative ${isMenuOpen ? 'bg-white hover:bg-gray-200' : 'bg-[#C5BDB6] hover:bg-opacity-90'
              }`}
            aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
          >
            {isMenuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </header>
    </>
  );
};

export default Header;