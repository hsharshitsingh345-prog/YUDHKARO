// game.js - Master Three.js Engine, Dynamic Camera, VFX Particles & Arcade HUD
// Compatible with Three.js (r128+)

(function(window) {
  'use strict';

  class VFXManager {
    constructor(scene, camera) {
      this.scene = scene;
      this.camera = camera;
      this.particles = [];
      this.floatingTexts = [];
      this.screenShakeTrauma = 0;
      this.shakeOffset = { x: 0, y: 0 };
      this.freezeFrames = 0;
      this.timeDilation = 1.0;

      // Particle mesh pool
      const THREE = window.THREE;
      this.sparkMat = new THREE.MeshBasicMaterial({ color: 0xffdd00, side: THREE.DoubleSide });
      this.blockMat = new THREE.MeshBasicMaterial({ color: 0x60a5fa, side: THREE.DoubleSide });
      this.smokeMat = new THREE.MeshBasicMaterial({ color: 0x9ca3af, transparent: true, opacity: 0.6 });
    }

    addScreenShake(intensity) {
      this.screenShakeTrauma = Math.min(30, this.screenShakeTrauma + intensity);
    }

    triggerCinematicFreeze(fighter) {
      this.freezeFrames = 25; // 25 frames of dramatic slow-mo zoom
      this.cinematicTarget = fighter;
    }

    triggerKoCinematic(loser) {
      this.timeDilation = 0.2; // Slow-mo K.O.
      setTimeout(() => {
        this.timeDilation = 1.0;
      }, 1800);
    }

    spawnHitSparks(x, y, isSuper) {
      const THREE = window.THREE;
      const count = isSuper ? 24 : 12;
      for (let i = 0; i < count; i++) {
        const geom = new THREE.PlaneGeometry(0.18, 0.45);
        const mesh = new THREE.Mesh(geom, isSuper ? new THREE.MeshBasicMaterial({ color: 0xff3b30 }) : this.sparkMat);
        mesh.position.set(x, y, 0.2);
        mesh.rotation.z = Math.random() * Math.PI * 2;
        this.scene.add(mesh);

        const speed = (isSuper ? 8 : 5) * (0.5 + Math.random() * 0.8);
        const angle = Math.random() * Math.PI * 2;
        this.particles.push({
          mesh,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0.25 + Math.random() * 0.15,
          maxLife: 0.35,
          rotSpeed: (Math.random() - 0.5) * 15
        });
      }
    }

    spawnBlockSparks(x, y) {
      const THREE = window.THREE;
      for (let i = 0; i < 8; i++) {
        const geom = new THREE.PlaneGeometry(0.12, 0.35);
        const mesh = new THREE.Mesh(geom, this.blockMat);
        mesh.position.set(x, y, 0.2);
        mesh.rotation.z = Math.random() * Math.PI * 2;
        this.scene.add(mesh);

        const speed = 4 * (0.6 + Math.random() * 0.5);
        const angle = Math.random() * Math.PI * 2;
        this.particles.push({
          mesh,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0.18,
          maxLife: 0.18,
          rotSpeed: 10
        });
      }
    }

    spawnDamageNumber(x, y, damage, isBlock) {
      this.floatingTexts.push({
        x, y,
        text: isBlock ? `GUARD -${damage}` : `-${damage}`,
        color: isBlock ? '#60a5fa' : (damage >= 15 ? '#ef4444' : '#fbbf24'),
        life: 0.8,
        vy: 1.8,
        scale: damage >= 15 ? 1.4 : 1.0
      });
    }

    update(delta) {
      // Screen shake decay
      if (this.screenShakeTrauma > 0) {
        this.shakeOffset.x = (Math.random() - 0.5) * (this.screenShakeTrauma * 0.04);
        this.shakeOffset.y = (Math.random() - 0.5) * (this.screenShakeTrauma * 0.04);
        this.screenShakeTrauma = Math.max(0, this.screenShakeTrauma - delta * 45);
      } else {
        this.shakeOffset.x = 0;
        this.shakeOffset.y = 0;
      }

      // Update 3D Particles
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.life -= delta;
        p.mesh.position.x += p.vx * delta;
        p.mesh.position.y += p.vy * delta;
        p.mesh.rotation.z += p.rotSpeed * delta;
        const scale = Math.max(0, p.life / p.maxLife);
        p.mesh.scale.set(scale, scale, scale);

        if (p.life <= 0) {
          this.scene.remove(p.mesh);
          this.particles.splice(i, 1);
        }
      }

      // Update Floating Texts
      for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
        const ft = this.floatingTexts[i];
        ft.life -= delta;
        ft.y += ft.vy * delta;
        ft.vy *= 0.95;
        if (ft.life <= 0) {
          this.floatingTexts.splice(i, 1);
        }
      }
    }
  }

  class GameEngine {
    constructor() {
      this.container = document.getElementById('game-container');
      this.hudCanvas = document.getElementById('hud-canvas');
      this.hudCtx = this.hudCanvas.getContext('2d');

      this.sound = new window.SoundEngine();
      this.customizer = new window.CharacterCustomizer();

      this.fps = 60;
      this.frameCount = 0;
      this.lastFpsUpdate = performance.now();

      this.roundTimer = 99;
      this.roundTimerAccum = 0;
      this.gameState = 'MENU'; // 'MENU', 'FIGHTING', 'ROUND_OVER', 'GAME_OVER'
      this.roundNumber = 1;
      this.p1Wins = 0;
      this.p2Wins = 0;
      this.announcerBanner = { text: '', scale: 1.0, life: 0 };

      // Initialize Three.js
      this.initThree();

      // Initialize Arena
      this.arena = window.createSansadArena(this.scene);

      // Initialize VFX Manager
      this.vfx = new VFXManager(this.scene, this.camera);

      // Create Fighters
      this.initFighters();

      // Initialize Combat Manager
      this.combat = new window.CombatManager(this.p1, this.p2, this.sound, this.vfx);

      // Resize listener
      window.addEventListener('resize', () => this.onResize());
      this.onResize();

      // Start loop
      this.lastTime = performance.now();
      requestAnimationFrame((t) => this.loop(t));
    }

    initThree() {
      const THREE = window.THREE;
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x0f172a);
      this.scene.fog = new THREE.FogExp2(0x0f172a, 0.025);

      this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
      this.camera.position.set(0, 3.2, 9.5);

      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: 'high-performance'
      });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.outputEncoding = THREE.sRGBEncoding;

      this.container.appendChild(this.renderer.domElement);
    }

    initFighters() {
      if (this.p1) this.scene.remove(this.p1.root);
      if (this.p2) this.scene.remove(this.p2.root);

      const p1Opts = Object.assign({}, this.customizer.p1Config, { id: 'p1', facing: 1 });
      const p2Opts = Object.assign({}, this.customizer.p2Config, { id: 'p2', facing: -1 });

      this.p1 = new window.Fighter(this.scene, p1Opts);
      this.p2 = new window.Fighter(this.scene, p2Opts);

      if (this.combat) {
        this.combat.p1 = this.p1;
        this.combat.p2 = this.p2;
      }
    }

    onResize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);

      // Resize HUD Canvas to crisp retina resolution
      this.hudCanvas.width = w * window.devicePixelRatio;
      this.hudCanvas.height = h * window.devicePixelRatio;
      this.hudCanvas.style.width = `${w}px`;
      this.hudCanvas.style.height = `${h}px`;
      this.hudCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    startMatch(mode, difficulty) {
      this.sound.init();
      this.combat.gameMode = mode || 'pve';
      this.combat.aiDifficulty = difficulty || 'medium';

      this.initFighters();

      this.roundNumber = 1;
      this.p1Wins = 0;
      this.p2Wins = 0;
      this.startRound();
    }

    startRound() {
      this.p1.hp = this.p1.options.maxHp;
      this.p2.hp = this.p2.options.maxHp;
      this.p1.x = -4.5;
      this.p1.y = 0;
      this.p2.x = 4.5;
      this.p2.y = 0;
      this.p1.state = 'IDLE';
      this.p2.state = 'IDLE';
      this.p1.canAct = false;
      this.p2.canAct = false;

      this.roundTimer = 99;
      this.roundTimerAccum = 0;
      this.gameState = 'COUNTDOWN';

      // Announce Round
      this.showAnnouncer(`ROUND ${this.roundNumber}`, 1.2, () => {
        this.showAnnouncer(`FIGHT!`, 0.9, () => {
          this.gameState = 'FIGHTING';
          this.p1.canAct = true;
          this.p2.canAct = true;
        });
        this.sound.speak("FIGHT!");
      });
      this.sound.speak(`Round ${this.roundNumber}`);
    }

    showAnnouncer(text, duration, callback) {
      this.announcerBanner = {
        text,
        life: duration,
        maxLife: duration,
        callback
      };
    }

    loop(now) {
      requestAnimationFrame((t) => this.loop(t));

      const rawDelta = Math.min((now - this.lastTime) / 1000, 0.1);
      this.lastTime = now;

      // Apply time dilation (slow-mo on KO/Super)
      const delta = rawDelta * this.vfx.timeDilation;

      // Telemetry & FPS Counter
      this.frameCount++;
      if (now - this.lastFpsUpdate >= 500) {
        this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
        this.frameCount = 0;
        this.lastFpsUpdate = now;
      }

      // Freeze frame logic for cinematic impacts
      if (this.vfx.freezeFrames > 0) {
        this.vfx.freezeFrames--;
        this.render();
        return;
      }

      // Update Game State
      this.update(delta);

      // Render 3D Scene + 2D Arcade HUD
      this.render();
    }

    update(delta) {
      const time = performance.now() * 0.001;

      // Update Announcer Banner
      if (this.announcerBanner.life > 0) {
        this.announcerBanner.life -= delta;
        if (this.announcerBanner.life <= 0 && this.announcerBanner.callback) {
          const cb = this.announcerBanner.callback;
          this.announcerBanner.callback = null;
          cb();
        }
      }

      // Update Combat Physics & Inputs
      if (this.gameState === 'FIGHTING') {
        this.combat.updateInputs(delta);
        this.combat.checkCollisions();

        // Round Timer countdown
        this.roundTimerAccum += delta;
        if (this.roundTimerAccum >= 1.0) {
          this.roundTimerAccum -= 1.0;
          this.roundTimer = Math.max(0, this.roundTimer - 1);
          if (this.roundTimer === 0) {
            this.handleRoundEnd('timeout');
          }
        }

        // Check HP KO
        if (this.p1.hp <= 0) {
          this.handleRoundEnd('p2');
        } else if (this.p2.hp <= 0) {
          this.handleRoundEnd('p1');
        }
      }

      // Update Fighters
      this.p1.update(delta, this.p2);
      this.p2.update(delta, this.p1);

      // Update Arena Props & Cheering Crowd
      const isBigHit = this.p1.currentAttack && this.p1.currentAttack.cinematic;
      this.arena.update(time, isBigHit);

      // Update VFX
      this.vfx.update(delta);

      // Dynamic Cinemachine Camera Tracking
      this.updateCamera(delta);
    }

    handleRoundEnd(winner) {
      this.gameState = 'ROUND_OVER';
      this.p1.canAct = false;
      this.p2.canAct = false;

      let winText = "DOUBLE K.O.!";
      if (winner === 'p1') {
        this.p1Wins++;
        this.p1.state = 'VICTORY';
        winText = `${this.p1.options.name.toUpperCase()} WINS!`;
      } else if (winner === 'p2') {
        this.p2Wins++;
        this.p2.state = 'VICTORY';
        winText = `${this.p2.options.name.toUpperCase()} WINS!`;
      } else {
        if (this.p1.hp > this.p2.hp) {
          this.p1Wins++;
          winText = `${this.p1.options.name.toUpperCase()} WINS (TIME)!`;
        } else {
          this.p2Wins++;
          winText = `${this.p2.options.name.toUpperCase()} WINS (TIME)!`;
        }
      }

      this.showAnnouncer(winText, 2.5, () => {
        if (this.p1Wins >= 2 || this.p2Wins >= 2) {
          // Match Finished
          this.gameState = 'GAME_OVER';
          const matchWinner = this.p1Wins >= 2 ? this.p1.options.name : this.p2.options.name;
          this.showAnnouncer(`MATCH CHAMPION: ${matchWinner.toUpperCase()}!`, 3.5, () => {
            // Return to menu or restart
            document.getElementById('post-match-modal').style.display = 'flex';
          });
        } else {
          // Next Round
          this.roundNumber++;
          this.startRound();
        }
      });
    }

    updateCamera(delta) {
      const midX = (this.p1.x + this.p2.x) / 2;
      const midY = Math.max((this.p1.y + this.p2.y) / 2 + 1.8, 2.1);
      const fighterDist = Math.abs(this.p1.x - this.p2.x);

      let targetZ = Math.max(7.2, fighterDist * 0.7 + 4.8);
      let targetX = midX;
      let targetY = midY;

      // Close-up cinematic zoom during Super Move
      if (this.vfx.cinematicTarget) {
        targetX = this.vfx.cinematicTarget.x;
        targetY = this.vfx.cinematicTarget.y + 1.6;
        targetZ = 3.8;
      }

      // Smooth camera lerp
      this.camera.position.x += (targetX + this.vfx.shakeOffset.x - this.camera.position.x) * 0.12;
      this.camera.position.y += (targetY + this.vfx.shakeOffset.y - this.camera.position.y) * 0.12;
      this.camera.position.z += (targetZ - this.camera.position.z) * 0.1;

      this.camera.lookAt(midX, midY, 0);
    }

    render() {
      // 1. Render 3D WebGL Scene
      this.renderer.render(this.scene, this.camera);

      // 2. Render 2D Arcade HUD Overlay
      this.renderHUD();
    }

    renderHUD() {
      const ctx = this.hudCtx;
      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.clearRect(0, 0, w, h);

      // Draw Top Health & Super Meter HUD Bars
      this.drawFighterHUD(ctx, 40, 30, this.p1, 'left', this.p1Wins);
      this.drawFighterHUD(ctx, w - 40, 30, this.p2, 'right', this.p2Wins);

      // Central Round Timer
      ctx.save();
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(w / 2, 55, 34, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = this.roundTimer <= 10 ? '#ef4444' : '#ffffff';
      ctx.font = '900 32px "Trebuchet MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${this.roundTimer}`, w / 2, 55);

      ctx.font = '700 12px sans-serif';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(`ROUND ${this.roundNumber}`, w / 2, 98);
      ctx.restore();

      // Combo Counters
      if (this.combat.p1Combo > 1) {
        this.drawCombo(ctx, 80, 160, this.combat.p1Combo, 'left');
      }
      if (this.combat.p2Combo > 1) {
        this.drawCombo(ctx, w - 80, 160, this.combat.p2Combo, 'right');
      }

      // Floating Damage Numbers
      ctx.save();
      for (const ft of this.vfx.floatingTexts) {
        const screenPos = this.toScreenPosition(ft.x, ft.y);
        ctx.fillStyle = ft.color;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.font = `900 ${Math.round(28 * ft.scale)}px "Impact", sans-serif`;
        ctx.textAlign = 'center';
        ctx.strokeText(ft.text, screenPos.x, screenPos.y);
        ctx.fillText(ft.text, screenPos.x, screenPos.y);
      }
      ctx.restore();

      // Announcer Banner Overlay
      if (this.announcerBanner.life > 0) {
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Dark dramatic banner bar
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(0, h / 2 - 55, w, 110);

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 4;
        ctx.strokeRect(0, h / 2 - 55, w, 110);

        ctx.font = '900 52px "Trebuchet MS", Impact, sans-serif';
        ctx.fillStyle = '#ffcc00';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 20;
        ctx.strokeText(this.announcerBanner.text, w / 2, h / 2);
        ctx.fillText(this.announcerBanner.text, w / 2, h / 2);
        ctx.restore();
      }

      // Telemetry & FPS Badge in corner
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(w - 120, h - 35, 110, 26);
      ctx.font = '700 13px monospace';
      ctx.fillStyle = this.fps >= 55 ? '#22c55e' : (this.fps >= 30 ? '#eab308' : '#ef4444');
      ctx.textAlign = 'right';
      ctx.fillText(`${this.fps} FPS (WebGL)`, w - 18, h - 18);
      ctx.restore();
    }

    drawFighterHUD(ctx, x, y, fighter, side, wins) {
      const isLeft = side === 'left';
      const barW = Math.min(window.innerWidth * 0.38, 420);
      const barH = 22;

      ctx.save();

      // 1. Fighter Name and Subtitle
      ctx.font = '900 20px "Trebuchet MS", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = isLeft ? 'left' : 'right';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 6;
      ctx.fillText(fighter.options.name.toUpperCase(), isLeft ? x : x, y);

      // Faction / Custom tag
      ctx.font = '700 11px sans-serif';
      ctx.fillStyle = fighter.options.auraColor ? fighter.options.auraColor : '#f59e0b';
      ctx.fillText(fighter.options.superName, isLeft ? x : x, y + 15);

      // Win Round Orbs
      const orbX = isLeft ? x + barW - 35 : x - barW + 15;
      for (let i = 0; i < 2; i++) {
        ctx.beginPath();
        ctx.arc(orbX + (isLeft ? -i * 18 : i * 18), y + 6, 6, 0, Math.PI * 2);
        ctx.fillStyle = wins > i ? '#ef4444' : '#334155';
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // 2. Health Bar Container
      const barStartX = isLeft ? x : x - barW;
      const barStartY = y + 24;

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(barStartX, barStartY, barW, barH);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(barStartX, barStartY, barW, barH);

      // Current HP Fill
      const hpRatio = Math.max(0, fighter.hp / fighter.options.maxHp);
      const fillW = barW * hpRatio;
      const hpColor = hpRatio > 0.5 ? '#22c55e' : (hpRatio > 0.25 ? '#eab308' : '#ef4444');

      ctx.fillStyle = hpColor;
      if (isLeft) {
        ctx.fillRect(barStartX, barStartY, fillW, barH);
      } else {
        ctx.fillRect(barStartX + (barW - fillW), barStartY, fillW, barH);
      }

      // 3. Super Meter Bar (0 - 100%)
      const meterY = barStartY + barH + 6;
      const meterH = 12;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(barStartX, meterY, barW, meterH);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(barStartX, meterY, barW, meterH);

      const superRatio = fighter.superMeter / 100;
      const superFillW = barW * superRatio;
      const isSuperFull = fighter.superMeter >= 100;

      ctx.fillStyle = isSuperFull ? '#f59e0b' : '#0284c7';
      if (isLeft) {
        ctx.fillRect(barStartX, meterY, superFillW, meterH);
      } else {
        ctx.fillRect(barStartX + (barW - superFillW), meterY, superFillW, meterH);
      }

      if (isSuperFull) {
        ctx.font = '900 10px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('SUPER READY [SPACE / ENTER]', barStartX + barW / 2, meterY + 9);
      }

      ctx.restore();
    }

    drawCombo(ctx, x, y, hits, side) {
      ctx.save();
      ctx.textAlign = side === 'left' ? 'left' : 'right';
      ctx.font = '900 38px "Impact", sans-serif';
      ctx.fillStyle = '#f59e0b';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 6;
      const text = `${hits} HITS!`;
      ctx.strokeText(text, x, y);
      ctx.fillText(text, x, y);

      ctx.font = '800 16px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(hits >= 5 ? 'BRUTAL COMBO!' : 'NICE COMBO!', x, y + 24);
      ctx.restore();
    }

    toScreenPosition(objX, objY) {
      const THREE = window.THREE;
      const vector = new THREE.Vector3(objX, objY, 0);
      vector.project(this.camera);

      const w = window.innerWidth;
      const h = window.innerHeight;
      return {
        x: (vector.x * 0.5 + 0.5) * w,
        y: (-(vector.y * 0.5) + 0.5) * h
      };
    }
  }

  window.GameEngine = GameEngine;
})(window);
