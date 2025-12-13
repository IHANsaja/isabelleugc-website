// components/Header.tsx
"use client"

import React, { useRef } from 'react';
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const Header: React.FC = () => {
  const logoRef = useRef(null);
  
  // Define the speed and ease for the spin
  const spinDuration = 5.0; // Adjust for faster/slower spin
  
  useGSAP(() => {
    if (logoRef.current) {
      // GSAP TWEEN: Spin the logo 360 degrees around the Y-axis (vertical axis)
      gsap.to(logoRef.current, {
        rotationY: 360, // <-- Key change: Use rotationY for horizontal spin
        duration: spinDuration,
        ease: "linear",  // Keep speed constant
        repeat: -1,      // Repeat indefinitely
      });
    }
  }, { scope: logoRef }); 

  return (
    <header className="absolute top-0 left-0 w-full z-20 p-8">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        
        {/* Logo on the left */}
        <div className="flex items-center">
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
          className="px-6 py-2 bg-[#C5BDB6] text-black font-instrument-sans text-sm tracking-widest uppercase rounded-full shadow-lg hover:bg-opacity-90 transition-colors"
          aria-label="Open Menu"
        >
          Menu
        </button>
      </div>
    </header>
  );
};

export default Header;