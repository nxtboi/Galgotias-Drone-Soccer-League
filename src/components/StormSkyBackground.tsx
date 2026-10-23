import React from 'react';

interface StormSkyBackgroundProps {
  className?: string;
}

export const StormSkyBackground: React.FC<StormSkyBackgroundProps> = ({ className = '' }) => {
  return (
    <div
      className={`absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0 bg-[#111210] ${className}`}
      aria-hidden="true"
    >
      {/* Subtle Top Radial Glow (scrolls naturally with the page, no fixed parallax) */}
      <div
        className="absolute inset-x-0 top-0 h-[700px] pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 0%, rgba(208, 254, 29, 0.1) 0%, rgba(17, 18, 16, 0.85) 55%, #111210 100%)',
        }}
      />
    </div>
  );
};

export default StormSkyBackground;
