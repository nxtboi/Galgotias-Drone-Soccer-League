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
  const [transparency, setTransparency] = useState<number>(() => {
    try {
      localStorage.setItem('gcdis_bg_transparency', '0');
      return 0;
    } catch {
      return 0;
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
      if (e.clientX <= 0 || e.clientY <= 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
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
      className={`fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0 bg-slate-900/5 ${className}`}
      aria-hidden="true"
    >
      {/* 1. Real Drone Laboratory Photograph Background (Prominently Visible) */}
      <img
        src={bgSource}
        alt="Galgotias Centre for Drone Intelligence & Simulation Laboratory"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none transition-opacity duration-700 opacity-80 contrast-[1.08] saturate-[1.1]"
        onError={(e) => {
          const target = e.currentTarget;
          if (!target.src.includes('drone-lab.jpg') && !target.src.includes('drone%20lab.jpg')) {
            target.src = '/drone-lab.jpg';
          }
        }}
      />

      {/* 2. Soft Aerospace Blue Atmospheric Frosted Overlay (Keeps lab clearly visible while enhancing blue text contrast) */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-sky-50/40 to-white/65 pointer-events-none backdrop-blur-[0.5px]" />

      {/* 3. Subtle Technical Coordinate Grid in Light Sky/Slate */}
      <div 
        className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* 4. Drag-and-Drop Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-zinc-900/10 backdrop-blur-md border-4 border-dashed border-zinc-900 flex flex-col items-center justify-center pointer-events-auto z-50">
          <div className="p-6 rounded-3xl bg-white border border-zinc-300 shadow-2xl flex flex-col items-center gap-3 text-center">
            <span className="text-4xl animate-bounce">🛬</span>
            <h3 className="font-sans text-xl font-bold text-zinc-900">
              DROP LAB IMAGE HERE
            </h3>
            <p className="text-xs font-mono text-zinc-600 max-w-xs">
              Release to update the background image.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
