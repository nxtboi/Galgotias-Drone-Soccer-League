import * as THREE from 'three';

export interface DroneSoccerConfig {
  radius: number; // e.g. 0.20m for Class 40, 0.11m for Class 20
  primaryColor: number; // e.g. 0x0088ff (Blue) or 0xff2222 (Red)
  role: 'striker' | 'keeper' | 'defender' | 'midfielder';
  hasRibbon?: boolean;
  name?: string;
}

export interface DroneSoccerInstance {
  group: THREE.Group;
  props: THREE.Mesh[];
  ledMeshes: THREE.Mesh[];
  ribbonMesh?: THREE.Mesh;
  statusLed?: THREE.Mesh;
  config: DroneSoccerConfig;
  update: (deltaTime: number, throttle: number, isArmed: boolean, currentTime: number) => void;
  setColor: (colorHex: number) => void;
}

/**
 * Creates an ultra-realistic 3D Drone Soccer Ball model conforming to FIDA specifications.
 * Includes geodesic protective exoskeleton, internal racing quadcopter, brushless motors,
 * tri-blade bullnose props, LiPo battery pack, FPV lens, and 360-degree LED ring.
 */
export function createDroneSoccerBall(config: DroneSoccerConfig): DroneSoccerInstance {
  const { radius, primaryColor, role, hasRibbon = role === 'striker' } = config;
  const droneGroup = new THREE.Group();

  // --- 1. Geodesic Polycarbonate / Carbon Exoskeleton Cage ---
  // A dual-hemisphere geodesic cage with reinforced structural ribs
  const cageGeometry = new THREE.IcosahedronGeometry(radius, 2);
  const cageMaterial = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    metalness: 0.85,
    roughness: 0.25,
    wireframe: true,
  });
  const cageMesh = new THREE.Mesh(cageGeometry, cageMaterial);
  cageMesh.castShadow = true;
  droneGroup.add(cageMesh);

  // Carbon Fiber Equatorial Structural Ring
  const equatorTorusGeo = new THREE.TorusGeometry(radius * 0.99, 0.009, 12, 48);
  const carbonRingMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.9,
    roughness: 0.3,
  });
  const equatorRing = new THREE.Mesh(equatorTorusGeo, carbonRingMat);
  equatorRing.rotation.x = Math.PI / 2;
  droneGroup.add(equatorRing);

  // Carbon Fiber Meridian Structural Ring
  const meridianRing = new THREE.Mesh(equatorTorusGeo, carbonRingMat);
  droneGroup.add(meridianRing);

  // Quick-release latch nodes on equator
  const latchGeo = new THREE.BoxGeometry(0.016, 0.012, 0.024);
  const latchMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 });
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2;
    const latch = new THREE.Mesh(latchGeo, latchMat);
    latch.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
    latch.rotation.y = -angle;
    droneGroup.add(latch);
  }

  // Inner impact-deflecting protective polycarbonate shell (translucent)
  const innerShellGeo = new THREE.SphereGeometry(radius * 0.95, 24, 16);
  const innerShellMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transmission: 0.9,
    opacity: 0.45,
    transparent: true,
    roughness: 0.1,
    ior: 1.52,
  });
  const innerShell = new THREE.Mesh(innerShellGeo, innerShellMat);
  droneGroup.add(innerShell);

  // --- 2. 360-Degree Addressable RGB LED Rings ---
  const ledRingGeo = new THREE.TorusGeometry(radius * 0.97, 0.014, 12, 48);
  const ledMaterial = new THREE.MeshStandardMaterial({
    color: primaryColor,
    emissive: primaryColor,
    emissiveIntensity: 2.8,
    roughness: 0.15,
  });
  const equatorLedMesh = new THREE.Mesh(ledRingGeo, ledMaterial);
  equatorLedMesh.rotation.x = Math.PI / 2;
  droneGroup.add(equatorLedMesh);

  // Vertical Meridian LED Arc
  const meridianLedMesh = new THREE.Mesh(ledRingGeo, ledMaterial);
  droneGroup.add(meridianLedMesh);

  const ledMeshes = [equatorLedMesh, meridianLedMesh];

  // --- 3. Internal Quadcopter Core ---
  // Carbon Fiber X-Frame Center Hub
  const hubGeo = new THREE.CylinderGeometry(radius * 0.22, radius * 0.22, 0.022, 16);
  const carbonPlateMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.4,
    metalness: 0.7,
  });
  const centerHub = new THREE.Mesh(hubGeo, carbonPlateMat);
  droneGroup.add(centerHub);

  // 4 Diagonal Tubular Carbon-Fiber Arms extending to motors
  const armLen = radius * 1.05;
  const armGeo = new THREE.CylinderGeometry(0.007, 0.007, armLen, 8);
  const arm1 = new THREE.Mesh(armGeo, carbonPlateMat);
  arm1.rotation.z = Math.PI / 2;
  arm1.rotation.y = Math.PI / 4;
  droneGroup.add(arm1);

  const arm2 = new THREE.Mesh(armGeo, carbonPlateMat);
  arm2.rotation.z = Math.PI / 2;
  arm2.rotation.y = -Math.PI / 4;
  droneGroup.add(arm2);

  // Central Flight Controller Stack & ESC
  const fcGeo = new THREE.BoxGeometry(radius * 0.35, 0.02, radius * 0.35);
  const fcMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.6, metalness: 0.8 });
  const fcMesh = new THREE.Mesh(fcGeo, fcMat);
  fcMesh.position.y = 0.016;
  droneGroup.add(fcMesh);

  // Blinking Micro Status LED on FC
  const statusLedGeo = new THREE.SphereGeometry(0.008, 8, 8);
  const statusLedMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
  const statusLed = new THREE.Mesh(statusLedGeo, statusLedMat);
  statusLed.position.set(radius * 0.1, 0.03, radius * 0.1);
  droneGroup.add(statusLed);

  // Central 4S/6S LiPo Battery Block & Strap
  const battGeo = new THREE.BoxGeometry(radius * 0.42, radius * 0.24, radius * 0.24);
  const battMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
  const battMesh = new THREE.Mesh(battGeo, battMat);
  battMesh.position.set(0, -0.025, 0);
  droneGroup.add(battMesh);

  // Battery Yellow XT60 Connector
  const xt60Geo = new THREE.BoxGeometry(0.015, 0.012, 0.015);
  const xt60Mat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 });
  const xt60 = new THREE.Mesh(xt60Geo, xt60Mat);
  xt60.position.set(0, -0.025, radius * 0.15);
  droneGroup.add(xt60);

  // FPV Camera Lens peering forward between cage ribs
  const cameraMountGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.028, 12);
  const cameraMountMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
  const cameraMount = new THREE.Mesh(cameraMountGeo, cameraMountMat);
  cameraMount.rotation.x = Math.PI / 2;
  cameraMount.position.set(0, 0.01, radius * 0.65);
  droneGroup.add(cameraMount);

  const lensGlassGeo = new THREE.SphereGeometry(0.01, 12, 8);
  const lensGlassMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.1,
    metalness: 0.95,
  });
  const lensGlass = new THREE.Mesh(lensGlassGeo, lensGlassMat);
  lensGlass.position.set(0, 0.01, radius * 0.67);
  droneGroup.add(lensGlass);

  // --- 4. High-Performance Brushless Motors & Tri-Blade Propellers ---
  const motorPositions = [
    [radius * 0.37, 0.018, radius * 0.37],
    [-radius * 0.37, 0.018, radius * 0.37],
    [radius * 0.37, 0.018, -radius * 0.37],
    [-radius * 0.37, 0.018, -radius * 0.37],
  ];

  const motorBaseGeo = new THREE.CylinderGeometry(0.026, 0.026, 0.024, 16);
  const motorBellMat = new THREE.MeshStandardMaterial({
    color: primaryColor,
    metalness: 0.9,
    roughness: 0.2,
  });

  const props: THREE.Mesh[] = [];

  motorPositions.forEach(([mx, my, mz]) => {
    // Motor Bell Housing
    const motor = new THREE.Mesh(motorBaseGeo, motorBellMat);
    motor.position.set(mx, my, mz);
    motor.castShadow = true;
    droneGroup.add(motor);

    // Motor Shaft Nut
    const nutGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.01, 8);
    const nutMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95 });
    const nut = new THREE.Mesh(nutGeo, nutMat);
    nut.position.set(mx, my + 0.02, mz);
    droneGroup.add(nut);

    // Tri-blade Bullnose Racing Propeller
    const propGroup = new THREE.Group();
    propGroup.position.set(mx, my + 0.018, mz);

    const bladeLen = radius * 0.42;
    const bladeGeo = new THREE.BoxGeometry(bladeLen, 0.003, 0.022);
    const bladeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.25,
      transparent: true,
      opacity: 0.88,
    });

    for (let b = 0; b < 3; b++) {
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.rotation.y = (b * Math.PI * 2) / 3;
      blade.position.x = Math.cos((b * Math.PI * 2) / 3) * (bladeLen * 0.4);
      blade.position.z = Math.sin((b * Math.PI * 2) / 3) * (bladeLen * 0.4);
      propGroup.add(blade);
    }

    droneGroup.add(propGroup);
    props.push(propGroup as unknown as THREE.Mesh);
  });

  // --- 5. FIDA Striker Ribbon / Tail Streamer ---
  let ribbonMesh: THREE.Mesh | undefined;
  if (hasRibbon) {
    const ribbonGeo = new THREE.PlaneGeometry(radius * 0.4, radius * 2.2, 4, 12);
    const ribbonMat = new THREE.MeshStandardMaterial({
      color: primaryColor,
      side: THREE.DoubleSide,
      roughness: 0.4,
      metalness: 0.1,
      transparent: true,
      opacity: 0.9,
    });
    ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat);
    ribbonMesh.position.set(0, 0, -radius * 1.15);
    ribbonMesh.rotation.x = Math.PI / 2;
    droneGroup.add(ribbonMesh);
  }

  // --- 6. Goalkeeper / Defender Armored Plate ---
  if (role === 'keeper') {
    const shieldRingGeo = new THREE.TorusGeometry(radius * 0.7, 0.018, 8, 24);
    const shieldMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 1.8,
      metalness: 0.7,
      roughness: 0.3,
    });
    const shield = new THREE.Mesh(shieldRingGeo, shieldMat);
    shield.position.set(0, 0, radius * 0.5);
    droneGroup.add(shield);
  }

  const setColor = (colorHex: number) => {
    ledMeshes.forEach((mesh) => {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.color.setHex(colorHex);
      mat.emissive.setHex(colorHex);
    });
    if (ribbonMesh) {
      const mat = ribbonMesh.material as THREE.MeshStandardMaterial;
      mat.color.setHex(colorHex);
    }
  };

  const update = (deltaTime: number, throttle: number, isArmed: boolean, currentTime: number) => {
    // Propeller spinning animation
    const speed = isArmed ? (throttle * 55 + 8) : 0;
    props.forEach((prop, i) => {
      prop.rotation.y += speed * deltaTime * (i % 2 === 0 ? 1 : -1);
    });

    // Blinking status LED
    if (statusLed) {
      const isBlink = Math.sin(currentTime * 0.008) > 0;
      (statusLed.material as THREE.MeshBasicMaterial).color.setHex(
        isArmed ? (isBlink ? 0x22c55e : 0x15803d) : 0xef4444
      );
    }

    // Ribbon wave flutter
    if (ribbonMesh) {
      const wave = Math.sin(currentTime * 0.012 + throttle * 10) * 0.22;
      ribbonMesh.rotation.z = wave;
    }
  };

  return {
    group: droneGroup,
    props,
    ledMeshes,
    ribbonMesh,
    statusLed,
    config,
    update,
    setColor,
  };
}
