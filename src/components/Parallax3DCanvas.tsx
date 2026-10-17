import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export interface Parallax3DCanvasProps {
  className?: string;
  enabled?: boolean;
}

export const Parallax3DCanvas: React.FC<Parallax3DCanvasProps> = ({
  className = '',
  enabled = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [altitude, setAltitude] = useState<number>(3.2);
  const [speedKmh, setSpeedKmh] = useState<number>(48);

  useEffect(() => {
    // Check user preference for reduced motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(motionQuery.matches);
    const handleMotionChange = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    motionQuery.addEventListener('change', handleMotionChange);

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container || !enabled) return;

    // --- 1. Scene, Camera & WebGL Renderer Setup ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x111210, 0.038);

    const camera = new THREE.PerspectiveCamera(
      52,
      window.innerWidth / window.innerHeight,
      0.1,
      120
    );
    camera.position.set(0, 2.5, 7.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.pointerEvents = 'none';

    container.appendChild(renderer.domElement);

    // --- 2. Lighting Rig (Warm Key + Acid Lime Rim + Cool Hemisphere Fill) ---
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x111210, 0.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(5, 8, 6);
    scene.add(keyLight);

    const limeRimLight = new THREE.DirectionalLight(0xd0fe1d, 2.2);
    limeRimLight.position.set(-6, 3, -4);
    scene.add(limeRimLight);

    const blueBackLight = new THREE.PointLight(0x0284c7, 3, 20);
    blueBackLight.position.set(3, -2, -2);
    scene.add(blueBackLight);

    // --- 3. Procedural 3D Drone Soccer Ball Builder ---
    const reusableGeos: THREE.BufferGeometry[] = [];
    const reusableMats: THREE.Material[] = [];

    const createParallaxDrone = (
      radius: number,
      primaryColor: number,
      emissiveIntensity: number = 2.4
    ) => {
      const droneGroup = new THREE.Group();

      // Geodesic Polycarbonate / Carbon Exoskeleton Cage
      const cageGeo = new THREE.IcosahedronGeometry(radius, 2);
      reusableGeos.push(cageGeo);
      const cageMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.88,
        roughness: 0.22,
        wireframe: true,
      });
      reusableMats.push(cageMat);
      const cageMesh = new THREE.Mesh(cageGeo, cageMat);
      droneGroup.add(cageMesh);

      // Carbon Equatorial & Meridian Structural Rings
      const ringGeo = new THREE.TorusGeometry(radius * 0.99, radius * 0.045, 12, 36);
      reusableGeos.push(ringGeo);
      const carbonMat = new THREE.MeshStandardMaterial({
        color: 0x171915,
        metalness: 0.92,
        roughness: 0.35,
      });
      reusableMats.push(carbonMat);

      const equatorRing = new THREE.Mesh(ringGeo, carbonMat);
      equatorRing.rotation.x = Math.PI / 2;
      droneGroup.add(equatorRing);

      const meridianRing = new THREE.Mesh(ringGeo, carbonMat);
      droneGroup.add(meridianRing);

      // Glowing LED Ring Arc
      const ledGeo = new THREE.TorusGeometry(radius * 0.97, radius * 0.04, 10, 36);
      reusableGeos.push(ledGeo);
      const ledMat = new THREE.MeshStandardMaterial({
        color: primaryColor,
        emissive: primaryColor,
        emissiveIntensity,
        roughness: 0.15,
      });
      reusableMats.push(ledMat);

      const ledEquator = new THREE.Mesh(ledGeo, ledMat);
      ledEquator.rotation.x = Math.PI / 2;
      droneGroup.add(ledEquator);

      // Central Racing Drone Quad Body
      const bodyGeo = new THREE.CylinderGeometry(radius * 0.38, radius * 0.44, radius * 0.18, 8);
      reusableGeos.push(bodyGeo);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.9,
        roughness: 0.2,
      });
      reusableMats.push(bodyMat);
      const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
      droneGroup.add(bodyMesh);

      // Quad Arms & Propeller Rotors
      const armGeo = new THREE.BoxGeometry(radius * 1.25, radius * 0.05, radius * 0.08);
      reusableGeos.push(armGeo);
      const armMesh1 = new THREE.Mesh(armGeo, carbonMat);
      armMesh1.rotation.y = Math.PI / 4;
      droneGroup.add(armMesh1);

      const armMesh2 = new THREE.Mesh(armGeo, carbonMat);
      armMesh2.rotation.y = -Math.PI / 4;
      droneGroup.add(armMesh2);

      // 4 Fast-spinning transparent Propeller Discs
      const propGeo = new THREE.CylinderGeometry(radius * 0.28, radius * 0.28, 0.005, 16);
      reusableGeos.push(propGeo);
      const propMat = new THREE.MeshBasicMaterial({
        color: primaryColor,
        transparent: true,
        opacity: 0.35,
        wireframe: true,
      });
      reusableMats.push(propMat);

      const props: THREE.Mesh[] = [];
      const motorOffset = radius * 0.45;
      const positions = [
        [motorOffset, 0.02, motorOffset],
        [-motorOffset, 0.02, motorOffset],
        [motorOffset, 0.02, -motorOffset],
        [-motorOffset, 0.02, -motorOffset],
      ];

      positions.forEach(([x, y, z]) => {
        const prop = new THREE.Mesh(propGeo, propMat);
        prop.position.set(x, y, z);
        droneGroup.add(prop);
        props.push(prop);
      });

      return { group: droneGroup, props };
    };

    // --- 4. Instantiate Multi-Layer 3D Drones (Foreground Striker, Midground Defender, Deep Striker) ---
    // Drone 1: Foreground Striker (Acid Lime #d0fe1d)
    const striker1 = createParallaxDrone(0.55, 0xd0fe1d, 3.2);
    striker1.group.position.set(2.4, 0.8, 1.8);
    scene.add(striker1.group);

    // Drone 2: Midground Defender (Cyber Cyan #00ffff)
    const defender1 = createParallaxDrone(0.48, 0x00f0ff, 2.6);
    defender1.group.position.set(-2.6, -0.6, -1.2);
    scene.add(defender1.group);

    // Drone 3: Deep Fast Attacker (Electric Crimson #ff2a5f)
    const striker2 = createParallaxDrone(0.42, 0xff2a5f, 2.8);
    striker2.group.position.set(1.6, -2.8, -4.5);
    scene.add(striker2.group);

    // --- 5. 3D Holographic Regulation Goal Hoops at Parallax Depths ---
    const createGoalHoop = (radius: number, colorHex: number, position: THREE.Vector3) => {
      const hoopGroup = new THREE.Group();

      // Outer Torus Ring
      const torusGeo = new THREE.TorusGeometry(radius, radius * 0.08, 16, 48);
      reusableGeos.push(torusGeo);
      const torusMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: 2.2,
        roughness: 0.15,
      });
      reusableMats.push(torusMat);
      const torus = new THREE.Mesh(torusGeo, torusMat);
      hoopGroup.add(torus);

      // Inner Score Sensing Ring (Dotted Wireframe)
      const innerTorusGeo = new THREE.TorusGeometry(radius * 0.86, 0.02, 8, 32);
      reusableGeos.push(innerTorusGeo);
      const innerMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.75,
      });
      reusableMats.push(innerMat);
      const innerTorus = new THREE.Mesh(innerTorusGeo, innerMat);
      hoopGroup.add(innerTorus);

      // Hanging Stanchion Beam
      const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, 3, 12);
      reusableGeos.push(poleGeo);
      const poleMat = new THREE.MeshStandardMaterial({
        color: 0x242820,
        metalness: 0.85,
        roughness: 0.3,
      });
      reusableMats.push(poleMat);
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.y = 1.5 + radius;
      hoopGroup.add(pole);

      hoopGroup.position.copy(position);
      return hoopGroup;
    };

    const hoop1 = createGoalHoop(1.1, 0xd0fe1d, new THREE.Vector3(-0.8, 0.4, -2.5));
    hoop1.rotation.y = 0.35;
    scene.add(hoop1);

    const hoop2 = createGoalHoop(0.95, 0x00f0ff, new THREE.Vector3(2.2, -3.2, -6.8));
    hoop2.rotation.y = -0.45;
    scene.add(hoop2);

    // --- 6. 3D Arena Perspective Grid & Digital Particles ---
    // Floating Floor Flight Matrix Grid
    const gridHelper = new THREE.GridHelper(36, 36, 0xd0fe1d, 0x1f241c);
    gridHelper.position.y = -4.5;
    gridHelper.material.opacity = 0.38;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Secondary Ceiling Ballistic Wireframe Grid
    const ceilingGrid = new THREE.GridHelper(36, 24, 0x00f0ff, 0x151912);
    ceilingGrid.position.y = 6.0;
    ceilingGrid.material.opacity = 0.22;
    ceilingGrid.material.transparent = true;
    scene.add(ceilingGrid);

    // Instanced Telemetry Particles (Sparks & Flight Trajectory Dust)
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const colorA = new THREE.Color(0xd0fe1d);
    const colorB = new THREE.Color(0x38bdf8);
    const colorC = new THREE.Color(0xffffff);

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      particlePositions[idx] = (Math.random() - 0.5) * 18;
      particlePositions[idx + 1] = (Math.random() - 0.5) * 14 - 1;
      particlePositions[idx + 2] = (Math.random() - 0.5) * 16 - 2;

      const randColor = Math.random() > 0.6 ? colorA : Math.random() > 0.3 ? colorB : colorC;
      particleColors[idx] = randColor.r;
      particleColors[idx + 1] = randColor.g;
      particleColors[idx + 2] = randColor.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
    reusableGeos.push(particleGeo);

    const particleMat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    reusableMats.push(particleMat);

    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // --- 7. Interactive Parallax Tracking State ---
    let targetScrollProgress = 0;
    let currentScrollProgress = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleScroll = () => {
      const maxScroll = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1
      );
      targetScrollProgress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Map cursor coordinates to [-1, 1]
      targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('resize', handleResize);

    // Initial sync
    handleScroll();

    // --- 8. Animation & Parallax Render Loop ---
    let animationFrameId: number;
    let lastTime = performance.now();
    let isVisible = true;

    const handleVisibilityChange = () => {
      isVisible = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisible) return;

      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsedTime = clock.getElapsedTime();

      // Exponential damping for buttery-smooth parallax interpolation
      const dampFactor = isReducedMotion ? 0.05 : 0.08;
      currentScrollProgress = THREE.MathUtils.damp(
        currentScrollProgress,
        targetScrollProgress,
        isReducedMotion ? 1.5 : 3.8,
        delta
      );
      currentMouseX = THREE.MathUtils.damp(currentMouseX, targetMouseX, 3.2, delta);
      currentMouseY = THREE.MathUtils.damp(currentMouseY, targetMouseY, 3.2, delta);

      // --- A. Dynamic 3D Camera Parallax Flight Path ---
      // As user scrolls down, camera sweeps along a curved flight path through the cage arena
      const p = currentScrollProgress;
      const mouseInfluenceX = isReducedMotion ? 0 : currentMouseX * 0.45;
      const mouseInfluenceY = isReducedMotion ? 0 : currentMouseY * 0.35;

      // Base camera trajectory based on scroll progression:
      // Hero (0.0): elevated high angle
      // Overview (0.35): banking dive through hoop 1
      // Voices (0.7): tactical low-angle sideline
      // Footer (1.0): high-altitude cage perspective
      const camTargetX = Math.sin(p * Math.PI * 1.5) * 1.8 + mouseInfluenceX;
      const camTargetY = 2.5 - p * 3.8 + mouseInfluenceY;
      const camTargetZ = 7.5 - p * 6.2;

      camera.position.x = camTargetX;
      camera.position.y = camTargetY;
      camera.position.z = camTargetZ;

      // Look slightly ahead of camera path with slight mouse panning
      const lookAtTarget = new THREE.Vector3(
        mouseInfluenceX * 0.8,
        -p * 3.5,
        -p * 4.5
      );
      camera.lookAt(lookAtTarget);

      // Subtle camera banking rotation (roll) during high-speed turns
      camera.rotation.z = Math.sin(p * Math.PI * 2) * 0.08 + mouseInfluenceX * 0.04;

      // --- B. 3D Drone Kinematics & Parallax Translation ---
      // Fast propeller rotations
      const propSpinSpeed = 45;
      [...striker1.props, ...defender1.props, ...striker2.props].forEach((prop) => {
        prop.rotation.y += propSpinSpeed * delta;
      });

      // Striker 1 (Foreground Hero): Flies dynamically, banking toward goal hoop 1
      const striker1BaseX = 2.4 - p * 2.8 + Math.sin(elapsedTime * 1.2) * 0.25;
      const striker1BaseY = 0.8 - p * 3.2 + Math.cos(elapsedTime * 1.5) * 0.2;
      const striker1BaseZ = 1.8 - p * 4.8;

      striker1.group.position.set(striker1BaseX, striker1BaseY, striker1BaseZ);
      striker1.group.rotation.x = Math.sin(elapsedTime * 2 + p * 4) * 0.25 + 0.15;
      striker1.group.rotation.y += 0.8 * delta;
      striker1.group.rotation.z = Math.cos(elapsedTime * 1.8) * 0.25 - 0.2;

      // Defender 1 (Midground): Moves laterally guarding hoop 1
      const defenderBaseX = -2.6 + Math.sin(elapsedTime * 1.8) * 1.2;
      const defenderBaseY = -0.6 - p * 2.5 + Math.cos(elapsedTime * 2.2) * 0.35;
      const defenderBaseZ = -1.2 - p * 3.8;

      defender1.group.position.set(defenderBaseX, defenderBaseY, defenderBaseZ);
      defender1.group.rotation.x = Math.sin(elapsedTime * 1.5) * 0.2;
      defender1.group.rotation.y -= 0.6 * delta;
      defender1.group.rotation.z = Math.sin(elapsedTime * 2.5) * 0.15;

      // Striker 2 (Distant Attacker): Fast looping run toward hoop 2
      const striker2BaseX = Math.cos(elapsedTime * 1.4 + p * 3) * 2.6;
      const striker2BaseY = -2.8 - p * 1.8 + Math.sin(elapsedTime * 2) * 0.4;
      const striker2BaseZ = -4.5 - p * 2.5 + Math.sin(elapsedTime * 1.4) * 1.5;

      striker2.group.position.set(striker2BaseX, striker2BaseY, striker2BaseZ);
      striker2.group.rotation.y += 1.4 * delta;
      striker2.group.rotation.x = 0.2;

      // --- C. Goal Hoops Parallax Drift & Subtle Pulsing ---
      hoop1.position.y = 0.4 - p * 0.8;
      hoop1.rotation.y = 0.35 + Math.sin(elapsedTime * 0.4) * 0.08;

      hoop2.position.y = -3.2 - p * 0.6;
      hoop2.rotation.y = -0.45 + Math.cos(elapsedTime * 0.5) * 0.08;

      // Subtle particle float
      particleSystem.rotation.y += 0.025 * delta;
      particleSystem.position.y = -p * 2.0;

      // Render frame
      renderer.render(scene, camera);

      // Periodically update lightweight HUD telemetry
      const now = performance.now();
      if (now - lastTime > 250) {
        lastTime = now;
        const currentAlt = Math.max(0.5, Number((3.6 - p * 2.2).toFixed(1)));
        const currentSpd = Math.round(42 + Math.abs(targetScrollProgress - currentScrollProgress) * 320 + Math.sin(elapsedTime * 2) * 6);
        setAltitude(currentAlt);
        setSpeedKmh(currentSpd);
      }
    };

    animate();

    // --- 9. Clean Lifecycle Disposal ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      // Dispose Three.js objects
      reusableGeos.forEach((geo) => geo.dispose());
      reusableMats.forEach((mat) => mat.dispose());
      renderer.dispose();

      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    };
  }, [enabled, isReducedMotion]);

  if (!enabled) return null;

  return (
    <div
      ref={mountRef}
      className={`fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-10 ${className}`}
      aria-hidden="true"
    >
      {/* Flight Telemetry HUD Widget (Unobtrusive Floating Layer in Corner) */}
      <div className="hidden md:flex fixed bottom-6 left-6 z-30 pointer-events-auto items-center gap-3 bg-[#111210]/85 backdrop-blur-md px-3.5 py-2 border border-white/15 text-[10px] font-mono text-neutral-300 shadow-xl">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#d0fe1d] animate-ping" />
          <span className="font-orbitron font-bold text-[#d0fe1d] tracking-wider uppercase">
            3D PARALLAX
          </span>
        </div>
        <span className="text-neutral-600">|</span>
        <div className="flex items-center gap-3 tabular-nums">
          <span>ALT: <span className="text-white font-bold">{altitude}m</span></span>
          <span>AIRSPEED: <span className="text-white font-bold">{speedKmh} km/h</span></span>
          <span className="text-neutral-500 hidden lg:inline">Z-DEPTH: <span className="text-[#d0fe1d]">FIDA ARENA</span></span>
        </div>
      </div>
    </div>
  );
};

export default Parallax3DCanvas;
