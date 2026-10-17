import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';

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

  // Global scroll progress for multi-layer 3D parallax
  const { scrollY } = useScroll();
  const smoothScrollY = useSpring(scrollY, {
    stiffness: 90,
    damping: 26,
    restDelta: 0.001,
  });

  // Layer 1: Deep Background Image Parallax (Slowest Z-Plane)
  const bgY = useTransform(smoothScrollY, [0, 3000], [0, -240]);
  const bgScale = useTransform(smoothScrollY, [0, 3000], [1.12, 1.26]);
  const bgRotateX = useTransform(smoothScrollY, [0, 3000], [0, 7]);

  // Layer 2: Mid-Plane 3D Perspective Grid (Medium Z-Plane)
  const gridY = useTransform(smoothScrollY, [0, 3000], [0, -420]);
  const floorTranslateY = useTransform(smoothScrollY, [0, 3000], [0, 320]);

  // Layer 3: Near-Plane Floating 3D Geodesic Drone Spheres & Reticles (Fastest Z-Plane)
  const nearLayerY = useTransform(smoothScrollY, [0, 3000], [0, -680]);
  const farOrbY = useTransform(smoothScrollY, [0, 3000], [0, -340]);
  const droneSpin = useTransform(smoothScrollY, [0, 3000], [0, 220]);
  const droneReverseSpin = useTransform(smoothScrollY, [0, 3000], [0, -180]);

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
      style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
      aria-hidden="true"
    >
      {/* 1. Deep 3D Parallax Plane: Real Drone Laboratory Photograph */}
      <motion.img
        src={bgSource}
        alt="Galgotias Centre for Drone Intelligence & Simulation Laboratory"
        style={{
          y: bgY,
          scale: bgScale,
          rotateX: bgRotateX,
          willChange: 'transform',
        }}
        className="absolute inset-0 w-full h-[120%] -top-[10%] object-cover object-center pointer-events-none select-none opacity-30 contrast-[1.2] saturate-[0.85] mix-blend-luminosity"
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

      {/* 3. Mid-Depth 3D Parallax Architectural Blueprint Grid */}
      <motion.div
        style={{ y: gridY, willChange: 'transform' }}
        className="absolute inset-0 w-full h-[160%] opacity-[0.075] pointer-events-none"
      >
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
      </motion.div>

      {/* 4. 3D Tilted Perspective Cyber Arena Floor Grid */}
      <div
        className="absolute inset-x-0 bottom-0 h-[55vh] pointer-events-none overflow-hidden opacity-25"
        style={{ perspective: '650px' }}
      >
        <motion.div
          style={{
            y: floorTranslateY,
            rotateX: 64,
            transformOrigin: '50% 100%',
            backgroundImage: `
              linear-gradient(to right, rgba(208, 254, 29, 0.32) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(208, 254, 29, 0.32) 1px, transparent 1px)
            `,
            backgroundSize: '72px 72px',
          }}
          className="w-[140%] -left-[20%] h-[200%] -top-[60%] relative"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111210] via-transparent to-[#111210]" />
      </div>

      {/* 5. Floating 3D Parallax Wireframe Geodesic Drone Spheres & Depth Orbs */}
      <motion.div
        style={{ y: nearLayerY, willChange: 'transform' }}
        className="absolute inset-0 w-full h-[200%] pointer-events-none"
      >
        {/* Left Floating 3D Geodesic Drone Cage Sphere */}
        <motion.div
          style={{ rotate: droneSpin }}
          className="hidden lg:flex absolute top-[22%] left-[4%] w-44 h-44 opacity-[0.14] items-center justify-center"
        >
          <svg viewBox="0 0 200 200" className="w-full h-full text-[#d0fe1d]" fill="none">
            <circle cx="100" cy="100" r="88" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 4" />
            <circle cx="100" cy="100" r="68" stroke="currentColor" strokeWidth="1" />
            <ellipse cx="100" cy="100" rx="88" ry="34" stroke="currentColor" strokeWidth="1" />
            <ellipse cx="100" cy="100" rx="34" ry="88" stroke="currentColor" strokeWidth="1" />
            <ellipse
              cx="100"
              cy="100"
              rx="88"
              ry="34"
              stroke="currentColor"
              strokeWidth="1"
              transform="rotate(45 100 100)"
            />
            <ellipse
              cx="100"
              cy="100"
              rx="88"
              ry="34"
              stroke="currentColor"
              strokeWidth="1"
              transform="rotate(-45 100 100)"
            />
            <circle cx="100" cy="100" r="8" fill="currentColor" />
          </svg>
        </motion.div>

        {/* Right Floating 3D Geodesic Goal Hoop Ring */}
        <motion.div
          style={{ rotate: droneReverseSpin }}
          className="hidden lg:flex absolute top-[48%] right-[5%] w-56 h-56 opacity-[0.12] items-center justify-center"
        >
          <svg viewBox="0 0 220 220" className="w-full h-full text-[#d0fe1d]" fill="none">
            <circle cx="110" cy="110" r="96" stroke="currentColor" strokeWidth="2" />
            <circle cx="110" cy="110" r="76" stroke="currentColor" strokeWidth="1.2" strokeDasharray="10 6" />
            <circle cx="110" cy="110" r="52" stroke="currentColor" strokeWidth="1" />
            <line x1="14" y1="110" x2="206" y2="110" stroke="currentColor" strokeWidth="0.8" />
            <line x1="110" y1="14" x2="110" y2="206" stroke="currentColor" strokeWidth="0.8" />
          </svg>
        </motion.div>

        {/* Lower Left 3D Spatial Crosshair Frame */}
        <motion.div
          style={{ rotate: droneSpin }}
          className="hidden lg:flex absolute top-[78%] left-[7%] w-36 h-36 opacity-[0.12] items-center justify-center"
        >
          <svg viewBox="0 0 160 160" className="w-full h-full text-white" fill="none">
            <polygon points="80,8 148,45 148,115 80,152 12,115 12,45" stroke="currentColor" strokeWidth="1.2" />
            <polygon points="80,28 130,55 130,105 80,132 30,105 30,55" stroke="#d0fe1d" strokeWidth="1" strokeDasharray="4 4" />
          </svg>
        </motion.div>
      </motion.div>

      {/* 6. Ambient Lime Core Glows with Scroll Parallax */}
      <motion.div
        style={{ y: farOrbY }}
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[640px] h-[300px] bg-[#d0fe1d]/10 blur-[130px] rounded-full pointer-events-none"
      />
      <motion.div
        style={{ y: nearLayerY }}
        className="absolute bottom-1/4 left-1/3 w-[500px] h-[260px] bg-[#d0fe1d]/5 blur-[140px] rounded-full pointer-events-none"
      />

      {/* 7. Drag-and-Drop Overlay */}
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
