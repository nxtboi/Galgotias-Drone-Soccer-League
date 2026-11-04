import * as THREE from 'three';

export type ArenaType = 'stadium' | 'skyfence' | 'lab';

export interface ArenaEnvironmentResult {
  arenaGroup: THREE.Group;
  goalHoops: {
    blue: THREE.Mesh;
    red: THREE.Mesh;
    blueLight: THREE.PointLight;
    redLight: THREE.PointLight;
    bluePos: THREE.Vector3;
    redPos: THREE.Vector3;
    radius: number;
  };
  soccerGoals?: {
    blueNetBounds: THREE.Box3;
    redNetBounds: THREE.Box3;
  };
  soccerBallMesh?: THREE.Mesh;
  soccerBallPhysics?: {
    pos: THREE.Vector3;
    vel: THREE.Vector3;
    rot: THREE.Euler;
    radius: number;
    update: (deltaTime: number) => void;
    kick: (impulse: THREE.Vector3) => void;
  };
  bounds: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
    height: number;
  };
  update?: (currentTime: number, deltaTime: number) => void;
}

/**
 * Creates a photorealistic regulation soccer stadium pitch texture.
 */
function createSoccerPitchTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // 1. Lush Green Grass with Alternating Mower Bands
    const bandCount = 18;
    const bandWidth = 2048 / bandCount;
    for (let i = 0; i < bandCount; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#1b4317' : '#22541d';
      ctx.fillRect(i * bandWidth, 0, bandWidth, 1024);
    }

    // Grass fine noise texture overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    for (let x = 0; x < 2048; x += 16) {
      for (let y = 0; y < 1024; y += 16) {
        if ((x + y) % 32 === 0) {
          ctx.fillRect(x, y, 16, 16);
        }
      }
    }

    // 2. Regulation White Chalk Markings
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 8;
    const margin = 64;
    const pitchW = 2048 - margin * 2;
    const pitchH = 1024 - margin * 2;
    const midX = 2048 / 2;
    const midY = 1024 / 2;

    // Outer Touchlines & Goal Lines
    ctx.strokeRect(margin, margin, pitchW, pitchH);

    // Halfway Line
    ctx.beginPath();
    ctx.moveTo(midX, margin);
    ctx.lineTo(midX, 1024 - margin);
    ctx.stroke();

    // Center Circle (Radius ~ 140px)
    ctx.beginPath();
    ctx.arc(midX, midY, 140, 0, Math.PI * 2);
    ctx.stroke();

    // Center Spot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(midX, midY, 12, 0, Math.PI * 2);
    ctx.fill();

    // Penalty Areas (18-yard boxes)
    const penW = 260;
    const penH = 460;
    // West (Blue) Penalty Area
    ctx.strokeRect(margin, midY - penH / 2, penW, penH);
    // East (Red) Penalty Area
    ctx.strokeRect(2048 - margin - penW, midY - penH / 2, penW, penH);

    // Goal Areas (6-yard boxes)
    const goalAreaW = 90;
    const goalAreaH = 220;
    ctx.strokeRect(margin, midY - goalAreaH / 2, goalAreaW, goalAreaH);
    ctx.strokeRect(2048 - margin - goalAreaW, midY - goalAreaH / 2, goalAreaW, goalAreaH);

    // Penalty Spots
    ctx.beginPath();
    ctx.arc(margin + 180, midY, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(2048 - margin - 180, midY, 10, 0, Math.PI * 2);
    ctx.fill();

    // Penalty D-Arcs
    ctx.beginPath();
    ctx.arc(margin + 180, midY, 100, -0.65, 0.65);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(2048 - margin - 180, midY, 100, Math.PI - 0.65, Math.PI + 0.65);
    ctx.stroke();

    // Corner Arcs
    const cRadius = 36;
    ctx.beginPath();
    ctx.arc(margin, margin, cRadius, 0, Math.PI / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(margin, 1024 - margin, cRadius, -Math.PI / 2, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(2048 - margin, margin, cRadius, Math.PI / 2, Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(2048 - margin, 1024 - margin, cRadius, Math.PI, (3 * Math.PI) / 2);
    ctx.stroke();

    // Galgotias Drone Soccer League Arena Text On Turf
    ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GALGOTIAS DRONE SOCCER LEAGUE · GDSL ARENA', midX, midY - 60);
    ctx.font = 'bold 20px monospace';
    ctx.fillText('OFFICIAL STADIUM PROVING GROUND · GCDIS CLASS 40 / 20', midX, midY + 80);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Creates the REAL SOCCER STADIUM ARENA with grass pitch, official soccer goal nets,
 * suspended drone soccer hoops, grandstand bleachers, floodlight towers, and kickable soccer ball.
 */
export function createSoccerStadiumArena(arenaClass: 'class40' | 'class20'): ArenaEnvironmentResult {
  const arenaGroup = new THREE.Group();

  const pitchLength = arenaClass === 'class40' ? 24 : 14;
  const pitchWidth = arenaClass === 'class40' ? 14 : 8;
  const arenaHeight = arenaClass === 'class40' ? 6.5 : 4.5;
  const goalX = pitchLength * 0.42;
  const goalElevation = arenaClass === 'class40' ? 3.2 : 2.0;
  const goalRadius = arenaClass === 'class40' ? 0.4 : 0.25;

  // 1. Lush Green Pitch Surface
  const pitchGeo = new THREE.PlaneGeometry(pitchLength, pitchWidth);
  const pitchTexture = createSoccerPitchTexture();
  const pitchMat = new THREE.MeshStandardMaterial({
    map: pitchTexture,
    roughness: 0.85,
    metalness: 0.05,
  });
  const pitchMesh = new THREE.Mesh(pitchGeo, pitchMat);
  pitchMesh.rotation.x = -Math.PI / 2;
  pitchMesh.receiveShadow = true;
  arenaGroup.add(pitchMesh);

  // Outer Concrete Apron / Track surrounding pitch
  const apronGeo = new THREE.PlaneGeometry(pitchLength + 16, pitchWidth + 14);
  const apronMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.9,
  });
  const apronMesh = new THREE.Mesh(apronGeo, apronMat);
  apronMesh.rotation.x = -Math.PI / 2;
  apronMesh.position.y = -0.01;
  arenaGroup.add(apronMesh);

  // 2. Regulation White Steel Soccer Goals (West & East)
  const goalPostMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.85,
    roughness: 0.2,
  });
  const netMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
    transparent: true,
    opacity: 0.45,
  });

  const soccerGoalWidth = arenaClass === 'class40' ? 4.2 : 2.6;
  const soccerGoalHeight = arenaClass === 'class40' ? 2.4 : 1.6;
  const soccerGoalDepth = arenaClass === 'class40' ? 1.4 : 0.9;
  const postRadius = 0.045;

  const createSoccerGoal = (isWest: boolean) => {
    const goalG = new THREE.Group();
    const xSign = isWest ? -1 : 1;
    const posX = xSign * (pitchLength * 0.48);

    // Left Post
    const leftPost = new THREE.Mesh(
      new THREE.CylinderGeometry(postRadius, postRadius, soccerGoalHeight, 16),
      goalPostMat
    );
    leftPost.position.set(0, soccerGoalHeight / 2, -soccerGoalWidth / 2);
    leftPost.castShadow = true;
    goalG.add(leftPost);

    // Right Post
    const rightPost = new THREE.Mesh(
      new THREE.CylinderGeometry(postRadius, postRadius, soccerGoalHeight, 16),
      goalPostMat
    );
    rightPost.position.set(0, soccerGoalHeight / 2, soccerGoalWidth / 2);
    rightPost.castShadow = true;
    goalG.add(rightPost);

    // Crossbar
    const crossbar = new THREE.Mesh(
      new THREE.CylinderGeometry(postRadius, postRadius, soccerGoalWidth, 16),
      goalPostMat
    );
    crossbar.rotation.x = Math.PI / 2;
    crossbar.position.set(0, soccerGoalHeight, 0);
    crossbar.castShadow = true;
    goalG.add(crossbar);

    // Rear Net Mesh Box
    const netGeo = new THREE.BoxGeometry(soccerGoalDepth, soccerGoalHeight, soccerGoalWidth);
    const netMesh = new THREE.Mesh(netGeo, netMat);
    netMesh.position.set(xSign * (soccerGoalDepth / 2), soccerGoalHeight / 2, 0);
    goalG.add(netMesh);

    // Ground anchor frame
    const baseBar1 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, soccerGoalDepth, 8),
      goalPostMat
    );
    baseBar1.rotation.z = Math.PI / 2;
    baseBar1.position.set(xSign * (soccerGoalDepth / 2), 0.03, -soccerGoalWidth / 2);
    goalG.add(baseBar1);

    const baseBar2 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, soccerGoalDepth, 8),
      goalPostMat
    );
    baseBar2.rotation.z = Math.PI / 2;
    baseBar2.position.set(xSign * (soccerGoalDepth / 2), 0.03, soccerGoalWidth / 2);
    goalG.add(baseBar2);

    goalG.position.set(posX, 0, 0);
    return goalG;
  };

  const blueSoccerGoal = createSoccerGoal(true);
  const redSoccerGoal = createSoccerGoal(false);
  arenaGroup.add(blueSoccerGoal);
  arenaGroup.add(redSoccerGoal);

  // 3. Official Toroidal Aerial Drone Soccer Hoops (Suspended right above goalmouths)
  const hoopGeo = new THREE.TorusGeometry(goalRadius, 0.065, 24, 48);

  // Blue Goal Hoop (West)
  const blueHoopMat = new THREE.MeshStandardMaterial({
    color: 0x0088ff,
    emissive: 0x0066ff,
    emissiveIntensity: 2.2,
    roughness: 0.2,
    metalness: 0.7,
  });
  const blueHoop = new THREE.Mesh(hoopGeo, blueHoopMat);
  blueHoop.position.set(-goalX, goalElevation, 0);
  blueHoop.rotation.y = Math.PI / 2;
  arenaGroup.add(blueHoop);

  const blueLight = new THREE.PointLight(0x0088ff, 3.5, 8);
  blueLight.position.set(-goalX, goalElevation, 0);
  arenaGroup.add(blueLight);

  // Blue Hoop Hanging Cables & Rig
  const cableMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8 });
  const cableBlue = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.015, arenaHeight - goalElevation, 8),
    cableMat
  );
  cableBlue.position.set(-goalX, (arenaHeight + goalElevation) / 2, 0);
  arenaGroup.add(cableBlue);

  // Red Goal Hoop (East)
  const redHoopMat = new THREE.MeshStandardMaterial({
    color: 0xff2222,
    emissive: 0xff1111,
    emissiveIntensity: 2.2,
    roughness: 0.2,
    metalness: 0.7,
  });
  const redHoop = new THREE.Mesh(hoopGeo, redHoopMat);
  redHoop.position.set(goalX, goalElevation, 0);
  redHoop.rotation.y = Math.PI / 2;
  arenaGroup.add(redHoop);

  const redLight = new THREE.PointLight(0xff2222, 3.5, 8);
  redLight.position.set(goalX, goalElevation, 0);
  arenaGroup.add(redLight);

  const cableRed = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.015, arenaHeight - goalElevation, 8),
    cableMat
  );
  cableRed.position.set(goalX, (arenaHeight + goalElevation) / 2, 0);
  arenaGroup.add(cableRed);

  // 4. Stadium Grandstand Seating Stands (North & South Tiers)
  const seatMatBlue = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.6 });
  const seatMatRed = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.6 });
  const concreteMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });

  const createGrandstand = (isNorth: boolean) => {
    const stand = new THREE.Group();
    const zSign = isNorth ? -1 : 1;
    const baseZ = zSign * (pitchWidth / 2 + 1.8);
    const steps = 6;

    for (let s = 0; s < steps; s++) {
      const stepY = s * 0.45;
      const stepZ = baseZ + zSign * (s * 0.85);

      // Concrete Tier
      const tierGeo = new THREE.BoxGeometry(pitchLength + 6, 0.45, 0.9);
      const tierMesh = new THREE.Mesh(tierGeo, concreteMat);
      tierMesh.position.set(0, stepY + 0.22, stepZ);
      stand.add(tierMesh);

      // Rows of Stadium Seats
      const seatCount = 28;
      const seatSpacing = (pitchLength + 5) / seatCount;
      for (let i = 0; i < seatCount; i++) {
        const seatX = -(pitchLength + 5) / 2 + i * seatSpacing + seatSpacing / 2;
        const seatMesh = new THREE.Mesh(
          new THREE.BoxGeometry(0.35, 0.22, 0.32),
          i < seatCount / 2 ? seatMatBlue : seatMatRed
        );
        seatMesh.position.set(seatX, stepY + 0.52, stepZ);
        stand.add(seatMesh);
      }
    }

    return stand;
  };

  arenaGroup.add(createGrandstand(true));
  arenaGroup.add(createGrandstand(false));

  // 5. Digital LED Perimeter Advertising Sponsor Boards
  const adCanvas = document.createElement('canvas');
  adCanvas.width = 1024;
  adCanvas.height = 128;
  const adCtx = adCanvas.getContext('2d');
  if (adCtx) {
    adCtx.fillStyle = '#020617';
    adCtx.fillRect(0, 0, 1024, 128);
    adCtx.fillStyle = '#38bdf8';
    adCtx.font = 'bold 38px monospace';
    adCtx.fillText('★ GALGOTIAS DRONE SOCCER LEAGUE ★ GDSL CHAMPIONS CUP ★ GCDIS WORLD CUP ★', 20, 78);
  }
  const adTexture = new THREE.CanvasTexture(adCanvas);
  const adMat = new THREE.MeshBasicMaterial({ map: adTexture });

  // North & South LED Board Strips
  const adGeoLong = new THREE.BoxGeometry(pitchLength + 2, 0.65, 0.1);
  const adNorth = new THREE.Mesh(adGeoLong, adMat);
  adNorth.position.set(0, 0.35, -(pitchWidth / 2 + 0.5));
  arenaGroup.add(adNorth);

  const adSouth = new THREE.Mesh(adGeoLong, adMat);
  adSouth.position.set(0, 0.35, pitchWidth / 2 + 0.5);
  adSouth.rotation.y = Math.PI;
  arenaGroup.add(adSouth);

  // 6. 4 Massive Stadium Floodlight Towers
  const towerPositions = [
    [-pitchLength / 2 - 2, 0, -pitchWidth / 2 - 2],
    [pitchLength / 2 + 2, 0, -pitchWidth / 2 - 2],
    [-pitchLength / 2 - 2, 0, pitchWidth / 2 + 2],
    [pitchLength / 2 + 2, 0, pitchWidth / 2 + 2],
  ];

  const towerTrussMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    metalness: 0.9,
    roughness: 0.2,
  });
  const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  towerPositions.forEach(([tx, , tz]) => {
    const towerH = arenaHeight + 3.0;
    // Lattice Mast
    const mast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.25, towerH, 8),
      towerTrussMat
    );
    mast.position.set(tx, towerH / 2, tz);
    arenaGroup.add(mast);

    // Head Frame with 6 Floodlight Bulbs
    const headFrame = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.9, 0.2), towerTrussMat);
    headFrame.position.set(tx, towerH, tz);
    headFrame.lookAt(0, 2, 0);
    arenaGroup.add(headFrame);

    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 3; c++) {
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8), bulbMat);
        bulb.position.set(
          tx + (c - 1) * 0.45,
          towerH + (r - 0.5) * 0.35,
          tz + 0.15
        );
        arenaGroup.add(bulb);
      }
    }

    // Spot Light casting onto pitch
    const spot = new THREE.SpotLight(0xf1f5f9, 2.5, 35, Math.PI / 3.2, 0.5, 1.2);
    spot.position.set(tx, towerH, tz);
    spot.target.position.set(0, 0, 0);
    arenaGroup.add(spot);
    arenaGroup.add(spot.target);
  });

  // 7. Giant Stadium Jumbo Scoreboard Tower
  const boardGeo = new THREE.BoxGeometry(6, 3, 0.3);
  const boardCanvas = document.createElement('canvas');
  boardCanvas.width = 512;
  boardCanvas.height = 256;
  const bCtx = boardCanvas.getContext('2d');
  if (bCtx) {
    bCtx.fillStyle = '#020617';
    bCtx.fillRect(0, 0, 512, 256);
    bCtx.strokeStyle = '#38bdf8';
    bCtx.lineWidth = 6;
    bCtx.strokeRect(8, 8, 496, 240);
    bCtx.fillStyle = '#ffffff';
    bCtx.font = 'bold 32px sans-serif';
    bCtx.textAlign = 'center';
    bCtx.fillText('GDSL STADIUM ARENA', 256, 60);
    bCtx.fillStyle = '#38bdf8';
    bCtx.font = 'bold 54px monospace';
    bCtx.fillText('BLUE vs RED', 256, 130);
    bCtx.fillStyle = '#22c55e';
    bCtx.font = 'bold 24px monospace';
    bCtx.fillText('GCDIS CLASS 40 FLIGHT SIMULATOR', 256, 195);
  }
  const boardTex = new THREE.CanvasTexture(boardCanvas);
  const boardMat = new THREE.MeshBasicMaterial({ map: boardTex });
  const scoreboard = new THREE.Mesh(boardGeo, boardMat);
  scoreboard.position.set(0, arenaHeight + 1.2, -(pitchWidth / 2 + 5.5));
  arenaGroup.add(scoreboard);

  // 8. 4 Corner Flags on Springs
  const flagPositions = [
    [-pitchLength / 2, 0, -pitchWidth / 2],
    [pitchLength / 2, 0, -pitchWidth / 2],
    [-pitchLength / 2, 0, pitchWidth / 2],
    [pitchLength / 2, 0, pitchWidth / 2],
  ];
  const poleMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const flagMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    side: THREE.DoubleSide,
    roughness: 0.4,
  });

  flagPositions.forEach(([fx, , fz]) => {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.5, 8), poleMat);
    pole.position.set(fx, 0.75, fz);
    arenaGroup.add(pole);

    const cloth = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.25), flagMat);
    cloth.position.set(fx + 0.17, 1.35, fz);
    arenaGroup.add(cloth);
  });

  // 9. Interactive 3D Soccer Ball sitting on center spot
  const ballRadius = arenaClass === 'class40' ? 0.22 : 0.15;
  const ballGeo = new THREE.DodecahedronGeometry(ballRadius, 2);
  const ballCanvas = document.createElement('canvas');
  ballCanvas.width = 512;
  ballCanvas.height = 512;
  const ballCtx = ballCanvas.getContext('2d');
  if (ballCtx) {
    ballCtx.fillStyle = '#ffffff';
    ballCtx.fillRect(0, 0, 512, 512);
    ballCtx.fillStyle = '#111827';
    // Classic pentagon patches
    for (let bx = 64; bx < 512; bx += 128) {
      for (let by = 64; by < 512; by += 128) {
        ballCtx.beginPath();
        ballCtx.arc(bx, by, 32, 0, Math.PI * 2);
        ballCtx.fill();
      }
    }
  }
  const ballTex = new THREE.CanvasTexture(ballCanvas);
  const ballMat = new THREE.MeshStandardMaterial({
    map: ballTex,
    roughness: 0.35,
    metalness: 0.1,
  });
  const soccerBallMesh = new THREE.Mesh(ballGeo, ballMat);
  soccerBallMesh.position.set(0, ballRadius, 0);
  soccerBallMesh.castShadow = true;
  arenaGroup.add(soccerBallMesh);

  // Ball Physics Object
  const ballPhysics = {
    pos: new THREE.Vector3(0, ballRadius, 0),
    vel: new THREE.Vector3(0, 0, 0),
    rot: new THREE.Euler(0, 0, 0),
    radius: ballRadius,
    update(deltaTime: number) {
      // Gravity
      if (this.pos.y > this.radius) {
        this.vel.y -= 9.81 * deltaTime;
      }
      // Velocity integration
      this.pos.addScaledVector(this.vel, deltaTime);

      // Floor bounce & rolling friction
      if (this.pos.y <= this.radius) {
        this.pos.y = this.radius;
        this.vel.y = -this.vel.y * 0.6;
        this.vel.x *= 0.94; // roll friction
        this.vel.z *= 0.94;
      }

      // Arena boundary bounce
      const maxX = pitchLength / 2 - this.radius;
      const maxZ = pitchWidth / 2 - this.radius;
      if (Math.abs(this.pos.x) > maxX) {
        this.pos.x = Math.sign(this.pos.x) * maxX;
        this.vel.x = -this.vel.x * 0.7;
      }
      if (Math.abs(this.pos.z) > maxZ) {
        this.pos.z = Math.sign(this.pos.z) * maxZ;
        this.vel.z = -this.vel.z * 0.7;
      }

      // Ball rotation from rolling
      this.rot.z -= this.vel.x * (deltaTime / this.radius);
      this.rot.x += this.vel.z * (deltaTime / this.radius);

      soccerBallMesh.position.copy(this.pos);
      soccerBallMesh.rotation.copy(this.rot);
    },
    kick(impulse: THREE.Vector3) {
      this.vel.add(impulse);
    },
  };

  return {
    arenaGroup,
    goalHoops: {
      blue: blueHoop,
      red: redHoop,
      blueLight,
      redLight,
      bluePos: new THREE.Vector3(-goalX, goalElevation, 0),
      redPos: new THREE.Vector3(goalX, goalElevation, 0),
      radius: goalRadius,
    },
    soccerBallMesh,
    soccerBallPhysics: ballPhysics,
    bounds: {
      minX: -pitchLength / 2,
      maxX: pitchLength / 2,
      minZ: -pitchWidth / 2,
      maxZ: pitchWidth / 2,
      height: arenaHeight,
    },
  };
}

/**
 * Creates the official GCDIS SKYFENCE ENCLOSED CAGE ARENA.
 */
export function createSkyfenceCageArena(arenaClass: 'class40' | 'class20'): ArenaEnvironmentResult {
  const arenaGroup = new THREE.Group();
  const arenaHalfLength = arenaClass === 'class40' ? 8.0 : 4.0;
  const arenaHalfWidth = arenaClass === 'class40' ? 4.0 : 2.0;
  const arenaHeight = arenaClass === 'class40' ? 4.5 : 3.0;
  const goalX = arenaHalfLength - (arenaClass === 'class40' ? 1.5 : 1.0);
  const goalElevation = arenaClass === 'class40' ? 3.2 : 2.0;
  const goalRadius = arenaClass === 'class40' ? 0.4 : 0.25;

  // Blue Sport Synthetic Turf
  const turfGeo = new THREE.PlaneGeometry(arenaHalfLength * 2, arenaHalfWidth * 2);
  const turfCanvas = document.createElement('canvas');
  turfCanvas.width = 1024;
  turfCanvas.height = 512;
  const ctx = turfCanvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 1024, 512);
    ctx.fillStyle = '#1e293b';
    for (let x = 0; x < 1024; x += 32) {
      for (let y = 0; y < 512; y += 32) {
        if ((x / 32 + y / 32) % 2 === 0) ctx.fillRect(x, y, 32, 32);
      }
    }
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.strokeRect(16, 16, 1024 - 32, 512 - 32);
    ctx.beginPath();
    ctx.moveTo(512, 16);
    ctx.lineTo(512, 512 - 16);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(512, 256, 96, 0, Math.PI * 2);
    ctx.stroke();
    // 5 Launch Spots
    ctx.fillStyle = '#10b981';
    for (let i = 0; i < 5; i++) {
      const yOffset = 80 + i * 88;
      ctx.beginPath();
      ctx.arc(140, yOffset, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(884, yOffset, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const turfTex = new THREE.CanvasTexture(turfCanvas);
  const turfMat = new THREE.MeshStandardMaterial({ map: turfTex, roughness: 0.8 });
  const turfMesh = new THREE.Mesh(turfGeo, turfMat);
  turfMesh.rotation.x = -Math.PI / 2;
  turfMesh.receiveShadow = true;
  arenaGroup.add(turfMesh);

  // Outer Floor
  const outerFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 35),
    new THREE.MeshStandardMaterial({ color: 0x070c18, roughness: 0.9 })
  );
  outerFloor.rotation.x = -Math.PI / 2;
  outerFloor.position.y = -0.01;
  arenaGroup.add(outerFloor);

  // Industrial Truss Frame
  const trussMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85, roughness: 0.3 });
  const cornerPositions = [
    [-arenaHalfLength, -arenaHalfWidth],
    [arenaHalfLength, -arenaHalfWidth],
    [-arenaHalfLength, arenaHalfWidth],
    [arenaHalfLength, arenaHalfWidth],
  ];
  cornerPositions.forEach(([cx, cz]) => {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, arenaHeight, 16), trussMat);
    pillar.position.set(cx, arenaHeight / 2, cz);
    arenaGroup.add(pillar);
  });

  // Perimeter Beams
  const topBeam1 = new THREE.Mesh(new THREE.BoxGeometry(arenaHalfLength * 2, 0.1, 0.1), trussMat);
  topBeam1.position.set(0, arenaHeight, -arenaHalfWidth);
  arenaGroup.add(topBeam1);
  const topBeam2 = new THREE.Mesh(new THREE.BoxGeometry(arenaHalfLength * 2, 0.1, 0.1), trussMat);
  topBeam2.position.set(0, arenaHeight, arenaHalfWidth);
  arenaGroup.add(topBeam2);
  const topBeam3 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, arenaHalfWidth * 2), trussMat);
  topBeam3.position.set(-arenaHalfLength, arenaHeight, 0);
  arenaGroup.add(topBeam3);
  const topBeam4 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, arenaHalfWidth * 2), trussMat);
  topBeam4.position.set(arenaHalfLength, arenaHeight, 0);
  arenaGroup.add(topBeam4);

  // Netting
  const netMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.2 });
  const netNorth = new THREE.Mesh(new THREE.PlaneGeometry(arenaHalfLength * 2, arenaHeight, 32, 16), netMat);
  netNorth.position.set(0, arenaHeight / 2, -arenaHalfWidth);
  arenaGroup.add(netNorth);
  const netSouth = new THREE.Mesh(new THREE.PlaneGeometry(arenaHalfLength * 2, arenaHeight, 32, 16), netMat);
  netSouth.position.set(0, arenaHeight / 2, arenaHalfWidth);
  arenaGroup.add(netSouth);
  const netWest = new THREE.Mesh(new THREE.PlaneGeometry(arenaHalfWidth * 2, arenaHeight, 16, 16), netMat);
  netWest.position.set(-arenaHalfLength, arenaHeight / 2, 0);
  netWest.rotation.y = Math.PI / 2;
  arenaGroup.add(netWest);
  const netEast = new THREE.Mesh(new THREE.PlaneGeometry(arenaHalfWidth * 2, arenaHeight, 16, 16), netMat);
  netEast.position.set(arenaHalfLength, arenaHeight / 2, 0);
  netEast.rotation.y = -Math.PI / 2;
  arenaGroup.add(netEast);

  // Goal Hoops
  const hoopGeo = new THREE.TorusGeometry(goalRadius, 0.07, 24, 48);
  const blueHoop = new THREE.Mesh(
    hoopGeo,
    new THREE.MeshStandardMaterial({ color: 0x0088ff, emissive: 0x0077ff, emissiveIntensity: 2.2, metalness: 0.6 })
  );
  blueHoop.position.set(-goalX, goalElevation, 0);
  blueHoop.rotation.y = Math.PI / 2;
  arenaGroup.add(blueHoop);

  const blueLight = new THREE.PointLight(0x0088ff, 3, 6);
  blueLight.position.set(-goalX, goalElevation, 0);
  arenaGroup.add(blueLight);

  const redHoop = new THREE.Mesh(
    hoopGeo,
    new THREE.MeshStandardMaterial({ color: 0xff2222, emissive: 0xff1111, emissiveIntensity: 2.2, metalness: 0.6 })
  );
  redHoop.position.set(goalX, goalElevation, 0);
  redHoop.rotation.y = Math.PI / 2;
  arenaGroup.add(redHoop);

  const redLight = new THREE.PointLight(0xff2222, 3, 6);
  redLight.position.set(goalX, goalElevation, 0);
  arenaGroup.add(redLight);

  return {
    arenaGroup,
    goalHoops: {
      blue: blueHoop,
      red: redHoop,
      blueLight,
      redLight,
      bluePos: new THREE.Vector3(-goalX, goalElevation, 0),
      redPos: new THREE.Vector3(goalX, goalElevation, 0),
      radius: goalRadius,
    },
    bounds: {
      minX: -arenaHalfLength,
      maxX: arenaHalfLength,
      minZ: -arenaHalfWidth,
      maxZ: arenaHalfWidth,
      height: arenaHeight,
    },
  };
}

/**
 * Creates the GALGOTIAS FLIGHT LAB PROVING ARENA.
 */
export function createGalgotiasLabArena(arenaClass: 'class40' | 'class20'): ArenaEnvironmentResult {
  const base = createSkyfenceCageArena(arenaClass);
  // Add lab banners, tech workbenches, and ceiling lab rig
  const labBannerCanvas = document.createElement('canvas');
  labBannerCanvas.width = 1024;
  labBannerCanvas.height = 256;
  const ctx = labBannerCanvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 1024, 256);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('GALGOTIAS UNIVERSITY · DRONE FLIGHT PROVING GROUND', 60, 100);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '22px monospace';
    ctx.fillText('Autonomous Robotics Lab & GCDIS Championship Flight Arena', 60, 160);
  }
  const bannerTex = new THREE.CanvasTexture(labBannerCanvas);
  const bannerMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 2),
    new THREE.MeshBasicMaterial({ map: bannerTex, side: THREE.DoubleSide })
  );
  bannerMesh.position.set(0, base.bounds.height + 0.6, base.bounds.minZ - 0.2);
  base.arenaGroup.add(bannerMesh);

  return base;
}

