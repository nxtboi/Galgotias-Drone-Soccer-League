import React, { useState, useEffect } from 'react';

interface StormSkyBackgroundProps {
  className?: string;
}

export const StormSkyBackground: React.FC<StormSkyBackgroundProps> = ({ className = '' }) => {
  const [customImage, setCustomImage] = useState<string | null>(() => {
    try {
      return localStorage.getItem('gcdis_custom_bg');
    } catch {
      return null;
    }
  });
  const [isDragOver, setIsDragOver] = useState(false);

  // Global drag-and-drop handler for user-provided image files
  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer?.types.includes('Files')) {
        setIsDragOver(true);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDragLeave = (e: DragEvent) => {
      if (
        e.clientX <= 0 ||
        e.clientY <= 0 ||
        e.clientX >= window.innerWidth ||
        e.clientY >= window.innerHeight
      ) {
        setIsDragOver(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer?.files?.[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          if (result) {
            setCustomImage(result);
            try {
              localStorage.setItem('gcdis_custom_bg', result);
            } catch {}
          }
        };
        reader.readAsDataURL(file);
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

  const bgSource = customImage || '/bg.jpg';

  return (
    <div
      className={`fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0 bg-[#111210] ${className}`}
      aria-hidden="true"
    >
      {/* 1. Static Background: Real Drone Laboratory Photograph */}
      <img
        src={bgSource}
        alt="Galgotias Centre for Drone Intelligence & Simulation Laboratory"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none opacity-30 contrast-[1.2] saturate-[0.85] mix-blend-luminosity"
        onError={(e) => {
          const target = e.currentTarget;
          if (!target.src.includes('drone-lab.jpg') && !target.src.includes('drone%20lab.jpg')) {
            target.src = '/drone-lab.jpg';
          }
        }}
      />

      {/* 2. XOTC Deep Obsidian & Neon Volt Radial Glow Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 0%, rgba(208, 254, 29, 0.15) 0%, rgba(17, 18, 16, 0.78) 45%, #111210 85%)',
        }}
      />

      {/* 3. Subtle Static Architectural Grid */}
      <div className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.65) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.65) 1px, transparent 1px)
            `,
            backgroundSize: '96px 96px',
          }}
        />
      </div>

      {/* 4. Ambient Static Lime Core Glow */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[640px] h-[300px] bg-[#d0fe1d]/10 blur-[130px] rounded-full pointer-events-none" />

      {/* 5. Drag-and-Drop Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-[#111210]/90 backdrop-blur-md border-2 border-dashed border-[#d0fe1d] flex flex-col items-center justify-center pointer-events-auto z-50">
          <div className="p-8 bg-[#171915] border border-[#d0fe1d] shadow-2xl flex flex-col items-center gap-3 text-center">
            <span className="text-4xl animate-bounce">🛬</span>
            <h3 className="font-orbitron text-xl font-bold text-white uppercase tracking-wider">
              DROP ARENA IMAGE HERE
            </h3>
            <p className="text-xs font-mono text-[#d0fe1d] max-w-xs">
              Release to update the background image.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StormSkyBackground;
