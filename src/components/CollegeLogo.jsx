import React, { useState } from 'react';
import collegeLogo from './CollegeLogo.png';

export const CollegeLogo = ({
  size = 'md',
  className = '',
  showText = false,
  src
}) => {
  // Image candidates list
 const logoCandidates = [
  src,
  collegeLogo
].filter(Boolean);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [imgError, setImgError] = useState(false);

  const handleImgError = () => {
    if (currentIdx < logoCandidates.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setImgError(true);
    }
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-24 h-24',
    xl: 'w-36 h-36'
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div className={`relative flex items-center justify-center ${sizeClasses[size]}`}>
        {/* Animated outer glowing ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 opacity-80 blur-sm animate-pulse"></div>
        <div className="absolute -inset-1 rounded-full border-2 border-red-500/40 animate-ping opacity-25"></div>

        {!imgError ? (
          <img
            src={logoCandidates[currentIdx]}
            alt="R.K. Talreja College Logo"
            onError={handleImgError}
            className="w-full h-full object-contain relative z-10 drop-shadow-md transition-transform hover:scale-105 duration-300 rounded-full"
            referrerPolicy="no-referrer"
          />
        ) : (
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full relative z-10 drop-shadow-md transition-transform hover:scale-105 duration-300"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer Crimson Circle */}
            <circle cx="100" cy="100" r="96" fill="#DC2626" stroke="#990000" strokeWidth="4" />
            <circle cx="100" cy="100" r="88" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="3" />

            {/* Inner Golden Ring */}
            <circle cx="100" cy="100" r="78" fill="#7F1D1D" stroke="#EAB308" strokeWidth="2" />
            <circle cx="100" cy="100" r="70" fill="#FFFFFF" />

            {/* College Crest Shield */}
            <path
              d="M 100,45 L 140,65 V 110 C 140,140 100,160 100,160 C 100,160 60,140 60,110 V 65 Z"
              fill="#FFFFFF"
              stroke="#DC2626"
              strokeWidth="3.5"
            />

            {/* Shield Internal Divisions */}
            <path d="M 100,45 V 160" stroke="#F59E0B" strokeWidth="2.5" />
            <path d="M 60,100 H 140" stroke="#F59E0B" strokeWidth="2.5" />

            {/* Open Book Icon inside top-left of shield */}
            <path
              d="M 72,75 C 80,72 88,75 92,78 V 95 C 88,92 80,89 72,92 Z"
              fill="#DC2626"
            />
            <path
              d="M 92,78 C 96,75 104,72 112,75 V 92 C 104,89 96,92 92,95 Z"
              fill="#990000"
            />

            {/* Knowledge Lamp / Atom Icon in top-right */}
            <circle cx="120" cy="82" r="7" fill="#F59E0B" />
            <ellipse cx="120" cy="82" rx="12" ry="4" stroke="#DC2626" strokeWidth="1.5" />

            {/* Computer / Tech Grid in bottom left */}
            <rect x="70" y="115" width="22" height="16" rx="2" fill="#7F1D1D" />
            <path d="M 77,131 L 85,131 M 81,131 V 135 M 75,135 H 87" stroke="#F59E0B" strokeWidth="2" />

            {/* Ribbon with Motto "DUTY IS DELIGHT" */}
            <path
              d="M 45,160 Q 100,180 155,160 L 150,175 Q 100,192 50,175 Z"
              fill="#DC2626"
              stroke="#EAB308"
              strokeWidth="1.5"
            />
            <text
              x="100"
              y="171"
              fill="#FFFFFF"
              fontSize="8.5"
              fontWeight="bold"
              fontFamily="sans-serif"
              textAnchor="middle"
            >
              DUTY IS DELIGHT
            </text>

            {/* Circular Text: OURCAMPUS CONNECT */}
            <path id="textPath" d="M 30,100 A 70,70 0 1,1 170,100" fill="none" />
            <text fill="#FFFFFF" fontSize="11" fontWeight="900" letterSpacing="1.2">
              <textPath href="#textPath" startOffset="50%" textAnchor="middle">
                OURCAMPUS CONNECT
              </textPath>
            </text>
          </svg>
        )}
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-extrabold text-xl tracking-tight text-red-600 flex items-center gap-1.5">
            OurCampus <span className="text-gray-900">Connect</span>
          </span>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            R.K. Talreja College
          </span>
        </div>
      )}
    </div>
  );
};

