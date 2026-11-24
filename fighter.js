// fighter.js - 3D Articulated Fighter Rig & Procedural Combat Animation System
// Compatible with Three.js (r128+)

(function(window) {
  'use strict';

  // Canvas texture generator for character faces (supports photo upload + built-in caricature presets)
  function createFaceCanvas(options) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const skinColor = options.skinTone || '#e8beac';
    const preset = options.preset || 'custom';

    // 1. Draw base skin tone with subtle gradient
    const skinGrad = ctx.createLinearGradient(0, 0, 0, 512);
    skinGrad.addColorStop(0, skinColor);
    skinGrad.addColorStop(1, adjustColorBrightness(skinColor, -25));
    ctx.fillStyle = skinGrad;
    ctx.fillRect(0, 0, 512, 512);

    // 2. If user uploaded a custom photo, draw it seamlessly
    if (options.photoImage) {
      try {
        ctx.save();
        // Create an oval face mask for clean blending into the head mesh
        ctx.beginPath();
        ctx.ellipse(256, 256, 210, 240, 0, 0, Math.PI * 2);
        ctx.clip();

        // Calculate aspect-fill scaling
        const img = options.photoImage;
        const aspect = img.width / img.height;
        let drawW = 512;
        let drawH = 512;
        let drawX = 0;
        let drawY = 0;

        if (aspect > 1) {
          drawW = 512 * aspect;
          drawX = (512 - drawW) / 2;
        } else {
          drawH = 512 / aspect;
          drawY = (512 - drawH) / 2;
        }

        // Apply custom zoom and pan if specified
        const zoom = options.photoZoom || 1.0;
        const panX = options.photoPanX || 0;
        const panY = options.photoPanY || 0;

        ctx.translate(256 + panX, 256 + panY);
        ctx.scale(zoom, zoom);
        ctx.drawImage(img, -256, -256, 512, 512);
        ctx.restore();

        // Subtle vignette around face borders to smoothly blend with 3D skin
        const vigGrad = ctx.createRadialGradient(256, 256, 170, 256, 256, 250);
        vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
        vigGrad.addColorStop(0.7, 'rgba(0,0,0,0.15)');
        vigGrad.addColorStop(1, skinColor);
        ctx.fillStyle = vigGrad;
        ctx.fillRect(0, 0, 512, 512);

        // Highlight eyes & mouth depth
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 4;
        ctx.stroke();

        return canvas;
      } catch (e) {
        console.warn('Custom photo draw fallback:', e);
      }
    }

    // 3. Fallback / Built-in Caricature Presets
    drawCaricatureFace(ctx, preset, skinColor);
    return canvas;
  }

  // Draw expressive caricature faces for the iconic political roster
  function drawCaricatureFace(ctx, preset, skinColor) {
    ctx.save();

    // Eyes
    function drawEyes(y, spacing, size, eyebrowAngle, eyeType) {
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#222222';
      ctx.lineWidth = 4;

      // Left eye
      ctx.beginPath();
      ctx.ellipse(256 - spacing, y, size, size * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Right eye
      ctx.beginPath();
      ctx.ellipse(256 + spacing, y, size, size * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Pupils
      ctx.fillStyle = '#1a1008';
      ctx.beginPath();
      ctx.arc(256 - spacing + 2, y, size * 0.45, 0, Math.PI * 2);
      ctx.arc(256 + spacing - 2, y, size * 0.45, 0, Math.PI * 2);
      ctx.fill();

      // Eye reflections
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(256 - spacing - 3, y - 4, size * 0.15, 0, Math.PI * 2);
      ctx.arc(256 + spacing - 7, y - 4, size * 0.15, 0, Math.PI * 2);
      ctx.fill();

      // Eyebrows
      ctx.strokeStyle = eyeType === 'white' ? '#e2e8f0' : '#1e1b18';
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(256 - spacing - size - 8, y - size - 8 + eyebrowAngle);
      ctx.lineTo(256 - spacing + size, y - size - 12 - eyebrowAngle);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(256 + spacing - size, y - size - 12 - eyebrowAngle);
      ctx.lineTo(256 + spacing + size + 8, y - size - 8 + eyebrowAngle);
      ctx.stroke();
    }

    // Nose
    function drawNose(y, w, h) {
      ctx.strokeStyle = 'rgba(70, 30, 20, 0.45)';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(256, y - h);
      ctx.lineTo(256 + w * 0.6, y);
      ctx.lineTo(256 - w * 0.6, y);
      ctx.stroke();
    }

    // Mouth
    function drawMouth(y, style, w) {
      ctx.strokeStyle = '#632822';
      ctx.fillStyle = '#9e3b33';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';

      if (style === 'smile') {
        ctx.beginPath();
        ctx.arc(256, y - 20, w, 0.25 * Math.PI, 0.75 * Math.PI, false);
        ctx.stroke();
        // Teeth
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(256, y - 18, w * 0.8, 0.3 * Math.PI, 0.7 * Math.PI, false);
        ctx.fill();
      } else if (style === 'smirk') {
        ctx.beginPath();
        ctx.moveTo(256 - w, y);
        ctx.quadraticCurveTo(256, y + 10, 256 + w + 10, y - 12);
        ctx.stroke();
      } else if (style === 'roaring') {
        ctx.fillStyle = '#4a1515';
        ctx.beginPath();
        ctx.ellipse(256, y, w, 28, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        // Firm neutral line
        ctx.beginPath();
        ctx.moveTo(256 - w, y);
        ctx.lineTo(256 + w, y);
        ctx.stroke();
      }
    }

    if (preset === 'mitraman' || preset === 'modi') {
      // White trimmed beard, rimless specs, determined smile
      drawEyes(200, 75, 26, -4, 'white');
      drawNose(255, 30, 35);
      drawMouth(310, 'smile', 55);

      // Spectacles (rimless rectangle frames with bridge)
      ctx.strokeStyle = '#c5a059';
      ctx.lineWidth = 6;
      ctx.strokeRect(150, 172, 85, 54);
      ctx.strokeRect(277, 172, 85, 54);
      ctx.beginPath();
      ctx.moveTo(235, 198);
      ctx.lineTo(277, 198);
      ctx.stroke();

      // White groomed beard
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.moveTo(130, 280);
      ctx.quadraticCurveTo(256, 490, 382, 280);
      ctx.quadraticCurveTo(340, 330, 256, 350);
      ctx.quadraticCurveTo(170, 330, 130, 280);
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Mustache
      ctx.beginPath();
      ctx.ellipse(215, 290, 48, 18, 0.15, 0, Math.PI * 2);
      ctx.ellipse(297, 290, 48, 18, -0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

    } else if (preset === 'yatraboy' || preset === 'rahul') {
      // Rahul: Stubble beard, dimpled smile, youthful eyes
      drawEyes(210, 70, 28, 3, 'dark');
      drawNose(265, 26, 32);
      drawMouth(318, 'smile', 50);

      // Stubble shading
      ctx.fillStyle = 'rgba(40, 30, 20, 0.22)';
      ctx.beginPath();
      ctx.ellipse(256, 370, 110, 95, 0, 0, Math.PI);
      ctx.fill();

      // Dimple on cheek
      ctx.strokeStyle = 'rgba(80, 40, 30, 0.4)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(325, 325, 14, 0.3 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();

    } else if (preset === 'dozerdada' || preset === 'yogi') {
      // Yogi: Stern determined eyes, Tilak on forehead, saffron aura hints
      drawEyes(215, 75, 25, -8, 'dark');
      drawNose(270, 28, 36);
      drawMouth(335, 'firm', 50);

      // Tilak / Roli & Chandan on forehead
      ctx.fillStyle = '#ffcc00';
      ctx.fillRect(238, 90, 36, 16);
      ctx.fillRect(244, 112, 24, 14);
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(256, 140, 10, 0, Math.PI * 2);
      ctx.fill();

      // Gold ear kundal/rings
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(75, 285, 22, 0, Math.PI * 2);
      ctx.arc(437, 285, 22, 0, Math.PI * 2);
      ctx.stroke();

    } else if (preset === 'factbhai' || preset === 'dhruv') {
      // Dhruv Rathee: Modern styled hair, neat dark beard/mustache, analytical grin
      drawEyes(205, 70, 25, 2, 'dark');
      drawNose(260, 25, 32);
      drawMouth(315, 'smirk', 48);

      // Sharp designer beard
      ctx.fillStyle = '#1e1b18';
      ctx.beginPath();
      ctx.moveTo(170, 290);
      ctx.quadraticCurveTo(256, 440, 342, 290);
      ctx.lineTo(330, 330);
      ctx.quadraticCurveTo(256, 375, 182, 330);
      ctx.fill();

    } else if (preset === 'tarifftaau' || preset === 'trump') {
      // Trump: Golden hair swoop, pursed lips, squinted fierce eyes
      drawEyes(210, 80, 24, -12, 'light');
      drawNose(265, 32, 38);
      drawMouth(330, 'roaring', 36);

      // Golden hair fringe overlay
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(80, 60);
      ctx.quadraticCurveTo(260, 30, 440, 80);
      ctx.quadraticCurveTo(380, 150, 200, 140);
      ctx.quadraticCurveTo(130, 130, 80, 60);
      ctx.fill();
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 4;
      ctx.stroke();

    } else if (preset === 'teltsar' || preset === 'putin') {
      // Putin: Piercing blue/steel eyes, stoic straight line mouth
      drawEyes(210, 75, 22, -6, 'blue');
      drawNose(260, 24, 34);
      drawMouth(330, 'firm', 44);

    } else {
      // Custom Generic Fighter
      drawEyes(210, 75, 25, 0, 'dark');
      drawNose(265, 26, 32);
      drawMouth(325, 'smile', 45);
    }

    ctx.restore();
  }

  // Utility to lighten/darken hex colors
  function adjustColorBrightness(hex, percent) {
    let num = parseInt(hex.replace('#', ''), 16);
    let r = (num >> 16) + percent;
    let g = ((num >> 8) & 0x00FF) + percent;
    let b = (num & 0x0000FF) + percent;
    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  // Fighter Character 3D Class
  class Fighter {
    constructor(scene, options) {
      this.scene = scene;
      this.options = Object.assign({
        id: 'p1',
        name: 'MitraMan',
        preset: 'mitraman',
        photoImage: null,
        photoZoom: 1.0,
        photoPanX: 0,
        photoPanY: 0,
        skinTone: '#e8beac',
        kurtaColor: 0xff8822, // Saffron / Orange
        pantsColor: 0xffffff, // White pyjama
        jacketColor: 0x1e3a8a, // Navy / Modi vest
        hairStyle: 'beard_turban',
        auraColor: 0xff9900,
        superName: 'MITRA CHAKRA',
        damageMul: 1.0,
        speedMul: 1.0,
        maxHp: 100,
        maxSuper: 100,
        facing: 1 // 1 = facing right, -1 = facing left
      }, options);

      // State Machine
      this.hp = this.options.maxHp;
      this.superMeter = 25; // start with small charge
      this.state = 'IDLE'; // IDLE, WALK_FWD, WALK_BACK, CROUCH, JUMP, JAB, CROSS, KICK, UPPERCUT, SWEEP, ROUNDHOUSE, SPECIAL1, SPECIAL2, SUPER, BLOCK, HITSTUN, KNOCKDOWN, VICTORY, DEFEAT
      this.animTime = 0;
      this.stateTime = 0;
      this.animSpeed = 1.0;

      // Kinematics & Physics
      this.x = this.options.facing === 1 ? -4.5 : 4.5;
      this.y = 0;
      this.z = 0;
      this.vx = 0;
      this.vy = 0;
      this.isGrounded = true;
      this.facing = this.options.facing;
      this.canAct = true;
      this.isBlocking = false;
      this.comboCount = 0;
      this.lastHitTime = 0;
      this.hitstunDuration = 0;

      // Attack Hitbox Flags
      this.currentAttack = null;
      this.hasHitOpponent = false;

      // Build 3D Articulated Rig
      this.initRig();
      this.updateFaceTexture();
    }

    initRig() {
      const THREE = window.THREE;
      this.root = new THREE.Group();
      this.root.position.set(this.x, this.y, this.z);

      // Shared Materials
      this.skinMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(this.options.skinTone),
        roughness: 0.65,
        metalness: 0.05
      });

      this.kurtaMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(this.options.kurtaColor),
        roughness: 0.7,
        metalness: 0.1
      });

      this.pantsMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(this.options.pantsColor),
        roughness: 0.8,
        metalness: 0.05
      });

      this.jacketMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(this.options.jacketColor),
        roughness: 0.6,
        metalness: 0.15
      });

      this.hairMat = new THREE.MeshStandardMaterial({
        color: this.options.preset === 'mitraman' ? 0xf1f5f9 : (this.options.preset === 'tarifftaau' ? 0xf59e0b : 0x1e1b18),
        roughness: 0.9,
        metalness: 0.0
      });

      this.goldMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.85,
        roughness: 0.25
      });

      // 1. Hips (Central Pivot)
      this.hips = new THREE.Group();
      this.hips.position.y = 1.35;
      this.root.add(this.hips);

      const hipGeom = new THREE.CylinderGeometry(0.38, 0.34, 0.4, 16);
      const hipMesh = new THREE.Mesh(hipGeom, this.pantsMat);
      hipMesh.castShadow = true;
      this.hips.add(hipMesh);

      // 2. Torso & Upper Body
      this.torso = new THREE.Group();
      this.torso.position.y = 0.25;
      this.hips.add(this.torso);

      // Inner Kurta Chest
      const torsoGeom = new THREE.BoxGeometry(0.82, 0.95, 0.52);
      const torsoMesh = new THREE.Mesh(torsoGeom, this.kurtaMat);
      torsoMesh.position.y = 0.45;
      torsoMesh.castShadow = true;
      this.torso.add(torsoMesh);

      // Modi / Politician Nehru Jacket Vest
      const vestGeom = new THREE.BoxGeometry(0.86, 0.88, 0.56);
      const vestMesh = new THREE.Mesh(vestGeom, this.jacketMat);
      vestMesh.position.y = 0.45;
      vestMesh.castShadow = true;
      this.torso.add(vestMesh);

      // Kurta collar
      const collarGeom = new THREE.CylinderGeometry(0.24, 0.24, 0.18, 12);
      const collarMesh = new THREE.Mesh(collarGeom, this.jacketMat);
      collarMesh.position.y = 0.98;
      this.torso.add(collarMesh);

      // Ashoka / Faction Badge on chest
      const badgeGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.03, 12);
      badgeGeom.rotateX(Math.PI / 2);
      const badgeMesh = new THREE.Mesh(badgeGeom, this.goldMat);
      badgeMesh.position.set(0.24, 0.65, 0.3);
      this.torso.add(badgeMesh);

      // 3. Neck & Head
      this.neck = new THREE.Group();
      this.neck.position.y = 1.0;
      this.torso.add(this.neck);

      // Head Multi-Material Cube with Dynamic Front Face Canvas Texture
      this.faceCanvas = createFaceCanvas(this.options);
      this.faceTexture = new THREE.CanvasTexture(this.faceCanvas);
      this.faceTexture.generateMipmaps = true;

      this.faceMat = new THREE.MeshStandardMaterial({
        map: this.faceTexture,
        roughness: 0.55,
        metalness: 0.05
      });

      // Box materials: [right, left, top, bottom, front, back]
      const headMaterials = [
        this.skinMat, // Right
        this.skinMat, // Left
        this.hairMat, // Top
        this.skinMat, // Bottom (Chin/Neck)
        this.faceMat, // Front (CUSTOM UPLOADED PHOTO OR CARICATURE)
        this.hairMat  // Back
      ];

      const headGeom = new THREE.BoxGeometry(0.72, 0.8, 0.7);
      this.headMesh = new THREE.Mesh(headGeom, headMaterials);
      this.headMesh.position.y = 0.45;
      this.headMesh.castShadow = true;
      this.neck.add(this.headMesh);

      // Head Accessories (Turbans, Caps, Beard)
      this.initHeadAccessories();

      // 4. Arms (Left & Right)
      // Left Arm
      this.leftShoulder = new THREE.Group();
      this.leftShoulder.position.set(-0.52, 0.85, 0);
      this.torso.add(this.leftShoulder);

      const upperArmGeom = new THREE.CylinderGeometry(0.14, 0.13, 0.55, 10);
      upperArmGeom.translate(0, -0.27, 0);
      const leftUpperArmMesh = new THREE.Mesh(upperArmGeom, this.kurtaMat);
      leftUpperArmMesh.castShadow = true;
      this.leftShoulder.add(leftUpperArmMesh);

      this.leftElbow = new THREE.Group();
      this.leftElbow.position.y = -0.55;
      this.leftShoulder.add(this.leftElbow);

      const forearmGeom = new THREE.CylinderGeometry(0.12, 0.11, 0.5, 10);
      forearmGeom.translate(0, -0.25, 0);
      const leftForearmMesh = new THREE.Mesh(forearmGeom, this.skinMat);
      leftForearmMesh.castShadow = true;
      this.leftElbow.add(leftForearmMesh);

      // Left Fist
      const fistGeom = new THREE.SphereGeometry(0.14, 10, 10);
      this.leftFist = new THREE.Mesh(fistGeom, this.skinMat);
      this.leftFist.position.y = -0.52;
      this.leftElbow.add(this.leftFist);

      // Tricolor / Gold Kada Wristband
      const kadaGeom = new THREE.TorusGeometry(0.13, 0.035, 8, 16);
      kadaGeom.rotateX(Math.PI / 2);
      const leftKada = new THREE.Mesh(kadaGeom, this.goldMat);
      leftKada.position.y = -0.42;
      this.leftElbow.add(leftKada);

      // Right Arm
      this.rightShoulder = new THREE.Group();
      this.rightShoulder.position.set(0.52, 0.85, 0);
      this.torso.add(this.rightShoulder);

      const rightUpperArmMesh = new THREE.Mesh(upperArmGeom, this.kurtaMat);
      rightUpperArmMesh.castShadow = true;
      this.rightShoulder.add(rightUpperArmMesh);

      this.rightElbow = new THREE.Group();
      this.rightElbow.position.y = -0.55;
      this.rightShoulder.add(this.rightElbow);

      const rightForearmMesh = new THREE.Mesh(forearmGeom, this.skinMat);
      rightForearmMesh.castShadow = true;
      this.rightElbow.add(rightForearmMesh);

      // Right Fist
      this.rightFist = new THREE.Mesh(fistGeom, this.skinMat);
      this.rightFist.position.y = -0.52;
      this.rightElbow.add(this.rightFist);

      const rightKada = new THREE.Mesh(kadaGeom, this.goldMat);
      rightKada.position.y = -0.42;
      this.rightElbow.add(rightKada);

      // 5. Legs (Left & Right)
      // Left Leg
      this.leftHip = new THREE.Group();
      this.leftHip.position.set(-0.25, -0.15, 0);
      this.hips.add(this.leftHip);

      const thighGeom = new THREE.CylinderGeometry(0.16, 0.14, 0.65, 12);
      thighGeom.translate(0, -0.32, 0);
      const leftThighMesh = new THREE.Mesh(thighGeom, this.pantsMat);
      leftThighMesh.castShadow = true;
      this.leftHip.add(leftThighMesh);

      this.leftKnee = new THREE.Group();
      this.leftKnee.position.y = -0.65;
      this.leftHip.add(this.leftKnee);

      const shinGeom = new THREE.CylinderGeometry(0.14, 0.12, 0.6, 12);
      shinGeom.translate(0, -0.3, 0);
      const leftShinMesh = new THREE.Mesh(shinGeom, this.pantsMat);
      leftShinMesh.castShadow = true;
      this.leftKnee.add(leftShinMesh);

      // Left Foot (Mojari / Shoe)
      const footGeom = new THREE.BoxGeometry(0.22, 0.15, 0.42);
      footGeom.translate(0, -0.07, 0.08);
      this.leftFoot = new THREE.Mesh(footGeom, this.goldMat);
      this.leftFoot.position.y = -0.6;
      this.leftFoot.castShadow = true;
      this.leftKnee.add(this.leftFoot);

      // Right Leg
      this.rightHip = new THREE.Group();
      this.rightHip.position.set(0.25, -0.15, 0);
      this.hips.add(this.rightHip);

      const rightThighMesh = new THREE.Mesh(thighGeom, this.pantsMat);
      rightThighMesh.castShadow = true;
      this.rightHip.add(rightThighMesh);

      this.rightKnee = new THREE.Group();
      this.rightKnee.position.y = -0.65;
      this.rightHip.add(this.rightKnee);

      const rightShinMesh = new THREE.Mesh(shinGeom, this.pantsMat);
      rightShinMesh.castShadow = true;
      this.rightKnee.add(rightShinMesh);

      // Right Foot
      this.rightFoot = new THREE.Mesh(footGeom, this.goldMat);
      this.rightFoot.position.y = -0.6;
      this.rightFoot.castShadow = true;
      this.rightKnee.add(this.rightFoot);

      // 6. Super Aura Glow Rings (at feet)
      const auraGeom = new THREE.RingGeometry(0.7, 1.1, 24);
      auraGeom.rotateX(-Math.PI / 2);
      this.auraMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(this.options.auraColor),
        transparent: true,
        opacity: 0.0,
        side: THREE.DoubleSide
      });
      this.auraMesh = new THREE.Mesh(auraGeom, this.auraMat);
      this.auraMesh.position.y = 0.05;
      this.root.add(this.auraMesh);

      this.scene.add(this.root);
    }

    initHeadAccessories() {
      const THREE = window.THREE;
      if (this.accessoryGroup) {
        this.neck.remove(this.accessoryGroup);
      }
      this.accessoryGroup = new THREE.Group();

      const hairStyle = this.options.hairStyle;

      if (hairStyle === 'turban' || hairStyle === 'pagdi') {
        // Royal Indian Pagdi / Turban with Kalgi feather brooch
        const turbanGeom = new THREE.TorusGeometry(0.42, 0.22, 12, 24);
        turbanGeom.rotateX(Math.PI / 2);
        const turbanMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(this.options.auraColor || 0xff9900),
          roughness: 0.8
        });
        const turban = new THREE.Mesh(turbanGeom, turbanMat);
        turban.position.y = 0.82;
        this.accessoryGroup.add(turban);

        // Brooch
        const broochGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.03, 10);
        broochGeom.rotateX(Math.PI / 2);
        const brooch = new THREE.Mesh(broochGeom, this.goldMat);
        brooch.position.set(0, 0.85, 0.42);
        this.accessoryGroup.add(brooch);

      } else if (hairStyle === 'topi' || hairStyle === 'gandhi_topi') {
        // White Khadi Gandhi Topi
        const topiGeom = new THREE.BoxGeometry(0.5, 0.35, 0.85);
        const topiMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
        const topi = new THREE.Mesh(topiGeom, topiMat);
        topi.position.set(0, 0.88, 0);
        topi.rotation.x = -0.1;
        this.accessoryGroup.add(topi);

      } else if (hairStyle === 'hair_pompadour' || this.options.preset === 'tarifftaau') {
        // Golden Trump Pompadour Hair Swoop
        const hairGeom = new THREE.BoxGeometry(0.85, 0.35, 0.85);
        const hair = new THREE.Mesh(hairGeom, this.hairMat);
        hair.position.set(0, 0.85, 0.1);
        hair.rotation.x = -0.2;
        this.accessoryGroup.add(hair);
      }

      this.neck.add(this.accessoryGroup);
    }

    // Update Face Texture dynamically from uploaded photo or preset
    updateFaceTexture(newOptions) {
      if (newOptions) {
        Object.assign(this.options, newOptions);
      }
      this.faceCanvas = createFaceCanvas(this.options);
      this.faceTexture.image = this.faceCanvas;
      this.faceTexture.needsUpdate = true;

      // Update materials color if customized
      if (this.options.kurtaColor) this.kurtaMat.color.set(this.options.kurtaColor);
      if (this.options.pantsColor) this.pantsMat.color.set(this.options.pantsColor);
      if (this.options.jacketColor) this.jacketMat.color.set(this.options.jacketColor);
      if (this.options.skinTone) this.skinMat.color.set(this.options.skinTone);
      if (this.options.auraColor) this.auraMat.color.set(this.options.auraColor);

      this.initHeadAccessories();
    }

    // Trigger Combat Action
    executeMove(moveId) {
      if (!this.canAct && this.state !== 'IDLE' && this.state !== 'WALK_FWD' && this.state !== 'WALK_BACK') {
        return false;
      }

      // Check Super meter requirement
      if (moveId === 'SUPER' && this.superMeter < 100) {
        return false;
      }

      this.state = moveId;
      this.stateTime = 0;
      this.canAct = false;
      this.hasHitOpponent = false;

      // Specific Move Frame Properties
      const moveTable = {
        JAB: { damage: 5, startup: 4, active: 8, recovery: 14, sound: 'punch_light' },
        CROSS: { damage: 6, startup: 6, active: 11, recovery: 18, sound: 'punch_med' },
        LOW_JAB: { damage: 4, startup: 4, active: 8, recovery: 12, sound: 'punch_light' },
        KICK: { damage: 9, startup: 8, active: 14, recovery: 22, sound: 'kick_med' },
        UPPERCUT: { damage: 11, startup: 9, active: 16, recovery: 26, launch: true, sound: 'uppercut' },
        SWEEP: { damage: 8, startup: 10, active: 17, recovery: 28, sweep: true, sound: 'sweep' },
        ROUNDHOUSE: { damage: 13, startup: 12, active: 18, recovery: 30, sound: 'kick_heavy' },
        SPECIAL1: { damage: 13, startup: 10, active: 20, recovery: 32, special: true, sound: 'special1' },
        SPECIAL2: { damage: 14, startup: 12, active: 22, recovery: 34, special: true, sound: 'special2' },
        SUPER: { damage: 35, startup: 30, active: 80, recovery: 110, cinematic: true, sound: 'super_explosion' }
      };

      this.currentAttack = moveTable[moveId] || { damage: 5, startup: 5, active: 10, recovery: 16 };

      if (moveId === 'SUPER') {
        this.superMeter = 0;
      }

      return true;
    }

    takeDamage(amount, isBlock, attackData) {
      const finalDmg = isBlock ? Math.max(1, Math.floor(amount * 0.2)) : amount;
      this.hp = Math.max(0, this.hp - finalDmg);

      // Charge super meter on taking damage (comeback mechanic)
      this.superMeter = Math.min(100, this.superMeter + (isBlock ? 3 : 6));

      if (this.hp <= 0) {
        this.state = 'KNOCKDOWN';
        this.stateTime = 0;
        this.canAct = false;
        this.vy = 5.5;
        this.vx = -this.facing * 3.5;
        return { isKo: true, finalDmg };
      }

      if (isBlock) {
        this.state = 'BLOCK';
        this.stateTime = 0;
        this.canAct = false;
        this.vx = -this.facing * 1.5;
        return { isBlock: true, finalDmg };
      }

      // Unblocked hit
      if (attackData && attackData.launch) {
        // Uppercut launcher!
        this.state = 'HITSTUN';
        this.stateTime = 0;
        this.canAct = false;
        this.vy = 7.2;
        this.vx = -this.facing * 2.2;
        this.isGrounded = false;
      } else if (attackData && attackData.sweep) {
        // Sweep trip knockdown!
        this.state = 'KNOCKDOWN';
        this.stateTime = 0;
        this.canAct = false;
        this.vy = 2.5;
        this.vx = -this.facing * 4.0;
        this.isGrounded = false;
      } else {
        // Standard hitstun
        this.state = 'HITSTUN';
        this.stateTime = 0;
        this.canAct = false;
        this.hitstunDuration = 18;
        this.vx = -this.facing * 2.0;
      }

      return { isHit: true, finalDmg };
    }

    // Frame-by-Frame Animation & Physics Update (60 FPS loop)
    update(delta, opponent) {
      this.animTime += delta * 60;
      this.stateTime++;

      // Face opponent if not locked in an active strike
      if (this.canAct && opponent) {
        if (this.x < opponent.x) {
          this.facing = 1;
        } else {
          this.facing = -1;
        }
      }

      // Smooth facing rotation
      const targetRotY = this.facing === 1 ? Math.PI / 2 : -Math.PI / 2;
      this.root.rotation.y += (targetRotY - this.root.rotation.y) * 0.25;

      // Gravity and Vertical Physics
      if (!this.isGrounded) {
        this.vy -= 22 * delta;
        this.y += this.vy * delta;
        if (this.y <= 0) {
          this.y = 0;
          this.vy = 0;
          this.isGrounded = true;
          if (this.state === 'KNOCKDOWN') {
            // Stay grounded flat for a moment
          }
        }
      }

      // Horizontal Velocity Decay
      this.x += this.vx * delta;
      this.vx *= 0.88;

      // Arena Boundaries (-12.5 to 12.5)
      if (this.x < -12.5) this.x = -12.5;
      if (this.x > 12.5) this.x = 12.5;

      this.root.position.x = this.x;
      this.root.position.y = this.y;

      // Super Aura visual pulse
      if (this.superMeter >= 100) {
        this.auraMat.opacity = 0.5 + 0.3 * Math.sin(this.animTime * 0.15);
        this.auraMesh.rotation.z += 0.05;
      } else {
        this.auraMat.opacity = 0.0;
      }

      // Apply Procedural Rig Animations based on state
      this.animateRig();
    }

    animateRig() {
      const t = this.animTime;
      const sT = this.stateTime;

      // Reset base transforms
      let hipY = 1.35;
      let torsoRotX = 0, torsoRotY = 0, torsoRotZ = 0;
      let headRotX = 0, headRotY = 0;
      let lShoulderRotX = 0, lShoulderRotZ = 0.2;
      let rShoulderRotX = 0, rShoulderRotZ = -0.2;
      let lElbowRotX = -0.8;
      let rElbowRotX = -0.8;
      let lHipRotX = 0, rHipRotX = 0;
      let lKneeRotX = 0, rKneeRotX = 0;

      switch (this.state) {
        case 'IDLE':
          // Breathing bounce & boxing guard sway
          hipY = 1.35 + Math.sin(t * 0.08) * 0.04;
          torsoRotX = Math.sin(t * 0.08) * 0.03;
          torsoRotY = Math.cos(t * 0.06) * 0.05;
          lShoulderRotX = -0.5 + Math.sin(t * 0.08) * 0.06;
          rShoulderRotX = -0.5 - Math.sin(t * 0.08) * 0.06;
          lElbowRotX = -1.2 + Math.sin(t * 0.08) * 0.1;
          rElbowRotX = -1.2 - Math.sin(t * 0.08) * 0.1;
          lKneeRotX = 0.1 + Math.sin(t * 0.08) * 0.04;
          rKneeRotX = 0.1 - Math.sin(t * 0.08) * 0.04;
          break;

        case 'WALK_FWD':
          // Confident aggressive walk cycle
          hipY = 1.35 + Math.abs(Math.sin(t * 0.15)) * 0.08;
          torsoRotX = 0.15;
          lHipRotX = Math.sin(t * 0.15) * 0.6;
          rHipRotX = -Math.sin(t * 0.15) * 0.6;
          lKneeRotX = Math.max(0, -Math.sin(t * 0.15) * 0.7);
          rKneeRotX = Math.max(0, Math.sin(t * 0.15) * 0.7);
          lShoulderRotX = -Math.sin(t * 0.15) * 0.5 - 0.3;
          rShoulderRotX = Math.sin(t * 0.15) * 0.5 - 0.3;
          break;

        case 'WALK_BACK':
          // Defensive retreat walk cycle
          hipY = 1.35 + Math.abs(Math.sin(t * 0.12)) * 0.05;
          torsoRotX = -0.1;
          lHipRotX = -Math.sin(t * 0.12) * 0.45;
          rHipRotX = Math.sin(t * 0.12) * 0.45;
          lShoulderRotX = -0.8;
          rShoulderRotX = -0.8;
          lElbowRotX = -1.5;
          rElbowRotX = -1.5;
          break;

        case 'CROUCH':
          // Lowering center of mass
          hipY = 0.95;
          torsoRotX = 0.25;
          lHipRotX = 0.7;
          rHipRotX = 0.7;
          lKneeRotX = -1.2;
          rKneeRotX = -1.2;
          lShoulderRotX = -0.9;
          rShoulderRotX = -0.9;
          lElbowRotX = -1.6;
          rElbowRotX = -1.6;
          break;

        case 'JAB':
          // Fast snapping straight punch
          if (sT < 5) {
            // Windup
            rShoulderRotX = -0.3;
            torsoRotY = -0.2;
          } else if (sT < 10) {
            // Full extension
            rShoulderRotX = -1.6;
            rElbowRotX = 0.0;
            torsoRotY = 0.4;
            torsoRotX = 0.1;
          } else {
            // Recovery
            const p = (sT - 10) / 4;
            rShoulderRotX = -1.6 + p * 1.0;
            rElbowRotX = -p * 1.0;
            if (sT >= 14) this.endAttack();
          }
          break;

        case 'CROSS':
          // Heavy right straight punch
          if (sT < 6) {
            rShoulderRotX = 0.2;
            torsoRotY = -0.4;
          } else if (sT < 12) {
            rShoulderRotX = -1.7;
            rElbowRotX = 0.05;
            torsoRotY = 0.6;
            torsoRotX = 0.2;
          } else {
            if (sT >= 18) this.endAttack();
          }
          break;

        case 'KICK':
          // Front thrust kick
          if (sT < 8) {
            rHipRotX = 0.6;
            rKneeRotX = -1.2;
            torsoRotX = -0.2;
          } else if (sT < 15) {
            rHipRotX = 1.4;
            rKneeRotX = 0.1;
            torsoRotX = -0.35;
          } else {
            if (sT >= 22) this.endAttack();
          }
          break;

        case 'UPPERCUT':
          // Crouching scoop upward launch
          if (sT < 8) {
            hipY = 1.05;
            torsoRotX = 0.3;
            rShoulderRotX = 0.3;
            rElbowRotX = -1.6;
          } else if (sT < 16) {
            hipY = 1.45;
            torsoRotX = -0.25;
            rShoulderRotX = -2.4;
            rElbowRotX = -0.8;
          } else {
            if (sT >= 26) this.endAttack();
          }
          break;

        case 'SWEEP':
          // Low 360 spinning sweep kick
          hipY = 0.8;
          torsoRotX = 0.4;
          torsoRotY = (sT / 28) * Math.PI * 2;
          lKneeRotX = -1.1;
          rHipRotX = 1.4;
          rKneeRotX = 0.0;
          if (sT >= 28) this.endAttack();
          break;

        case 'ROUNDHOUSE':
          // High spinning roundhouse kick
          torsoRotY = (sT / 30) * Math.PI * 2;
          rHipRotX = 1.5;
          rKneeRotX = 0.1;
          torsoRotX = -0.2;
          if (sT >= 30) this.endAttack();
          break;

        case 'SPECIAL1':
        case 'SPECIAL2':
          // Signature double palm thrust / energy surge
          if (sT < 10) {
            torsoRotX = -0.3;
            lShoulderRotX = 0.2;
            rShoulderRotX = 0.2;
          } else if (sT < 22) {
            torsoRotX = 0.4;
            lShoulderRotX = -1.65;
            rShoulderRotX = -1.65;
            lElbowRotX = 0.0;
            rElbowRotX = 0.0;
          } else {
            if (sT >= 32) this.endAttack();
          }
          break;

        case 'SUPER':
          // Cinematic Ultimate sequence
          if (sT < 35) {
            // Charging super aura pose: fists clenched, chest bowed
            hipY = 1.15;
            torsoRotX = -0.25;
            lShoulderRotX = -0.4;
            rShoulderRotX = -0.4;
            lElbowRotX = -1.6;
            rElbowRotX = -1.6;
            this.auraMat.opacity = 0.9;
          } else if (sT < 70) {
            // Super combo flurry
            torsoRotY = Math.sin(sT * 0.8) * 0.5;
            rShoulderRotX = -1.7 * Math.abs(Math.sin(sT * 0.5));
            lShoulderRotX = -1.7 * Math.abs(Math.cos(sT * 0.5));
            rElbowRotX = 0;
            lElbowRotX = 0;
          } else if (sT < 95) {
            // Grand final upward finisher
            torsoRotX = -0.4;
            rShoulderRotX = -2.6;
            lShoulderRotX = -2.6;
            hipY = 1.55;
          } else {
            if (sT >= 110) this.endAttack();
          }
          break;

        case 'BLOCK':
          // Guarding cross-arm defense
          torsoRotX = 0.1;
          lShoulderRotX = -1.2;
          rShoulderRotX = -1.2;
          lShoulderRotZ = -0.2;
          rShoulderRotZ = 0.2;
          lElbowRotX = -1.8;
          rElbowRotX = -1.8;
          if (sT >= 16) {
            this.state = 'IDLE';
            this.canAct = true;
          }
          break;

        case 'HITSTUN':
          // Reeling backwards from hit
          torsoRotX = -0.35;
          headRotX = 0.4;
          lShoulderRotX = 0.4;
          rShoulderRotX = 0.4;
          if (sT >= (this.hitstunDuration || 18)) {
            this.state = 'IDLE';
            this.canAct = true;
          }
          break;

        case 'KNOCKDOWN':
          // Flat on back
          hipY = 0.3;
          torsoRotX = -1.4;
          headRotX = -0.5;
          lHipRotX = -0.2;
          rHipRotX = -0.2;
          if (this.hp > 0 && sT >= 55) {
            // Get back up
            this.state = 'IDLE';
            this.canAct = true;
          }
          break;

        case 'VICTORY':
          // Triumphant double fist raise to cheering crowd
          hipY = 1.4;
          torsoRotX = -0.15;
          lShoulderRotX = -2.5;
          rShoulderRotX = -2.5;
          lElbowRotX = -0.4;
          rElbowRotX = -0.4;
          headRotX = -0.2;
          break;

        case 'DEFEAT':
          // Collapsed on knees
          hipY = 0.6;
          torsoRotX = 0.7;
          headRotX = 0.5;
          lKneeRotX = -1.5;
          rKneeRotX = -1.5;
          lShoulderRotX = 0.2;
          rShoulderRotX = 0.2;
          break;
      }

      // Apply lerped values to Three.js bones
      this.hips.position.y += (hipY - this.hips.position.y) * 0.35;
      this.torso.rotation.x += (torsoRotX - this.torso.rotation.x) * 0.35;
      this.torso.rotation.y += (torsoRotY - this.torso.rotation.y) * 0.35;
      this.torso.rotation.z += (torsoRotZ - this.torso.rotation.z) * 0.35;

      this.neck.rotation.x += (headRotX - this.neck.rotation.x) * 0.35;
      this.neck.rotation.y += (headRotY - this.neck.rotation.y) * 0.35;

      this.leftShoulder.rotation.x += (lShoulderRotX - this.leftShoulder.rotation.x) * 0.35;
      this.leftShoulder.rotation.z += (lShoulderRotZ - this.leftShoulder.rotation.z) * 0.35;
      this.leftElbow.rotation.x += (lElbowRotX - this.leftElbow.rotation.x) * 0.35;

      this.rightShoulder.rotation.x += (rShoulderRotX - this.rightShoulder.rotation.x) * 0.35;
      this.rightShoulder.rotation.z += (rShoulderRotZ - this.rightShoulder.rotation.z) * 0.35;
      this.rightElbow.rotation.x += (rElbowRotX - this.rightElbow.rotation.x) * 0.35;

      this.leftHip.rotation.x += (lHipRotX - this.leftHip.rotation.x) * 0.35;
      this.leftKnee.rotation.x += (lKneeRotX - this.leftKnee.rotation.x) * 0.35;

      this.rightHip.rotation.x += (rHipRotX - this.rightHip.rotation.x) * 0.35;
      this.rightKnee.rotation.x += (rKneeRotX - this.rightKnee.rotation.x) * 0.35;
    }

    endAttack() {
      this.state = 'IDLE';
      this.canAct = true;
      this.currentAttack = null;
      this.hasHitOpponent = false;
    }

    // World position of attacking fist/foot for precise hitboxes
    getActiveHitbox() {
      if (!this.currentAttack) return null;
      if (this.stateTime < this.currentAttack.startup || this.stateTime > this.currentAttack.active) {
        return null;
      }

      // Compute strike position
      const reach = 1.35;
      const hitX = this.x + this.facing * reach;
      let hitY = this.y + 1.4;

      if (this.state === 'KICK' || this.state === 'ROUNDHOUSE') {
        hitY = this.y + 1.2;
      } else if (this.state === 'SWEEP' || this.state === 'LOW_JAB') {
        hitY = this.y + 0.4;
      } else if (this.state === 'UPPERCUT') {
        hitY = this.y + 1.6;
      }

      return {
        x: hitX,
        y: hitY,
        radius: 0.85,
        attackData: this.currentAttack
      };
    }

    // Get body hurtbox cylinder
    getHurtbox() {
      return {
        x: this.x,
        yMin: this.y,
        yMax: this.y + 2.2,
        radius: 0.65
      };
    }
  }

  // Export to global
  window.Fighter = Fighter;
  window.createFaceCanvas = createFaceCanvas;
})(window);
