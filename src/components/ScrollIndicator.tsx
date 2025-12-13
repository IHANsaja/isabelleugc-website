// components/ScrollIndicator.tsx

import React from 'react';

const ScrollIndicator: React.FC = () => {
  return (
    // Absolute positioning at the bottom center of the viewport
    <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center space-y-3">
      
      {/* Scroll text */}
      <p className="font-instrument-sans text-sm text-black opacity-80">
        scroll to start experience
      </p>

      {/* Mouse Icon: A simple stylized pill shape that matches the image */}
      <div className="w-6 h-12 border-2 border-black rounded-full flex justify-center pt-2 animate-pulse">
        {/* Scroll wheel indicator (the small pill inside) */}
        <div className="w-1.5 h-3 bg-black rounded-full"></div>
      </div>
    </div>
  );
};

export default ScrollIndicator;