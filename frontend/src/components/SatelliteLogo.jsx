import React from 'react';

const SatelliteLogo = ({ className = "w-6 h-6", color = "currentColor" }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        {/* Left Solar Panel */}
        <rect x="2" y="8" width="5" height="8" rx="1" />
        <line x1="7" y1="12" x2="10" y2="12" />
        <line x1="4.5" y1="8" x2="4.5" y2="16" />
        
        {/* Right Solar Panel */}
        <rect x="17" y="8" width="5" height="8" rx="1" />
        <line x1="14" y1="12" x2="17" y2="12" />
        <line x1="19.5" y1="8" x2="19.5" y2="16" />

        {/* Central Body (Satellite Core) */}
        <path d="M12 16c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z" />
        <circle cx="12" cy="12" r="1" fill={color} />

        {/* Top Antenna */}
        <line x1="12" y1="8" x2="12" y2="3" />
        <path d="M9 5c1.7-1.3 4.3-1.3 6 0" />

        {/* Bottom Sensor / Camera */}
        <path d="M11 16l-1 3h4l-1-3" />
    </svg>
);

export default SatelliteLogo;
