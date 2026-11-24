// combat.js - Collision Resolution, Hitbox Pipeline, Combo Tracker & CPU AI

(function(window) {
  'use strict';

  class CombatManager {
    constructor(p1, p2, soundEngine, vfxManager) {
      this.p1 = p1;
      this.p2 = p2;
      this.sound = soundEngine;
      this.vfx = vfxManager;

      this.gameMode = 'pve'; // 'pve' (Player vs CPU), 'pvp' (2 Player Local), 'eve' (CPU vs CPU)
      this.aiDifficulty = 'medium'; // 'easy', 'medium', 'hard', 'beast'

      // Input State tracking
      this.keys = {};
      this.p1Inputs = { fwd: false, back: false, up: false, down: false };
      this.p2Inputs = { fwd: false, back: false, up: false, down: false };

      // Combos
      this.p1Combo = 0;
      this.p2Combo = 0;
      this.p1ComboTimer = 0;
      this.p2ComboTimer = 0;

      // AI Logic timers
      this.aiTimer = 0;
      this.aiNextActionTime = 0;
      this.aiTargetAction = null;

      this.initInputListeners();
    }

    initInputListeners() {
      window.addEventListener('keydown', (e) => {
        // Prevent default scrolling for game keys
        if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
          e.preventDefault();
        }
        this.keys[e.code] = true;
        this.handleKeyDown(e.code);
      });

      window.addEventListener('keyup', (e) => {
        this.keys[e.code] = false;
      });
    }

    handleKeyDown(code) {
      // Player 1 Actions
      if (this.gameMode !== 'eve') {
        if (this.p1.canAct) {
          if (code === 'KeyF') {
            if (this.p1.executeMove('JAB')) this.sound.playWhoosh();
          } else if (code === 'KeyG') {
            if (this.p1.executeMove('CROSS')) this.sound.playWhoosh();
          } else if (code === 'KeyK') {
            if (this.p1.executeMove('KICK')) this.sound.playWhoosh();
          } else if (code === 'KeyH') {
            if (this.p1.executeMove('UPPERCUT')) this.sound.playWhoosh();
          } else if (code === 'KeyV') {
            if (this.p1.executeMove('SWEEP')) this.sound.playWhoosh();
          } else if (code === 'KeyB') {
            if (this.p1.executeMove('SPECIAL1')) this.sound.playWhoosh();
          } else if (code === 'Space') {
            if (this.p1.superMeter >= 100) {
              if (this.p1.executeMove('SUPER')) {
                this.sound.playSuperCharge();
                this.vfx.triggerCinematicFreeze(this.p1);
              }
            }
          }
        }
      }

      // Player 2 Actions (when in PvP Local 2-Player mode)
      if (this.gameMode === 'pvp') {
        if (this.p2.canAct) {
          if (code === 'Numpad1' || code === 'KeyU') {
            if (this.p2.executeMove('JAB')) this.sound.playWhoosh();
          } else if (code === 'Numpad2' || code === 'KeyI') {
            if (this.p2.executeMove('CROSS')) this.sound.playWhoosh();
          } else if (code === 'Numpad3' || code === 'KeyO') {
            if (this.p2.executeMove('KICK')) this.sound.playWhoosh();
          } else if (code === 'Numpad4' || code === 'KeyP') {
            if (this.p2.executeMove('UPPERCUT')) this.sound.playWhoosh();
          } else if (code === 'Numpad0' || code === 'KeyM') {
            if (this.p2.executeMove('SWEEP')) this.sound.playWhoosh();
          } else if (code === 'NumpadDecimal' || code === 'KeyL') {
            if (this.p2.executeMove('SPECIAL1')) this.sound.playWhoosh();
          } else if (code === 'Enter' || code === 'KeyY') {
            if (this.p2.superMeter >= 100) {
              if (this.p2.executeMove('SUPER')) {
                this.sound.playSuperCharge();
                this.vfx.triggerCinematicFreeze(this.p2);
              }
            }
          }
        }
      }
    }

    updateInputs(delta) {
      // 1. Process Player 1 continuous inputs
      if (this.gameMode !== 'eve') {
        const p1MoveSpeed = 7.0 * this.p1.options.speedMul;
        const left = this.keys['KeyA'];
        const right = this.keys['KeyD'];
        const up = this.keys['KeyW'];
        const down = this.keys['KeyS'];

        if (this.p1.canAct) {
          if (up && this.p1.isGrounded) {
            this.p1.vy = 8.5;
            this.p1.isGrounded = false;
            this.p1.state = 'JUMP';
          } else if (down && this.p1.isGrounded) {
            this.p1.state = 'CROUCH';
            this.p1.isBlocking = true;
          } else if (left) {
            this.p1.vx = -p1MoveSpeed;
            this.p1.state = this.p1.facing === 1 ? 'WALK_BACK' : 'WALK_FWD';
            this.p1.isBlocking = (this.p1.facing === 1);
          } else if (right) {
            this.p1.vx = p1MoveSpeed;
            this.p1.state = this.p1.facing === 1 ? 'WALK_FWD' : 'WALK_BACK';
            this.p1.isBlocking = (this.p1.facing === -1);
          } else {
            if (this.p1.state === 'WALK_FWD' || this.p1.state === 'WALK_BACK' || this.p1.state === 'CROUCH') {
              this.p1.state = 'IDLE';
            }
            this.p1.isBlocking = false;
          }
        }
      }

      // 2. Process Player 2 / CPU Inputs
      if (this.gameMode === 'pvp') {
        const p2MoveSpeed = 7.0 * this.p2.options.speedMul;
        const left = this.keys['ArrowLeft'] || this.keys['KeyJ'];
        const right = this.keys['ArrowRight'] || this.keys['KeyL'];
        const up = this.keys['ArrowUp'] || this.keys['KeyI'];
        const down = this.keys['ArrowDown'] || this.keys['KeyK'];

        if (this.p2.canAct) {
          if (up && this.p2.isGrounded) {
            this.p2.vy = 8.5;
            this.p2.isGrounded = false;
            this.p2.state = 'JUMP';
          } else if (down && this.p2.isGrounded) {
            this.p2.state = 'CROUCH';
            this.p2.isBlocking = true;
          } else if (left) {
            this.p2.vx = -p2MoveSpeed;
            this.p2.state = this.p2.facing === 1 ? 'WALK_BACK' : 'WALK_FWD';
            this.p2.isBlocking = (this.p2.facing === 1);
          } else if (right) {
            this.p2.vx = p2MoveSpeed;
            this.p2.state = this.p2.facing === 1 ? 'WALK_FWD' : 'WALK_BACK';
            this.p2.isBlocking = (this.p2.facing === -1);
          } else {
            if (this.p2.state === 'WALK_FWD' || this.p2.state === 'WALK_BACK' || this.p2.state === 'CROUCH') {
              this.p2.state = 'IDLE';
            }
            this.p2.isBlocking = false;
          }
        }
      } else {
        // Run AI for Player 2 (and Player 1 if EvE)
        this.updateAI(this.p2, this.p1, delta);
        if (this.gameMode === 'eve') {
          this.updateAI(this.p1, this.p2, delta);
        }
      }

      // Combo timeouts
      if (this.p1ComboTimer > 0) {
        this.p1ComboTimer -= delta;
        if (this.p1ComboTimer <= 0) this.p1Combo = 0;
      }
      if (this.p2ComboTimer > 0) {
        this.p2ComboTimer -= delta;
        if (this.p2ComboTimer <= 0) this.p2Combo = 0;
      }
    }

    // Intelligent AI Decision Matrix
    updateAI(bot, target, delta) {
      if (!bot.canAct) return;

      this.aiTimer += delta;
      const dist = Math.abs(bot.x - target.x);
      const isTargetAttacking = target.currentAttack !== null;

      // Reaction delays and block chances per difficulty
      let blockChance = 0.3;
      let aggroDist = 2.2;
      let moveSpeed = 6.0;

      if (this.aiDifficulty === 'easy') {
        blockChance = 0.15;
        moveSpeed = 4.5;
      } else if (this.aiDifficulty === 'hard') {
        blockChance = 0.65;
        moveSpeed = 7.2;
      } else if (this.aiDifficulty === 'beast') {
        blockChance = 0.85;
        moveSpeed = 8.0;
      }

      // 1. Defense / Blocking Logic
      if (isTargetAttacking && dist < 3.2 && Math.random() < blockChance) {
        bot.isBlocking = true;
        bot.state = 'CROUCH';
        bot.vx = -bot.facing * 2.0;
        return;
      } else {
        bot.isBlocking = false;
      }

      // 2. Super Move Trigger
      if (bot.superMeter >= 100 && dist < 4.0 && Math.random() < 0.08) {
        if (bot.executeMove('SUPER')) {
          this.sound.playSuperCharge();
          this.vfx.triggerCinematicFreeze(bot);
          return;
        }
      }

      // 3. Spacing & Approach
      if (dist > aggroDist) {
        // Move towards target
        const dir = bot.x < target.x ? 1 : -1;
        bot.vx = dir * moveSpeed;
        bot.state = 'WALK_FWD';
      } else {
        // In striking range! Pick tactical attack
        bot.vx = 0;
        const roll = Math.random();

        if (roll < 0.28) {
          bot.executeMove('JAB');
          this.sound.playWhoosh();
        } else if (roll < 0.52) {
          bot.executeMove('CROSS');
          this.sound.playWhoosh();
        } else if (roll < 0.72) {
          bot.executeMove('KICK');
          this.sound.playWhoosh();
        } else if (roll < 0.85) {
          bot.executeMove('UPPERCUT');
          this.sound.playWhoosh();
        } else if (roll < 0.94) {
          bot.executeMove('SWEEP');
          this.sound.playWhoosh();
        } else {
          bot.executeMove('SPECIAL1');
          this.sound.playWhoosh();
        }
      }
    }

    // Frame Collision Check
    checkCollisions() {
      this.checkAttackImpact(this.p1, this.p2, (dmg, isBlock) => {
        this.p1Combo++;
        this.p1ComboTimer = 1.4;
        this.p1.superMeter = Math.min(100, this.p1.superMeter + 10);
      });

      this.checkAttackImpact(this.p2, this.p1, (dmg, isBlock) => {
        this.p2Combo++;
        this.p2ComboTimer = 1.4;
        this.p2.superMeter = Math.min(100, this.p2.superMeter + 10);
      });
    }

    checkAttackImpact(attacker, defender, onHitCallback) {
      if (!attacker.currentAttack || attacker.hasHitOpponent) return;

      const hitbox = attacker.getActiveHitbox();
      if (!hitbox) return;

      const hurtbox = defender.getHurtbox();

      // Circle-to-Circle collision in 2D battle plane
      const dx = hitbox.x - hurtbox.x;
      const dy = hitbox.y - Math.max(hurtbox.yMin, Math.min(hitbox.y, hurtbox.yMax));
      const distSq = dx * dx + dy * dy;
      const collisionRadius = hitbox.radius + hurtbox.radius;

      if (distSq < collisionRadius * collisionRadius) {
        attacker.hasHitOpponent = true;

        const isBlock = defender.isBlocking;
        const result = defender.takeDamage(hitbox.attackData.damage, isBlock, hitbox.attackData);

        // Sound & Particle VFX
        if (isBlock) {
          this.sound.playBlock();
          this.vfx.spawnBlockSparks(hitbox.x, hitbox.y);
          this.vfx.spawnDamageNumber(hitbox.x, hitbox.y + 0.8, result.finalDmg, true);
        } else {
          const soundType = hitbox.attackData.cinematic ? 'super' : (hitbox.attackData.launch ? 'uppercut' : 'heavy');
          this.sound.playHit(soundType);

          // Impact effects
          this.vfx.spawnHitSparks(hitbox.x, hitbox.y, hitbox.attackData.cinematic);
          this.vfx.spawnDamageNumber(hitbox.x, hitbox.y + 0.8, result.finalDmg, false);
          this.vfx.addScreenShake(hitbox.attackData.cinematic ? 18 : 8);

          if (hitbox.attackData.cinematic) {
            this.sound.playSuperExplosion();
          }

          if (result.isKo) {
            this.sound.playCheer();
            this.sound.speak("K. O.!");
            this.vfx.triggerKoCinematic(defender);
          }
        }

        if (onHitCallback) onHitCallback(result.finalDmg, isBlock);
      }
    }
  }

  window.CombatManager = CombatManager;
})(window);
