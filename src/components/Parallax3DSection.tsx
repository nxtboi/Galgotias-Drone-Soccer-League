import React, { useRef, useState, useEffect } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
} from 'motion/react';

export interface Parallax3DSectionProps {
  children: React.ReactNode;
  className?: string;
  /** Vertical parallax offset in pixels across viewport traversal */
  offsetY?: number;
  /** Maximum 3D X-axis tilt angle in degrees during scroll */
  rotateXRange?: [number, number, number];
  /** Scale curve across scroll [enter, center, exit] */
  scaleRange?: [number, number, number];
  /** Optional Z-depth translation in px */
  depthZ?: number;
}

/**
 * Scroll-driven 3D Perspective Section container.
 * Pitch-tilts, scales, and translates in 3D space as the user scrolls through the page.
 */
export const Parallax3DSection: React.FC<Parallax3DSectionProps> = ({
  children,
  className = '',
  offsetY = 70,
  rotateXRange = [9, 0, -7],
  scaleRange = [0.95, 1, 0.96],
  depthZ = 0,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 26,
    restDelta: 0.001,
  });

  const y = useTransform(smoothProgress, [0, 0.5, 1], [offsetY, 0, -offsetY]);
  const rotateX = useTransform(smoothProgress, [0, 0.5, 1], rotateXRange);
  const scale = useTransform(smoothProgress, [0, 0.5, 1], scaleRange);
  const opacity = useTransform(smoothProgress, [0, 0.15, 0.85, 1], [0.65, 1, 1, 0.65]);

  if (prefersReducedMotion) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`relative ${className}`}
      style={{ perspective: '1300px', transformStyle: 'preserve-3d' }}
    >
      <motion.div
        style={{
          y,
          rotateX,
          scale,
          opacity,
          z: depthZ,
          transformStyle: 'preserve-3d',
          willChange: 'transform, opacity',
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export interface ParallaxLayerProps {
  children: React.ReactNode;
  className?: string;
  /** Positive moves faster upward, negative lags behind */
  speed?: number;
  /** 3D translateZ elevation in pixels */
  translateZ?: number;
}

/**
 * Individual depth plane inside a 3D section that moves at a distinct scroll velocity.
 */
export const ParallaxDepthLayer: React.FC<ParallaxLayerProps> = ({
  children,
  className = '',
  speed = 0.25,
  translateZ = 30,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    restDelta: 0.001,
  });

  const travel = speed * 160;
  const y = useTransform(smoothProgress, [0, 1], [travel, -travel]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        y,
        z: translateZ,
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
    >
      {children}
    </motion.div>
  );
};

export interface Tilt3DCardProps {
  children: React.ReactNode;
  className?: string;
  /** Maximum degrees of 3D tilt on pointer hover */
  maxTilt?: number;
  /** Vertical scroll parallax shift in pixels */
  scrollOffsetY?: number;
  onClick?: () => void;
}

/**
 * Interactive 3D Card combining scroll-linked vertical parallax with pointer-tracked 3D rotation.
 */
export const Tilt3DCard: React.FC<Tilt3DCardProps> = ({
  children,
  className = '',
  maxTilt = 6,
  scrollOffsetY = 35,
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 160, damping: 22 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [maxTilt, -maxTilt]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-maxTilt, maxTilt]), springConfig);

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'end start'],
  });

  const smoothScroll = useSpring(scrollYProgress, { stiffness: 110, damping: 26 });
  const scrollY = useTransform(
    smoothScroll,
    [0, 0.5, 1],
    [scrollOffsetY, 0, -scrollOffsetY]
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{ perspective: '1100px', transformStyle: 'preserve-3d' }}
    >
      <motion.div
        style={{
          y: scrollY,
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </div>
  );
};
