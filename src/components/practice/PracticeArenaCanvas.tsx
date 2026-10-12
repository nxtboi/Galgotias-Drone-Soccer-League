import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { practiceAudio } from '../../utils/practiceAudio';
import {
  TransmitterChannels,
  transmitter,
  FlightMode,
} from '../../utils/transmitterManager';
import {
  createDroneSoccerBall,
  DroneSoccerInstance,
} from './droneSoccerModel';
import {
  createSoccerStadiumArena,
  createSkyfenceCageArena,
  createGalgotiasLabArena,
  ArenaType,
  ArenaEnvironmentResult,
} from './arenaEnvironments';

export type CameraViewMode = 'fpv' | 'chase' | 'pilot' | 'referee' | 'orbit';
export type PracticeDrillMode = 'free' | 'rush60' | 'penalty5s' | 'slalom';
export type MatchDroneId = 'blue_striker' | 'blue_keeper' | 'blue_defender' | 'red_striker' | 'red_keeper' | 'red_defender';

export interface PracticeArenaCanvasProps {
  cameraMode: CameraViewMode;
  drillMode: PracticeDrillMode;
  arenaClass: 'class40' | 'class20';
  arenaType?: ArenaType;
  matchMode?: 'team3v3' | 'duel1v1' | 'solo';
  activeDroneId?: MatchDroneId;
  strikerColor: 'red' | 'blue' | 'green' | 'yellow' | 'cyan' | 'magenta' | 'white';
  onGoalScored: (team: 'blue' | 'red', newScore: { blue: number; red: number }) => void;
  onTelemetryUpdate: (telemetry: {
    altitude: number;
    speedKmh: number;
    batteryVoltage: number;
    offside: boolean;
    armed: boolean;
    flightMode: FlightMode;
    throttlePct: number;
    pitchDeg: number;
    rollDeg: number;
    yawDeg: number;
  }) => void;
  drillTimerSeconds?: number;
  isDrillRunning?: boolean;
  onDrillTimeUp?: () => void;
  resetTrigger?: number;
}

interface DroneEntity {
  id: MatchDroneId;
  name: string;
  isPlayer: boolean;
  model: DroneSoccerInstance;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  rot: THREE.Euler;
  quat: THREE.Quaternion;
  pitch: number;
  roll: number;
  yaw: number;
  initialPos: THREE.Vector3;
  radius: number;
  team: 'blue' | 'red';
  role: 'striker' | 'keeper' | 'defender';
  targetAlt: number;
  aiState: {
    targetPos: THREE.Vector3;
    lastDecisionTime: number;
    shootCooldown: number;
  };
}

export const PracticeArenaCanvas: React.FC<PracticeArenaCanvasProps> = ({
  cameraMode,
  drillMode,
  arenaClass,
  arenaType = 'stadium',
  matchMode = 'team3v3',
  activeDroneId = 'blue_striker',
  strikerColor,
  onGoalScored,
  onTelemetryUpdate,
  resetTrigger,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Score state
  const scoreRef = useRef<{ blue: number; red: number }>({ blue: 0, red: 0 });
  const offsideRef = useRef<boolean>(false);
  const lastGoalTimeRef = useRef<number>(0);

  // Three.js instances ref
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const orbitControlsRef = useRef<OrbitControls | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Arena reference
  const arenaResultRef = useRef<ArenaEnvironmentResult | null>(null);

  // Drone fleet
  const dronesRef = useRef<DroneEntity[]>([]);

  // Battery voltage simulator (starts at 16.8V for 4S LiPo)
  const batteryVoltageRef = useRef<number>(16.8);

  // Reset Drone handler when resetTrigger updates
  useEffect(() => {
    if (resetTrigger === undefined || resetTrigger === 0) return;
    const player = dronesRef.current.find((d) => d.id === activeDroneId) || dronesRef.current[0];
    if (player) {
      player.pos.copy(player.initialPos);
      player.vel.set(0, 0, 0);
      const initYaw = player.team === 'blue' ? Math.PI / 2 : -Math.PI / 2;
      player.yaw = initYaw;
      player.pitch = 0;
      player.roll = 0;
      player.targetAlt = player.initialPos.y;
      player.quat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), initYaw);
      player.model.group.position.copy(player.pos);
      player.model.group.quaternion.copy(player.quat);
      practiceAudio.playBeep(true);
    }
  }, [resetTrigger, activeDroneId]);

  // Confetti / Celebration Particles
  const particlesRef = useRef<THREE.Points | null>(null);
  const particleVelocitiesRef = useRef<THREE.Vector3[]>([]);

  // Slalom checkpoint gates
  const slalomGatesRef = useRef<THREE.Group[]>([]);
  const currentGateIndexRef = useRef<number>(0);

  // Drone ball radius
  const droneRadius = arenaClass === 'class40' ? 0.20 : 0.11;

  // Color lookup for FIDA 7 colors
  const colorMap: Record<string, number> = {
    red: 0xff2222,
    blue: 0x0088ff,
    green: 0x00ff66,
    yellow: 0xffd700,
    cyan: 0x00f0ff,
    magenta: 0xff00cc,
    white: 0xffffff,
  };

  // Trigger goal celebration effect
  const triggerGoalCelebration = (team: 'blue' | 'red') => {
    practiceAudio.playGoalHorn();
    practiceAudio.playRefereeWhistle();

    // Flash goal light
    if (arenaResultRef.current) {
      const lights = arenaResultRef.current.goalHoops;
      const targetLight = team === 'red' ? lights.redLight : lights.blueLight;
      if (targetLight) {
        targetLight.intensity = 18;
        setTimeout(() => {
          if (targetLight) targetLight.intensity = 3.5;
        }, 800);
      }
    }

    // Confetti burst
    if (particlesRef.current && arenaResultRef.current) {
      const posAttr = particlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const originX = team === 'red' ? arenaResultRef.current.goalHoops.redPos.x : arenaResultRef.current.goalHoops.bluePos.x;
      const originY = arenaResultRef.current.goalHoops.redPos.y;
      for (let i = 0; i < particleVelocitiesRef.current.length; i++) {
        posAttr.setXYZ(i, originX, originY, 0);
        particleVelocitiesRef.current[i].set(
          (Math.random() - 0.5) * 10 + (team === 'red' ? -3 : 3),
          Math.random() * 7 + 1.5,
          (Math.random() - 0.5) * 9
        );
      }
      posAttr.needsUpdate = true;
    }

    // Score callback
    scoreRef.current = {
      ...scoreRef.current,
      [team]: scoreRef.current[team] + 1,
    };
    onGoalScored(team, scoreRef.current);
  };

  // Main Three.js Scene Setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene & Atmosphere
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    if (arenaType === 'stadium') {
      scene.background = new THREE.Color(0x0a1128); // Stadium night sky
      scene.fog = new THREE.FogExp2(0x0a1128, 0.018);
    } else {
      scene.background = new THREE.Color(0x070c18);
      scene.fog = new THREE.FogExp2(0x070c18, 0.025);
    }

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(
      70,
      container.clientWidth / container.clientHeight,
      0.05,
      250
    );
    cameraRef.current = camera;
    camera.position.set(-11, 5, 0);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // 4. Orbit Controls
    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControlsRef.current = orbitControls;
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.05;
    orbitControls.maxPolarAngle = Math.PI / 2 - 0.01;
    orbitControls.minDistance = 0.8;
    orbitControls.maxDistance = 50;
    orbitControls.target.set(0, 1.8, 0);

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.75);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.1);
    dirLight.position.set(5, 20, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 40;
    scene.add(dirLight);

    // 6. Build Chosen Arena Environment
    let arenaEnv: ArenaEnvironmentResult;
    if (arenaType === 'stadium') {
      arenaEnv = createSoccerStadiumArena(arenaClass);
    } else if (arenaType === 'lab') {
      arenaEnv = createGalgotiasLabArena(arenaClass);
    } else {
      arenaEnv = createSkyfenceCageArena(arenaClass);
    }
    arenaResultRef.current = arenaEnv;
    scene.add(arenaEnv.arenaGroup);

    // 7. Build Full Fleet of Real Drone Soccers
    const drones: DroneEntity[] = [];

    // Helper to spawn a drone entity
    const spawnDrone = (
      id: MatchDroneId,
      name: string,
      team: 'blue' | 'red',
      role: 'striker' | 'keeper' | 'defender',
      initialPos: THREE.Vector3,
      teamColorHex: number
    ): DroneEntity => {
      const droneModel = createDroneSoccerBall({
        radius: droneRadius,
        primaryColor: teamColorHex,
        role,
        hasRibbon: role === 'striker',
        name,
      });
      scene.add(droneModel.group);
      droneModel.group.position.copy(initialPos);

      // Blue team faces East (+X, opposing red goal); Red team faces West (-X, opposing blue goal)
      const initialYaw = team === 'blue' ? Math.PI / 2 : -Math.PI / 2;
      const initialQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), initialYaw);
      droneModel.group.quaternion.copy(initialQuat);

      return {
        id,
        name,
        isPlayer: id === activeDroneId,
        model: droneModel,
        pos: initialPos.clone(),
        vel: new THREE.Vector3(0, 0, 0),
        rot: new THREE.Euler(0, initialYaw, 0, 'YXZ'),
        quat: initialQuat,
        pitch: 0,
        roll: 0,
        yaw: initialYaw,
        initialPos: initialPos.clone(),
        radius: droneRadius,
        team,
        role,
        targetAlt: initialPos.y,
        aiState: {
          targetPos: initialPos.clone(),
          lastDecisionTime: 0,
          shootCooldown: 0,
        },
      };
    };

    // Blue Team Real Drone Soccers
    const userColorHex = colorMap[strikerColor] || 0x0088ff;
    const blueGoalPos = arenaEnv.goalHoops.bluePos;
    const redGoalPos = arenaEnv.goalHoops.redPos;

    // 1. Blue Striker (Player's default Drone)
    drones.push(
      spawnDrone(
        'blue_striker',
        'Blue Striker 01',
        'blue',
        'striker',
        new THREE.Vector3(-2.0, 0.5, 0),
        userColorHex
      )
    );

    if (matchMode !== 'solo') {
      // 2. Red Striker (Active AI Drone Soccer)
      drones.push(
        spawnDrone(
          'red_striker',
          'Red Striker 09',
          'red',
          'striker',
          new THREE.Vector3(2.5, 1.8, 0.5),
          0xff2222
        )
      );

      // 3. Red Keeper (Defending Red Goal)
      drones.push(
        spawnDrone(
          'red_keeper',
          'Red Goalie 00',
          'red',
          'keeper',
          new THREE.Vector3(redGoalPos.x - 0.45, redGoalPos.y, 0),
          0xef4444
        )
      );

      if (matchMode === 'team3v3') {
        // 4. Blue Keeper
        drones.push(
          spawnDrone(
            'blue_keeper',
            'Blue Goalie 00',
            'blue',
            'keeper',
            new THREE.Vector3(blueGoalPos.x + 0.45, blueGoalPos.y, 0),
            0x0077ee
          )
        );

        // 5. Blue Defender
        drones.push(
          spawnDrone(
            'blue_defender',
            'Blue Defender 04',
            'blue',
            'defender',
            new THREE.Vector3(-1.0, 1.5, -1.5),
            0x0284c7
          )
        );

        // 6. Red Defender
        drones.push(
          spawnDrone(
            'red_defender',
            'Red Defender 05',
            'red',
            'defender',
            new THREE.Vector3(1.2, 1.5, 1.2),
            0xdc2626
          )
        );
      }
    }

    dronesRef.current = drones;

    // 8. Slalom Course Gates (For Slalom Drill)
    const gateTorusGeo = new THREE.TorusGeometry(0.7, 0.05, 16, 32);
    const gateMat = new THREE.MeshStandardMaterial({
      color: 0x00ffcc,
      emissive: 0x00ccaa,
      emissiveIntensity: 1.2,
    });
    const gatePositions = [
      new THREE.Vector3(-4, 1.8, 2),
      new THREE.Vector3(0, 2.8, -2),
      new THREE.Vector3(4, 2.0, 1.5),
      new THREE.Vector3(2, 3.2, -1.5),
      new THREE.Vector3(-2, 1.5, -2),
    ];
    slalomGatesRef.current = [];
    gatePositions.forEach((pos) => {
      const gateGroup = new THREE.Group();
      gateGroup.position.copy(pos);
      const ring = new THREE.Mesh(gateTorusGeo, gateMat.clone());
      ring.rotation.y = Math.PI / 4;
      gateGroup.add(ring);
      scene.add(gateGroup);
      slalomGatesRef.current.push(gateGroup);
    });

    // 9. Goal Celebration Confetti Particles
    const pCount = 200;
    const pGeo = new THREE.BufferGeometry();
    const pPositions = new Float32Array(pCount * 3);
    const pColors = new Float32Array(pCount * 3);
    particleVelocitiesRef.current = [];

    for (let i = 0; i < pCount; i++) {
      pPositions[i * 3] = 0;
      pPositions[i * 3 + 1] = -100;
      pPositions[i * 3 + 2] = 0;

      const pColor = new THREE.Color().setHSL(Math.random(), 0.9, 0.6);
      pColors[i * 3] = pColor.r;
      pColors[i * 3 + 1] = pColor.g;
      pColors[i * 3 + 2] = pColor.b;

      particleVelocitiesRef.current.push(new THREE.Vector3());
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));

    const pMat = new THREE.PointsMaterial({
      size: 0.09,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);
    particlesRef.current = particles;

    // Resize Handler using requestAnimationFrame to eliminate ResizeObserver loop limit errors
    let resizeRafId: number | null = null;
    let lastWidth = 0;
    let lastHeight = 0;

    const handleResize = () => {
      if (resizeRafId !== null) {
        cancelAnimationFrame(resizeRafId);
      }
      resizeRafId = requestAnimationFrame(() => {
        resizeRafId = null;
        if (!container || !rendererRef.current || !cameraRef.current) return;
        const width = Math.floor(container.clientWidth);
        const height = Math.floor(container.clientHeight);
        if (width <= 0 || height <= 0) return;
        if (width === lastWidth && height === lastHeight) return;

        lastWidth = width;
        lastHeight = height;
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(width, height, false);
      });
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (resizeRafId !== null) {
        cancelAnimationFrame(resizeRafId);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      practiceAudio.stopMotor();
      if (rendererRef.current && rendererRef.current.domElement) {
        container.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, [arenaClass, arenaType, matchMode]);

  // Update Player Drone Color when prop changes
  useEffect(() => {
    const playerDrone = dronesRef.current.find((d) => d.id === activeDroneId);
    if (playerDrone) {
      const col = colorMap[strikerColor] || 0x0088ff;
      playerDrone.model.setColor(col);
    }
  }, [strikerColor, activeDroneId]);

  // Main Physics and Animation Loop
  useEffect(() => {
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      animationFrameRef.current = requestAnimationFrame(animate);

      const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;

      const arena = arenaResultRef.current;
      const drones = dronesRef.current;
      const scene = sceneRef.current;
      const camera = cameraRef.current;
      const renderer = rendererRef.current;

      if (!arena || !scene || !camera || !renderer) return;

      const bounds = arena.bounds;
      const goalHoops = arena.goalHoops;

      // 1. Identify User Controlled Drone
      const player = drones.find((d) => d.id === activeDroneId) || drones[0];

      // 2. Poll Transmitter Channels for Player Drone
      const ch: TransmitterChannels = transmitter.poll(deltaTime);

      // Audio feedback
      if (player && ch.armed) {
        practiceAudio.startMotor();
        practiceAudio.updateMotorThrottle(ch.throttle);
      } else {
        practiceAudio.stopMotor();
      }

      // 3. Update Each Drone in the Fleet
      drones.forEach((drone) => {
        const isPlayer = drone.id === activeDroneId;

        if (isPlayer) {
          // --- USER CONTROL DYNAMICS ---
          if (ch.armed) {
            const mass = arenaClass === 'class40' ? 1.05 : 0.11;
            const gravity = -9.81;
            const maxThrust = mass * 9.81 * 2.7;
            let collectiveThrust = ch.throttle * maxThrust;

            if (ch.flightMode === 'alt_hold') {
              drone.targetAlt = Math.max(0.3, Math.min(bounds.height - 0.5, drone.targetAlt + (ch.throttle - 0.5) * 3.0 * deltaTime));
              const altError = drone.targetAlt - drone.pos.y;
              collectiveThrust = mass * (9.81 + altError * 4.0 - drone.vel.y * 2.5);
              collectiveThrust = Math.max(0, Math.min(maxThrust, collectiveThrust));
            }

            if (ch.flightMode === 'angle' || ch.flightMode === 'alt_hold') {
              const maxAngleRad = THREE.MathUtils.degToRad(38);
              const targetPitch = ch.pitch * maxAngleRad; // positive = pitch nose down / forward
              const targetRoll = ch.roll * maxAngleRad;   // positive = roll right / bank right
              const maxYawRate = THREE.MathUtils.degToRad(200);

              // Smooth body angles toward target
              drone.pitch += (targetPitch - drone.pitch) * (14.0 * deltaTime);
              drone.roll += (targetRoll - drone.roll) * (14.0 * deltaTime);
              // Positive yaw turns clockwise (right) viewed from above
              drone.yaw += ch.yaw * maxYawRate * deltaTime;

              // Build rotation quaternion from body axes:
              // 1. Heading rotation in horizontal plane around world Y
              const qYaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), drone.yaw);
              // 2. Pitch rotation around local transverse X axis:
              // Nose down (+pitch) tilts top forward towards local +Z
              const qPitch = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), drone.pitch);
              // 3. Roll rotation around local longitudinal Z axis:
              // Bank right (+roll) tilts top right towards local +X
              const qRoll = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -drone.roll);

              drone.quat.copy(qYaw).multiply(qPitch).multiply(qRoll);
            } else {
              // Acro / Rate mode: sticks command angular velocities
              const acroRate = THREE.MathUtils.degToRad(360);
              const qYawRate = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), ch.yaw * acroRate * deltaTime);
              const qPitchRate = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), ch.pitch * acroRate * deltaTime);
              const qRollRate = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -ch.roll * acroRate * deltaTime);

              drone.quat.premultiply(qYawRate).multiply(qPitchRate).multiply(qRollRate).normalize();

              // Extract angles for telemetry
              drone.rot.setFromQuaternion(drone.quat, 'YXZ');
              drone.yaw = drone.rot.y;
              drone.pitch = drone.rot.x;
              drone.roll = -drone.rot.z;
            }

            drone.model.group.quaternion.copy(drone.quat);

            const thrustDir = new THREE.Vector3(0, 1, 0).applyQuaternion(drone.quat);
            const accel = thrustDir.multiplyScalar(collectiveThrust / mass);
            accel.y += gravity;

            // Drag
            const dragCoeff = 0.65;
            accel.x -= drone.vel.x * dragCoeff;
            accel.y -= drone.vel.y * (dragCoeff * 0.5);
            accel.z -= drone.vel.z * dragCoeff;

            drone.vel.addScaledVector(accel, deltaTime);
            drone.pos.addScaledVector(drone.vel, deltaTime);
          } else {
            // Disarmed: fall
            if (drone.pos.y > drone.radius) {
              drone.vel.y += -9.81 * deltaTime;
              drone.pos.y += drone.vel.y * deltaTime;
            } else {
              drone.vel.set(0, 0, 0);
              drone.pos.y = drone.radius;
            }
          }

          // Update player model visual props and LEDs
          drone.model.update(deltaTime, ch.throttle, ch.armed, currentTime);
        } else {
          // --- AI DRONE DYNAMICS ---
          // Intelligent behavior based on role and team
          const ai = drone.aiState;

          if (drone.role === 'keeper') {
            // Guard own goal hoop
            const goalPos = drone.team === 'red' ? goalHoops.redPos : goalHoops.bluePos;
            const xOffset = drone.team === 'red' ? -0.45 : 0.45;
            // Intercept incoming striker
            const threatStriker = drones.find((d) => d.team !== drone.team && d.role === 'striker');
            const targetZ = threatStriker ? THREE.MathUtils.clamp(threatStriker.pos.z * 0.7, -1.2, 1.2) : Math.sin(currentTime * 0.003) * 0.5;
            const targetY = threatStriker ? THREE.MathUtils.clamp(threatStriker.pos.y, goalPos.y - 0.4, goalPos.y + 0.4) : goalPos.y + Math.cos(currentTime * 0.002) * 0.3;

            ai.targetPos.set(goalPos.x + xOffset, targetY, targetZ);
          } else if (drone.role === 'striker') {
            // Hunt opponent's goal hoop and shoot!
            const targetGoal = drone.team === 'red' ? goalHoops.bluePos : goalHoops.redPos;
            if (currentTime - ai.lastDecisionTime > 2500) {
              ai.lastDecisionTime = currentTime;
              // Approach goal with dynamic weaving
              const approachX = targetGoal.x + (drone.team === 'red' ? 1.5 : -1.5);
              ai.targetPos.set(approachX, targetGoal.y + (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 2.0);
            }
          } else {
            // Defender: Patrol mid-court and challenge opponent
            if (currentTime - ai.lastDecisionTime > 3000) {
              ai.lastDecisionTime = currentTime;
              const midX = (drone.team === 'red' ? 1 : -1) * (bounds.maxX * 0.3);
              ai.targetPos.set(midX + (Math.random() - 0.5) * 3, 1.6 + Math.random() * 1.5, (Math.random() - 0.5) * (bounds.maxZ * 0.8));
            }
          }

          // Smoothly steer AI drone toward target
          const toTarget = ai.targetPos.clone().sub(drone.pos);
          const dist = toTarget.length();
          if (dist > 0.05) {
            toTarget.normalize();
            const aiSpeed = drone.role === 'striker' ? 3.8 : 2.5;
            drone.vel.lerp(toTarget.multiplyScalar(aiSpeed), 4.0 * deltaTime);
          }
          drone.pos.addScaledVector(drone.vel, deltaTime);

          // Tilt AI drone toward velocity direction
          drone.rot.z = -drone.vel.x * 0.15;
          drone.rot.x = drone.vel.z * 0.15;
          drone.rot.y = Math.atan2(drone.vel.z, drone.vel.x);
          drone.quat.setFromEuler(drone.rot);
          drone.model.group.quaternion.copy(drone.quat);

          drone.model.update(deltaTime, 0.75, true, currentTime);
        }

        // --- ARENA BOUNDARY BOUNCING ---
        const r = drone.radius;
        const restitution = 0.58;

        // Floor
        if (drone.pos.y < r) {
          drone.pos.y = r;
          if (Math.abs(drone.vel.y) > 0.4) {
            practiceAudio.playCollision(Math.min(1, Math.abs(drone.vel.y) / 4));
          }
          drone.vel.y = -drone.vel.y * restitution;
          drone.vel.x *= 0.85;
          drone.vel.z *= 0.85;
        }
        // Ceiling
        if (drone.pos.y > bounds.height - r) {
          drone.pos.y = bounds.height - r;
          practiceAudio.playCollision(0.4);
          drone.vel.y = -drone.vel.y * restitution;
        }
        // North / South Sidewalls
        if (Math.abs(drone.pos.z) > bounds.maxZ - r) {
          const sign = Math.sign(drone.pos.z);
          drone.pos.z = sign * (bounds.maxZ - r);
          practiceAudio.playCollision(0.5);
          drone.vel.z = -drone.vel.z * restitution;
        }
        // West / East Endwalls
        if (Math.abs(drone.pos.x) > bounds.maxX - r) {
          const sign = Math.sign(drone.pos.x);
          drone.pos.x = sign * (bounds.maxX - r);
          practiceAudio.playCollision(0.5);
          drone.vel.x = -drone.vel.x * restitution;
        }

        // Update 3D Group Position
        drone.model.group.position.copy(drone.pos);
      });

      // 4. Elastic Mid-Air Drone-to-Drone Collisions
      for (let i = 0; i < drones.length; i++) {
        for (let j = i + 1; j < drones.length; j++) {
          const d1 = drones[i];
          const d2 = drones[j];
          const dist = d1.pos.distanceTo(d2.pos);
          const minDist = d1.radius + d2.radius;

          if (dist < minDist && dist > 0.001) {
            // Collision detected! Calculate normal and impulse
            const normal = d1.pos.clone().sub(d2.pos).normalize();
            const overlap = minDist - dist;

            // Push apart
            d1.pos.addScaledVector(normal, overlap * 0.5);
            d2.pos.addScaledVector(normal, -overlap * 0.5);

            // Relative velocity
            const relVel = d1.vel.clone().sub(d2.vel);
            const velAlongNormal = relVel.dot(normal);

            if (velAlongNormal < 0) {
              const impulseMag = -(1 + 0.8) * velAlongNormal / 2;
              const impulse = normal.clone().multiplyScalar(impulseMag);

              d1.vel.add(impulse);
              d2.vel.sub(impulse);

              // Sound impact
              practiceAudio.playCageClash(Math.min(1, Math.abs(velAlongNormal) / 3));
            }
          }
        }
      }

      // 5. Interactive Soccer Ball Physics & Drone-Ball Collisions
      if (arena.soccerBallPhysics) {
        arena.soccerBallPhysics.update(deltaTime);

        // Check if any drone collided with the soccer ball
        drones.forEach((drone) => {
          if (arena.soccerBallPhysics) {
            const ballDist = drone.pos.distanceTo(arena.soccerBallPhysics.pos);
            const ballMinDist = drone.radius + arena.soccerBallPhysics.radius;

            if (ballDist < ballMinDist) {
              const kickDir = arena.soccerBallPhysics.pos.clone().sub(drone.pos).normalize();
              const kickImpulse = kickDir.multiplyScalar(drone.vel.length() * 1.5 + 2.0);
              arena.soccerBallPhysics.kick(kickImpulse);

              // Drone recoil
              drone.vel.addScaledVector(kickDir, -1.2);
              practiceAudio.playBallKick();
            }
          }
        });
      }

      // 6. Goal Scoring Detection & Offside Rule
      if (player) {
        const pPos = player.pos;

        // East (Red Goal: player Blue Striker scores by passing through into +X)
        const distToRedHoop = pPos.distanceTo(goalHoops.redPos);
        if (distToRedHoop < goalHoops.radius * 0.95 && Math.abs(pPos.x - goalHoops.redPos.x) < 0.28) {
          if (player.vel.x > 0.4 && !offsideRef.current && currentTime - lastGoalTimeRef.current > 1800) {
            lastGoalTimeRef.current = currentTime;
            offsideRef.current = true;
            triggerGoalCelebration('blue');
          }
        }

        // West (Blue Goal: player Red Striker scores into -X)
        const distToBlueHoop = pPos.distanceTo(goalHoops.bluePos);
        if (distToBlueHoop < goalHoops.radius * 0.95 && Math.abs(pPos.x - goalHoops.bluePos.x) < 0.28) {
          if (player.vel.x < -0.4 && !offsideRef.current && currentTime - lastGoalTimeRef.current > 1800) {
            lastGoalTimeRef.current = currentTime;
            offsideRef.current = true;
            triggerGoalCelebration('red');
          }
        }

        // Offside Clear Check: Crossing pitch center (X = 0)
        if (offsideRef.current && Math.abs(pPos.x) < 0.9) {
          offsideRef.current = false;
          practiceAudio.playBeep(true);
        }
      }

      // Also check AI Red Striker scoring against Blue Goal!
      const aiRedStriker = drones.find((d) => d.id === 'red_striker');
      if (aiRedStriker) {
        const distToBlueHoop = aiRedStriker.pos.distanceTo(goalHoops.bluePos);
        if (distToBlueHoop < goalHoops.radius * 0.95 && Math.abs(aiRedStriker.pos.x - goalHoops.bluePos.x) < 0.3) {
          if (currentTime - lastGoalTimeRef.current > 3000) {
            lastGoalTimeRef.current = currentTime;
            triggerGoalCelebration('red');
            // Reset AI striker to mid pitch
            aiRedStriker.pos.set(1.5, 1.8, 0);
          }
        }
      }

      // 7. Slalom Gate Check
      if (drillMode === 'slalom' && slalomGatesRef.current.length > 0 && player) {
        const targetGate = slalomGatesRef.current[currentGateIndexRef.current];
        if (targetGate) {
          const distToGate = player.pos.distanceTo(targetGate.position);
          if (distToGate < 0.7) {
            practiceAudio.playBeep(true);
            currentGateIndexRef.current = (currentGateIndexRef.current + 1) % slalomGatesRef.current.length;
          }
        }
      }

      // 8. Update Confetti Particles
      if (particlesRef.current) {
        const posAttr = particlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < particleVelocitiesRef.current.length; i++) {
          const vel = particleVelocitiesRef.current[i];
          if (vel.lengthSq() > 0.001) {
            let px = posAttr.getX(i) + vel.x * deltaTime;
            let py = posAttr.getY(i) + vel.y * deltaTime;
            let pz = posAttr.getZ(i) + vel.z * deltaTime;

            vel.y -= 9.81 * deltaTime * 0.8;
            vel.multiplyScalar(0.97);

            if (py < 0) {
              py = -100;
              vel.set(0, 0, 0);
            }

            posAttr.setXYZ(i, px, py, pz);
          }
        }
        posAttr.needsUpdate = true;
      }

      // 9. Camera Perspectives Focused on Controlled Drone
      if (player) {
        if (cameraMode === 'fpv') {
          const fpvOffset = new THREE.Vector3(0, 0.04, player.radius * 0.85).applyQuaternion(player.quat);
          camera.position.copy(player.pos).add(fpvOffset);
          const lookTarget = new THREE.Vector3(0, 0, 6).applyQuaternion(player.quat).add(camera.position);
          camera.lookAt(lookTarget);
        } else if (cameraMode === 'chase') {
          const chaseDist = arenaClass === 'class40' ? 1.7 : 1.2;
          const chaseHeight = 0.55;
          const behindOffset = new THREE.Vector3(0, chaseHeight, -chaseDist).applyQuaternion(player.quat);
          const targetCamPos = player.pos.clone().add(behindOffset);
          camera.position.lerp(targetCamPos, 0.16);
          camera.lookAt(player.pos.clone().add(new THREE.Vector3(0, 0.15, 0)));
        } else if (cameraMode === 'pilot') {
          // Fixed Pilot Stand behind West netting
          camera.position.set(bounds.minX - 1.5, 1.8, 0);
          camera.lookAt(player.pos);
        } else if (cameraMode === 'referee') {
          // High referee observation deck overlooking the pitch
          camera.position.set(0, bounds.height + 3.2, bounds.maxZ + 4.0);
          camera.lookAt(0, 1.2, 0);
        } else if (cameraMode === 'orbit') {
          if (orbitControlsRef.current) {
            orbitControlsRef.current.update();
          }
        }

        // 10. Telemetry State Update
        const speedKmh = Math.round(player.vel.length() * 3.6);
        if (ch.armed) {
          batteryVoltageRef.current = Math.max(14.2, batteryVoltageRef.current - deltaTime * 0.005);
        }

        onTelemetryUpdate({
          altitude: parseFloat(player.pos.y.toFixed(2)),
          speedKmh,
          batteryVoltage: parseFloat(batteryVoltageRef.current.toFixed(1)),
          offside: offsideRef.current,
          armed: ch.armed,
          flightMode: ch.flightMode,
          throttlePct: Math.round(ch.throttle * 100),
          pitchDeg: Math.round(THREE.MathUtils.radToDeg(player.pitch)),
          rollDeg: Math.round(THREE.MathUtils.radToDeg(player.roll)),
          yawDeg: Math.round(((THREE.MathUtils.radToDeg(player.yaw) % 360) + 360) % 360),
        });
      }

      renderer.render(scene, camera);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [cameraMode, drillMode, arenaClass, activeDroneId]);

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-slate-950">
      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Center FPV Crosshair (visible in FPV mode) */}
      {cameraMode === 'fpv' && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="relative w-16 h-16">
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-emerald-400/60" />
            <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-emerald-400/60" />
            <div className="absolute inset-3 border border-emerald-400/50 rounded-full" />
            <div className="absolute inset-0 border border-emerald-400/20 rounded-full" />
          </div>
        </div>
      )}

      {/* Offside Alert Overlay */}
      {offsideRef.current && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-none z-30">
          <div className="bg-red-600/90 text-white font-mono font-black text-xs sm:text-sm px-4 py-1.5 rounded-full shadow-lg border border-red-300 animate-pulse flex items-center gap-2">
            <span>⚠️ OFFSIDE!</span>
            <span>RETURN TO HALF-COURT LINE TO CLEAR</span>
          </div>
        </div>
      )}
    </div>
  );
};
