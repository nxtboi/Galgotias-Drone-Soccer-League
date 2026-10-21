import React from 'react';

export interface Parallax3DSectionProps {
  children: React.ReactNode;
  className?: string;
  offsetY?: number;
  rotateXRange?: [number, number, number];
  scaleRange?: [number, number, number];
  depthZ?: number;
}

/**
 * Standard flat section wrapper (3D parallax disabled).
 */
export const Parallax3DSection: React.FC<Parallax3DSectionProps> = ({
  children,
  className = '',
}) => {
  return <div className={`relative ${className}`}>{children}</div>;
};

export interface ParallaxLayerProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  translateZ?: number;
}

/**
 * Standard flat layer wrapper (3D depth parallax disabled).
 */
export const ParallaxDepthLayer: React.FC<ParallaxLayerProps> = ({
  children,
  className = '',
}) => {
  return <div className={className}>{children}</div>;
};

export interface Tilt3DCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  scrollOffsetY?: number;
  onClick?: () => void;
}

/**
 * Standard flat card wrapper (3D pointer tilt and scroll parallax disabled).
 */
export const Tilt3DCard: React.FC<Tilt3DCardProps> = ({
  children,
  className = '',
  onClick,
}) => {
  return (
    <div onClick={onClick} className={className}>
      <div className="w-full h-full">{children}</div>
    </div>
  );
};
