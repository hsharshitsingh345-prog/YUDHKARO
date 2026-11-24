// arena.js - 3D Sansad Bhavan (Parliament) & Satire Battle Stages
// Compatible with Three.js (r128+)

(function(window) {
  'use strict';

  function createSansadArena(scene) {
    const THREE = window.THREE;
    const arenaGroup = new THREE.Group();

    // 1. Grand Circular Parliament Floor
    const floorRadius = 18;
    const floorGeom = new THREE.CylinderGeometry(floorRadius, floorRadius, 0.4, 64);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x3d2314, // Polished dark mahogany parquet
      roughness: 0.35,
      metalness: 0.15
    });
    const floor = new THREE.Mesh(floorGeom, floorMat);
    floor.position.y = -0.2;
    floor.receiveShadow = true;
    arenaGroup.add(floor);

    // Ashoka Chakra Center Inlay Ring
    const chakraGeom = new THREE.RingGeometry(3.5, 3.8, 48);
    chakraGeom.rotateX(-Math.PI / 2);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.8,
      roughness: 0.2
    });
    const chakraMesh = new THREE.Mesh(chakraGeom, goldMat);
    chakraMesh.position.y = 0.02;
    chakraMesh.receiveShadow = true;
    arenaGroup.add(chakraMesh);

    // Inner Chakra Spokes (24 Spokes)
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      const spokeGeom = new THREE.PlaneGeometry(0.08, 3.5);
      spokeGeom.rotateX(-Math.PI / 2);
      const spokeMesh = new THREE.Mesh(spokeGeom, goldMat);
      spokeMesh.rotation.y = angle;
      spokeMesh.position.y = 0.025;
      arenaGroup.add(spokeMesh);
    }

    // Royal Indian Tricolor Central Carpets (Saffron & Emerald runners)
    const carpetMatSaffron = new THREE.MeshStandardMaterial({
      color: 0xe65100, // Vibrant Saffron
      roughness: 0.85
    });
    const carpetMatGreen = new THREE.MeshStandardMaterial({
      color: 0x1b5e20, // Emerald Green (Lok Sabha carpet)
      roughness: 0.85
    });

    const runnerWidth = 2.4;
    const runnerLength = 26;

    // Green Central Aisle Carpet
    const greenRunnerGeom = new THREE.PlaneGeometry(runnerWidth, runnerLength);
    greenRunnerGeom.rotateX(-Math.PI / 2);
    const greenRunner = new THREE.Mesh(greenRunnerGeom, carpetMatGreen);
    greenRunner.position.y = 0.01;
    greenRunner.receiveShadow = true;
    arenaGroup.add(greenRunner);

    // Saffron Border Runners
    const saffronBorderL = new THREE.Mesh(new THREE.PlaneGeometry(0.3, runnerLength).rotateX(-Math.PI / 2), carpetMatSaffron);
    saffronBorderL.position.set(-runnerWidth / 2 - 0.15, 0.015, 0);
    arenaGroup.add(saffronBorderL);

    const saffronBorderR = new THREE.Mesh(new THREE.PlaneGeometry(0.3, runnerLength).rotateX(-Math.PI / 2), carpetMatSaffron);
    saffronBorderR.position.set(runnerWidth / 2 + 0.15, 0.015, 0);
    arenaGroup.add(saffronBorderR);

    // 2. Grand Sandstone Parliament Pillars (Colonnade along back and sides)
    const pillarGeom = new THREE.CylinderGeometry(0.65, 0.75, 12, 24);
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0xdfcbaf, // Dholpur Red/Cream Sandstone
      roughness: 0.75,
      metalness: 0.05
    });

    const pillarCapitalGeom = new THREE.BoxGeometry(1.6, 0.5, 1.6);

    const pillarPositions = [
      [-14, 6, -8], [-10, 6, -11], [-5, 6, -13],
      [0, 6, -13.5],
      [5, 6, -13], [10, 6, -11], [14, 6, -8],
      [-16, 6, 0], [16, 6, 0]
    ];

    pillarPositions.forEach(pos => {
      const pillar = new THREE.Mesh(pillarGeom, pillarMat);
      pillar.position.set(pos[0], pos[1], pos[2]);
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      arenaGroup.add(pillar);

      // Ornate Capital at top
      const capital = new THREE.Mesh(pillarCapitalGeom, goldMat);
      capital.position.set(pos[0], pos[1] + 5.8, pos[2]);
      capital.castShadow = true;
      arenaGroup.add(capital);

      // Ornate Base at bottom
      const base = new THREE.Mesh(pillarCapitalGeom, goldMat);
      base.position.set(pos[0], 0.25, pos[2]);
      arenaGroup.add(base);
    });

    // 3. Central Speaker Podium & Ashoka Emblem Backdrop
    const podiumGeom = new THREE.BoxGeometry(3.5, 2.2, 2.0);
    const podiumMat = new THREE.MeshStandardMaterial({
      color: 0x2b1509, // Dark walnut
      roughness: 0.4
    });
    const podium = new THREE.Mesh(podiumGeom, podiumMat);
    podium.position.set(0, 1.1, -9.5);
    podium.castShadow = true;
    podium.receiveShadow = true;
    arenaGroup.add(podium);

    // Speaker Chair (Grand High-Back Throne)
    const chairBackGeom = new THREE.BoxGeometry(2.0, 3.5, 0.3);
    const velvetMat = new THREE.MeshStandardMaterial({
      color: 0x991b1b, // Royal Maroon Velvet
      roughness: 0.6
    });
    const chairBack = new THREE.Mesh(chairBackGeom, velvetMat);
    chairBack.position.set(0, 2.8, -10.8);
    arenaGroup.add(chairBack);

    // Ashoka Emblem Relief Plaque (Golden disc on wall behind speaker)
    const plaqueGeom = new THREE.CylinderGeometry(1.6, 1.6, 0.15, 32);
    plaqueGeom.rotateX(Math.PI / 2);
    const plaque = new THREE.Mesh(plaqueGeom, goldMat);
    plaque.position.set(0, 6.2, -12.5);
    arenaGroup.add(plaque);

    // "SATYAMEVA JAYATE" Golden Text Banner / Lintel
    const bannerGeom = new THREE.BoxGeometry(8.0, 0.7, 0.25);
    const banner = new THREE.Mesh(bannerGeom, goldMat);
    banner.position.set(0, 8.5, -12.4);
    arenaGroup.add(banner);

    // 4. Tiered Parliament Benches & Desks (Left & Right Benches)
    const deskMat = new THREE.MeshStandardMaterial({
      color: 0x422006, // Polished wood
      roughness: 0.5
    });

    function createParliamentRows(sideMultiplier) {
      for (let row = 0; row < 3; row++) {
        const zOffset = -3 - row * 2.2;
        const xOffset = sideMultiplier * (7.5 + row * 1.5);
        const yOffset = row * 0.7;

        // Long Curved Desk
        const deskGeom = new THREE.BoxGeometry(1.2, 1.1, 5.5);
        const desk = new THREE.Mesh(deskGeom, deskMat);
        desk.position.set(xOffset, yOffset + 0.55, zOffset);
        desk.rotation.y = -sideMultiplier * 0.25;
        desk.castShadow = true;
        desk.receiveShadow = true;
        arenaGroup.add(desk);

        // Green leather bench cushion behind desk
        const benchGeom = new THREE.BoxGeometry(0.8, 0.8, 5.0);
        const bench = new THREE.Mesh(benchGeom, carpetMatGreen);
        bench.position.set(xOffset + sideMultiplier * 0.9, yOffset + 0.4, zOffset);
        bench.rotation.y = -sideMultiplier * 0.25;
        arenaGroup.add(bench);
      }
    }

    createParliamentRows(1);  // Right side benches (Ruling / Treasury Benches)
    createParliamentRows(-1); // Left side benches (Opposition Benches)

    // 5. Animated Crowd Billboards (Cheering Members of Parliament)
    const crowdGroup = new THREE.Group();
    const crowdCanvas = document.createElement('canvas');
    crowdCanvas.width = 128;
    crowdCanvas.height = 128;
    const cCtx = crowdCanvas.getContext('2d');

    // Draw stylized MP caricature silhouette waving papers
    cCtx.fillStyle = '#ffffff';
    // White Kurta & Gandhi Topi silhouette
    cCtx.beginPath();
    cCtx.arc(64, 45, 22, 0, Math.PI * 2);
    cCtx.fill();
    // Cap
    cCtx.fillRect(44, 25, 40, 15);
    // Body
    cCtx.fillRect(36, 70, 56, 58);
    // Waving hands
    cCtx.fillRect(15, 50, 18, 45);
    cCtx.fillRect(95, 40, 18, 55);

    const crowdTex = new THREE.CanvasTexture(crowdCanvas);
    const crowdMat = new THREE.MeshBasicMaterial({
      map: crowdTex,
      transparent: true,
      side: THREE.DoubleSide
    });

    const crowdMeshes = [];
    for (let i = 0; i < 18; i++) {
      const crowdSprite = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.4), crowdMat);
      const isRight = i % 2 === 0;
      const x = (isRight ? 1 : -1) * (8.5 + (i % 3) * 1.6);
      const z = -2.5 - Math.floor(i / 2) * 1.1;
      const y = 1.2 + (i % 3) * 0.6;
      crowdSprite.position.set(x, y, z);
      crowdSprite.userData = {
        baseY: y,
        speed: 3 + Math.random() * 4,
        phase: Math.random() * Math.PI * 2
      };
      crowdGroup.add(crowdSprite);
      crowdMeshes.push(crowdSprite);
    }
    arenaGroup.add(crowdGroup);

    // 6. Brass Parliament Chandeliers (Ceiling Lighting)
    const chandelierMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.9,
      roughness: 0.1
    });

    const chandelierLight1 = new THREE.PointLight(0xffea9f, 0.8, 18);
    chandelierLight1.position.set(-5, 9, -2);
    arenaGroup.add(chandelierLight1);

    const chandelierLight2 = new THREE.PointLight(0xffea9f, 0.8, 18);
    chandelierLight2.position.set(5, 9, -2);
    arenaGroup.add(chandelierLight2);

    // Chandelier Rings
    [-5, 5].forEach(x => {
      const ringGeom = new THREE.TorusGeometry(1.4, 0.1, 8, 24);
      ringGeom.rotateX(Math.PI / 2);
      const ring = new THREE.Mesh(ringGeom, chandelierMat);
      ring.position.set(x, 8.8, -2);
      arenaGroup.add(ring);
    });

    // 7. Dynamic Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 0.65);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.2);
    sunLight.position.set(6, 16, 12);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 40;
    sunLight.shadow.camera.left = -16;
    sunLight.shadow.camera.right = 16;
    sunLight.shadow.camera.top = 16;
    sunLight.shadow.camera.bottom = -4;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // Rim / Backlight for cinematic combat edge pop
    const rimLight = new THREE.DirectionalLight(0x60a5fa, 0.55);
    rimLight.position.set(-8, 10, -10);
    scene.add(rimLight);

    scene.add(arenaGroup);

    // Return arena controller
    return {
      group: arenaGroup,
      update: function(time, isBigHit) {
        // Animate cheering crowd with excitement bursts on hits
        const excitation = isBigHit ? 2.5 : 1.0;
        crowdMeshes.forEach(mesh => {
          mesh.position.y = mesh.userData.baseY + Math.sin(time * mesh.userData.speed + mesh.userData.phase) * (0.12 * excitation);
          mesh.rotation.z = Math.sin(time * (mesh.userData.speed * 0.8)) * (0.08 * excitation);
        });
      }
    };
  }

  window.createSansadArena = createSansadArena;
})(window);
