import { ALL_PERKS, SHIP_CLASSES, WORLD_BOUNDS } from './constants';
import {
  applyDamageToPlayer,
  circleIntersectsCircle,
  clamp,
  distance,
  getXpRequiredForLevel,
  calculateCombatIntensity,
} from './rules';
import {
  Bullet,
  Enemy,
  FloatingText,
  Gem,
  GameStatus,
  Perk,
  PerkId,
  PlayerState,
  RunStats,
  ShipClass,
  ShipClassId,
  ActiveMissionBuffs,
  DailyMission,
  MissionEvent,
  CelestialGalaxy,
  Planet,
} from './types';
import { ParticlePool } from './particles';
import { soundEngine } from './audio';
import {
  calculateActiveMissionBuffs,
  claimMissionReward,
  loadSavedMissions,
  saveMissions,
  updateMissionProgress,
} from './missions';
import {
  CAMPAIGN_SECTORS,
  SectorDef,
  SectorProgress,
  getSectorById,
  loadSavedSectorProgress,
  recordSectorVictory,
} from './sectors';
import {
  createDefaultGalaxies,
  createDefaultPlanets,
  drawGalaxy,
  drawPlanet,
  isPlayerInPlanetOrbit,
  updatePlanetScan,
} from './celestial';

export interface SectorVictoryData {
  sector: SectorDef;
  stars: number;
  score: number;
  time: number;
  nextSectorUnlocked: number | null;
}

export interface EngineCallbacks {
  onStateChange: (state: GameStatus) => void;
  onStatsUpdate: (stats: RunStats) => void;
  onPlayerUpdate: (player: PlayerState) => void;
  onPerkSelectionRequired: (perks: Perk[]) => void;
  onWaveStart: (wave: number) => void;
  onMissionsUpdate?: (missions: DailyMission[], buffs: ActiveMissionBuffs) => void;
  onMissionCompletedAlert?: (mission: DailyMission) => void;
  onSectorVictory?: (data: SectorVictoryData) => void;
  onIntensityChange?: (intensity: number, bpm: number) => void;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private callbacks: EngineCallbacks;

  public status: GameStatus = 'title';
  public currentShipClass: ShipClass = SHIP_CLASSES.vanguard;

  // Simulation Entities
  public player: PlayerState;
  private enemies: Enemy[] = [];
  private playerBullets: Bullet[] = [];
  private enemyBullets: Bullet[] = [];
  private gems: Gem[] = [];
  private floatingTexts: FloatingText[] = [];
  private particles: ParticlePool;

  // Wave & Spawning
  public currentWave: number = 1;
  private maxWaves: number = 3;
  private waveSpawnRemaining: number = 0;
  private spawnCooldown: number = 0;
  private bossSpawned: boolean = false;

  // Campaign Sector & Combat Intensity
  public currentSector: SectorDef = CAMPAIGN_SECTORS[0];
  public sectorProgress: SectorProgress[] = loadSavedSectorProgress();
  private smoothedIntensity: number = 0;

  // Run Statistics
  public stats: RunStats = {
    score: 0,
    highScore: 0,
    combo: 1,
    highestCombo: 1,
    comboTimer: 0,
    kills: 0,
    damageDealt: 0,
    waveReached: 1,
    timeElapsed: 0,
    perks: [],
  };

  // Daily Missions & Active Buffs
  public dailyMissions: DailyMission[] = [];
  public activeBuffs: ActiveMissionBuffs = {
    scoreMultiplier: 1.0,
    bonusMaxHp: 0,
    bonusMaxShield: 0,
    speedMultiplier: 1.0,
    damageMultiplier: 1.0,
  };
  private survivalTimerAccumulator: number = 0;

  // Celestial Bodies: Galaxies and Planets
  public galaxies: CelestialGalaxy[] = createDefaultGalaxies();
  public planets: Planet[] = createDefaultPlanets();

  // Screen Shake & Hitstop
  private trauma: number = 0;
  private hitstopTimer: number = 0;

  // Inputs
  private keys: Record<string, boolean> = {};
  private mouseWorldX: number = 0;
  private mouseWorldY: number = 0;
  private isMouseDown: boolean = false;

  // Starfield Parallax
  private stars: Array<{ x: number; y: number; size: number; speed: number; alpha: number }> = [];

  // Loop control
  private animFrameId: number = 0;
  private lastTime: number = 0;
  private nextEntityId: number = 1;

  constructor(canvas: HTMLCanvasElement, callbacks: EngineCallbacks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.callbacks = callbacks;
    this.particles = new ParticlePool();

    // Load missions & active buffs
    this.dailyMissions = loadSavedMissions();
    this.activeBuffs = calculateActiveMissionBuffs(this.dailyMissions);

    this.player = this.createDefaultPlayer(this.currentShipClass);
    this.initStars();
    this.loadHighScore();

    this.setupListeners();

    // Initial notify of missions
    this.callbacks.onMissionsUpdate?.(this.dailyMissions, this.activeBuffs);
  }

  public dispatchMissionEvent(event: MissionEvent) {
    const res = updateMissionProgress(this.dailyMissions, event);
    this.dailyMissions = res.updatedMissions;

    if (res.newlyCompleted.length > 0) {
      this.activeBuffs = calculateActiveMissionBuffs(this.dailyMissions);
      saveMissions(this.dailyMissions);

      for (const m of res.newlyCompleted) {
        soundEngine.playLevelUp();
        this.addFloatingText(this.player.x, this.player.y - 60, `GÖREV: ${m.reward.labelTr}!`, '#f59e0b');
        this.callbacks.onMissionCompletedAlert?.(m);
      }
      this.applyActiveBuffsToPlayer();
    } else {
      saveMissions(this.dailyMissions);
    }

    this.callbacks.onMissionsUpdate?.(this.dailyMissions, this.activeBuffs);
  }

  public claimMission(missionId: string) {
    this.dailyMissions = claimMissionReward(this.dailyMissions, missionId);
    this.activeBuffs = calculateActiveMissionBuffs(this.dailyMissions);
    saveMissions(this.dailyMissions);
    this.applyActiveBuffsToPlayer();
    this.callbacks.onMissionsUpdate?.(this.dailyMissions, this.activeBuffs);
  }

  private applyActiveBuffsToPlayer() {
    const targetMaxShield = this.currentShipClass.maxShield + this.activeBuffs.bonusMaxShield;
    if (this.player.maxShield < targetMaxShield) {
      const diff = targetMaxShield - this.player.maxShield;
      this.player.maxShield = targetMaxShield;
      this.player.shield = Math.min(targetMaxShield, this.player.shield + diff);
    }
    this.player.speed = Math.round(this.currentShipClass.speed * this.activeBuffs.speedMultiplier);
    this.player.bulletDamage = Math.round(this.currentShipClass.bulletDamage * this.activeBuffs.damageMultiplier);
  }

  private loadHighScore() {
    try {
      const saved = localStorage.getItem('siber_avci_highscore');
      if (saved) {
        this.stats.highScore = parseInt(saved, 10) || 0;
      }
    } catch {}
  }

  private saveHighScore() {
    try {
      if (this.stats.score > this.stats.highScore) {
        this.stats.highScore = this.stats.score;
        localStorage.setItem('siber_avci_highscore', this.stats.score.toString());
      }
    } catch {}
  }

  private initStars() {
    this.stars = [];
    for (let i = 0; i < 240; i++) {
      this.stars.push({
        x: Math.random() * WORLD_BOUNDS.width,
        y: Math.random() * WORLD_BOUNDS.height,
        size: Math.random() * 2 + 0.8,
        speed: Math.random() * 0.4 + 0.1,
        alpha: Math.random() * 0.6 + 0.3,
      });
    }
  }

  public setShipClass(classId: ShipClassId) {
    this.currentShipClass = SHIP_CLASSES[classId];
    this.player = this.createDefaultPlayer(this.currentShipClass);
  }

  private createDefaultPlayer(ship: ShipClass): PlayerState {
    const totalMaxShield = ship.maxShield + this.activeBuffs.bonusMaxShield;
    const speed = Math.round(ship.speed * this.activeBuffs.speedMultiplier);
    const bulletDamage = Math.round(ship.bulletDamage * this.activeBuffs.damageMultiplier);

    return {
      x: WORLD_BOUNDS.width / 2,
      y: WORLD_BOUNDS.height / 2,
      vx: 0,
      vy: 0,
      angle: 0,
      hp: ship.maxHp,
      maxHp: ship.maxHp,
      shield: totalMaxShield,
      maxShield: totalMaxShield,
      shieldRechargeTimer: 0,
      speed: speed,
      fireRate: ship.fireRate,
      fireCooldown: 0,
      dashCooldown: ship.dashCooldown,
      dashTimer: 0,
      isDashing: false,
      bulletDamage: bulletDamage,
      bulletSpeed: ship.bulletSpeed,
      pierceCount: 0,
      doubleShot: false,
      homingCount: 0,
      magnetRadius: 110,
      empCooldown: 0,
      empTimer: 0,
      level: 1,
      xp: 0,
      xpToNextLevel: getXpRequiredForLevel(1),
      hitFlashTimer: 0,
      invulnerabilityTimer: 2.5,
      recentDamageGhost: ship.maxHp,
      ghostFadeTimer: 0,
    };
  }

  public selectSector(sectorId: number) {
    this.currentSector = getSectorById(sectorId);
    this.maxWaves = this.currentSector.targetWaves;
    soundEngine.selectTrack(this.currentSector.recommendedTrackId);
  }

  public startRun(classId?: ShipClassId, sectorId?: number) {
    if (classId) {
      this.setShipClass(classId);
    }
    if (sectorId !== undefined) {
      this.selectSector(sectorId);
    } else {
      this.maxWaves = this.currentSector.targetWaves;
      soundEngine.selectTrack(this.currentSector.recommendedTrackId);
    }

    this.player = this.createDefaultPlayer(this.currentShipClass);
    this.enemies = [];
    this.playerBullets = [];
    this.enemyBullets = [];
    this.gems = [];
    this.floatingTexts = [];
    this.particles.clear();

    // Reset planets scan progress
    for (const p of this.planets) {
      p.scanned = false;
      p.scanProgress = 0;
    }

    this.currentWave = 1;
    this.bossSpawned = false;
    this.waveSpawnRemaining = Math.round(12 * this.currentSector.spawnRateMultiplier);
    this.spawnCooldown = 2.0;

    this.stats = {
      score: 0,
      highScore: this.stats.highScore,
      combo: 1,
      highestCombo: 1,
      comboTimer: 0,
      kills: 0,
      damageDealt: 0,
      waveReached: 1,
      timeElapsed: 0,
      perks: [],
    };

    this.setStatus('playing');
    this.callbacks.onWaveStart(1);
    this.callbacks.onStatsUpdate(this.stats);
    this.callbacks.onPlayerUpdate(this.player);
  }

  public setStatus(newStatus: GameStatus) {
    this.status = newStatus;
    if (typeof document !== 'undefined') {
      document.body.dataset.state = newStatus;
    }

    // Adapt procedural synthwave music mood
    if (newStatus === 'playing') {
      soundEngine.startMusic(this.bossSpawned ? 'boss' : 'combat');
    } else if (newStatus === 'paused') {
      soundEngine.setMusicMood('paused');
    } else if (newStatus === 'victory') {
      soundEngine.setMusicMood('victory');
    } else if (newStatus === 'gameover') {
      soundEngine.setMusicMood('gameover');
    } else if (newStatus === 'title') {
      soundEngine.setMusicMood('title');
    }

    this.callbacks.onStateChange(newStatus);
  }

  private setupListeners() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.handleBlur);
    document.addEventListener('visibilitychange', this.handleBlur);

    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    this.canvas.addEventListener('mouseup', this.handleMouseUp);
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  public destroy() {
    cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.handleBlur);
    document.removeEventListener('visibilitychange', this.handleBlur);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    this.keys[e.key.toLowerCase()] = true;

    if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
      if (this.status === 'playing') {
        this.setStatus('paused');
      } else if (this.status === 'paused') {
        this.setStatus('playing');
      }
    }

    if (e.key === 'm' || e.key === 'M') {
      soundEngine.toggleMute();
    }

    if (e.key === 'b' || e.key === 'B') {
      soundEngine.toggleMusicMute();
    }

    if (e.key === 'r' || e.key === 'R') {
      if (this.status === 'playing' || this.status === 'paused' || this.status === 'gameover') {
        this.startRun();
      }
    }

    if (e.key === ' ' || e.key === 'Shift') {
      this.triggerDash();
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keys[e.key.toLowerCase()] = false;
  };

  private handleBlur = () => {
    this.keys = {};
    this.isMouseDown = false;
  };

  private handleMouseMove = (e: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    const camX = this.player.x - this.canvas.width / 2;
    const camY = this.player.y - this.canvas.height / 2;
    this.mouseWorldX = (e.clientX - rect.left) + camX;
    this.mouseWorldY = (e.clientY - rect.top) + camY;
  };

  private handleMouseDown = (e: MouseEvent) => {
    if (e.button === 0) {
      this.isMouseDown = true;
    } else if (e.button === 2) {
      this.triggerDash();
    }
  };

  private handleMouseUp = (e: MouseEvent) => {
    if (e.button === 0) {
      this.isMouseDown = false;
    }
  };

  private triggerDash() {
    if (this.status !== 'playing') return;
    if (this.player.dashTimer > 0) return;

    this.player.isDashing = true;
    this.player.dashTimer = this.player.dashCooldown;
    soundEngine.playDash();

    // Dash burst vector
    const dashAngle = this.player.angle;
    this.player.vx = Math.cos(dashAngle) * (this.player.speed * 2.8);
    this.player.vy = Math.sin(dashAngle) * (this.player.speed * 2.8);

    this.particles.emitExplosion(this.player.x, this.player.y, this.currentShipClass.color, 14, 1.2);
  }

  public selectPerk(perk: Perk) {
    this.stats.perks.push(perk.id);
    // Apply perk modifiers
    switch (perk.id) {
      case 'double_barrel':
        this.player.doubleShot = true;
        break;
      case 'piercing_rounds':
        this.player.pierceCount += 2;
        break;
      case 'plasma_shield':
        this.player.maxShield += 50;
        this.player.shield = this.player.maxShield;
        break;
      case 'overcharge_thrust':
        this.player.speed = Math.round(this.player.speed * 1.25);
        this.player.dashCooldown = Math.max(1.0, this.player.dashCooldown - 0.8);
        break;
      case 'magnetic_collector':
        this.player.magnetRadius *= 2.8;
        break;
      case 'emp_nova':
        this.player.empCooldown = 7.0;
        this.player.empTimer = 7.0;
        break;
      case 'nanite_repair':
        this.player.maxHp += 40;
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + 50);
        break;
      case 'homing_missiles':
        this.player.homingCount += 2;
        break;
      case 'hyper_cooling':
        this.player.fireRate *= 1.35;
        this.player.bulletSpeed = Math.round(this.player.bulletSpeed * 1.25);
        break;
    }

    soundEngine.playPickup();
    this.setStatus('playing');
  }

  // Primary Animation Loop
  public startLoop() {
    this.lastTime = performance.now();
    const frame = (now: number) => {
      const rawDt = (now - this.lastTime) / 1000;
      this.lastTime = now;
      const dt = Math.min(rawDt, 0.05);

      if (this.status === 'playing') {
        this.update(dt);
      }
      this.render();

      this.animFrameId = requestAnimationFrame(frame);
    };
    this.animFrameId = requestAnimationFrame(frame);
  }

  private update(dt: number) {
    // Hitstop check
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      return;
    }

    this.stats.timeElapsed += dt;

    // Daily mission: survival time tracking
    this.survivalTimerAccumulator += dt;
    if (this.survivalTimerAccumulator >= 1.0) {
      this.survivalTimerAccumulator = 0;
      this.dispatchMissionEvent({ type: 'time_survived', seconds: this.stats.timeElapsed });
    }

    // Combo timer decay
    if (this.stats.comboTimer > 0) {
      this.stats.comboTimer -= dt;
      if (this.stats.comboTimer <= 0) {
        this.stats.combo = 1;
      }
    }

    // Screen shake trauma decay
    if (this.trauma > 0) {
      this.trauma = Math.max(0, this.trauma - dt * 1.6);
    }

    // Player controls & physics
    this.updatePlayer(dt);

    // Automated EMP Nova perk trigger
    if (this.player.empCooldown > 0) {
      this.player.empTimer -= dt;
      if (this.player.empTimer <= 0) {
        this.player.empTimer = this.player.empCooldown;
        this.triggerEmpNova();
      }
    }

    // Enemies logic & telegraphs
    this.updateEnemies(dt);

    // Bullets
    this.updateBullets(dt);

    // Gems & Drops
    this.updateGems(dt);

    // Particles
    this.particles.update(dt);

    // Floating text
    this.updateFloatingTexts(dt);

    // Spawning waves
    this.updateWaveSpawning(dt);

    // Celestial bodies (Galaxies & Planets)
    this.updateCelestial(dt);

    // Calculate dynamic combat intensity for adaptive music tempo & resonance
    const isBossAlive =
      this.bossSpawned &&
      this.enemies.some(
        (e) =>
          e.type === 'titan_boss' ||
          e.type === 'aegis_sentinel' ||
          e.type === 'hive_queen' ||
          e.type === 'omega_primus'
      );
    const hpRatio = this.player.hp / Math.max(1, this.player.maxHp);
    const rawIntensity = calculateCombatIntensity(
      this.enemies.length,
      isBossAlive,
      hpRatio,
      this.stats.combo
    );

    // Smooth intensity transitions
    this.smoothedIntensity = this.smoothedIntensity * 0.94 + rawIntensity * 0.06;
    soundEngine.setCombatIntensity(this.smoothedIntensity);
    if (this.callbacks.onIntensityChange) {
      this.callbacks.onIntensityChange(this.smoothedIntensity, soundEngine.getCurrentBpm());
    }

    // Periodically sync UI
    this.callbacks.onPlayerUpdate({ ...this.player });
  }

  private updateCelestial(dt: number) {
    // Rotate distant spiral galaxies
    for (const g of this.galaxies) {
      g.angle += g.rotationSpeed * dt;
    }

    // Update planets and orbit scanning
    for (const p of this.planets) {
      p.rotation += p.rotationSpeed * dt;
      if (p.moons) {
        for (const m of p.moons) {
          m.angle += m.speed * dt;
        }
      }

      const inOrbit = isPlayerInPlanetOrbit(this.player.x, this.player.y, p);

      if (inOrbit) {
        // Proximity tactical buffs
        if (p.type === 'gas_giant') {
          // Magnetosphere: faster shield recharge
          if (this.player.shield < this.player.maxShield) {
            this.player.shield = Math.min(this.player.maxShield, this.player.shield + 20 * dt);
          }
        } else if (p.type === 'ice') {
          // Cryo cooling: faster dash recovery
          if (this.player.dashTimer > 0) {
            this.player.dashTimer = Math.max(0, this.player.dashTimer - dt * 0.4);
          }
        }
      }

      const scanRes = updatePlanetScan(p, inOrbit, dt);
      if (scanRes.completedNow) {
        soundEngine.playLevelUp();
        this.addFloatingText(this.player.x, this.player.y - 60, `KEŞİF: ${p.nameTr}!`, '#4ade80');
        this.particles.emitExplosion(p.worldX, p.worldY, p.colorSecondary, 28, 1.4);
        const earnedScore = Math.round(1500 * this.activeBuffs.scoreMultiplier);
        this.stats.score += earnedScore;
        this.dispatchMissionEvent({ type: 'planet_scanned', planetId: p.id });
      }
    }
  }

  private triggerEmpNova() {
    soundEngine.playExplosion(false);
    this.particles.emitExplosion(this.player.x, this.player.y, '#38bdf8', 35, 1.8);
    // Destroy nearby enemy bullets
    this.enemyBullets = this.enemyBullets.filter((b) => {
      const dist = distance(this.player.x, this.player.y, b.x, b.y);
      if (dist < 320) {
        this.particles.emitHitSparks(b.x, b.y, '#38bdf8', 4);
        return false;
      }
      return true;
    });

    // Stun and damage enemies within 320px
    for (const enemy of this.enemies) {
      const d = distance(this.player.x, this.player.y, enemy.x, enemy.y);
      if (d < 320) {
        enemy.hp -= 25;
        enemy.hitFlashTimer = 0.15;
        this.addFloatingText(enemy.x, enemy.y, 'EMP!', '#38bdf8');
      }
    }
  }

  private updatePlayer(dt: number) {
    const p = this.player;

    // Movement Intent
    let moveX = 0;
    let moveY = 0;
    if (this.keys['w'] || this.keys['arrowup']) moveY -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) moveY += 1;
    if (this.keys['a'] || this.keys['arrowleft']) moveX -= 1;
    if (this.keys['d'] || this.keys['arrowright']) moveX += 1;

    // Aim angle towards mouse cursor in world
    p.angle = Math.atan2(this.mouseWorldY - p.y, this.mouseWorldX - p.x);

    // Acceleration with inertia
    if (moveX !== 0 || moveY !== 0) {
      const len = Math.hypot(moveX, moveY);
      const normX = moveX / len;
      const normY = moveY / len;
      const accel = p.speed * 4.2;

      p.vx += normX * accel * dt;
      p.vy += normY * accel * dt;

      // Thruster particles
      if (Math.random() < 0.6) {
        this.particles.emitThrust(p.x, p.y, Math.atan2(p.vy, p.vx), this.currentShipClass.trailColor);
      }
    }

    // Drag
    const drag = Math.pow(0.88, dt * 60);
    p.vx *= drag;
    p.vy *= drag;

    // Clamp speed if not dashing
    if (!p.isDashing) {
      const currentSpeed = Math.hypot(p.vx, p.vy);
      if (currentSpeed > p.speed) {
        p.vx = (p.vx / currentSpeed) * p.speed;
        p.vy = (p.vy / currentSpeed) * p.speed;
      }
    }

    p.x += p.vx * dt;
    p.y += p.vy * dt;

    // World bounds clamping
    p.x = clamp(p.x, 60, WORLD_BOUNDS.width - 60);
    p.y = clamp(p.y, 60, WORLD_BOUNDS.height - 60);

    // Dash cooldown
    if (p.dashTimer > 0) {
      p.dashTimer -= dt;
      if (p.dashTimer <= p.dashCooldown - 0.25) {
        p.isDashing = false;
      }
    }

    // Hit flash timer
    if (p.hitFlashTimer > 0) {
      p.hitFlashTimer -= dt;
    }

    // Invulnerability i-frames timer
    if (p.invulnerabilityTimer > 0) {
      p.invulnerabilityTimer -= dt;
    }

    // Shield recharge logic
    p.shieldRechargeTimer += dt;
    if (p.shieldRechargeTimer > 3.0 && p.shield < p.maxShield) {
      p.shield = Math.min(p.maxShield, p.shield + this.currentShipClass.shieldRechargeRate * dt);
    }

    // Ghost damage bar trailing interpolation
    if (p.recentDamageGhost > p.hp) {
      p.ghostFadeTimer += dt;
      if (p.ghostFadeTimer > 0.4) {
        p.recentDamageGhost = Math.max(p.hp, p.recentDamageGhost - 50 * dt);
      }
    } else {
      p.recentDamageGhost = p.hp;
      p.ghostFadeTimer = 0;
    }

    // Weapon firing
    p.fireCooldown -= dt;
    if ((this.isMouseDown || this.keys[' ']) && p.fireCooldown <= 0) {
      this.firePlayerWeapon();
      p.fireCooldown = 1 / p.fireRate;
    }
  }

  private firePlayerWeapon() {
    const p = this.player;
    soundEngine.playLaser();

    const forwardX = Math.cos(p.angle);
    const forwardY = Math.sin(p.angle);
    const perpX = -forwardY;
    const perpY = forwardX;

    const baseSpeed = p.bulletSpeed;
    const isHeavy = this.currentShipClass.id === 'dreadnought';

    if (p.doubleShot) {
      // Twin parallel barrels
      const offset = 8;
      const b1X = p.x + perpX * offset + forwardX * 16;
      const b1Y = p.y + perpY * offset + forwardY * 16;
      const b2X = p.x - perpX * offset + forwardX * 16;
      const b2Y = p.y - perpY * offset + forwardY * 16;
      this.createPlayerBullet(b1X, b1Y, forwardX, forwardY, baseSpeed);
      this.createPlayerBullet(b2X, b2Y, forwardX, forwardY, baseSpeed);
      this.particles.emitMuzzleFlash(b1X, b1Y, p.angle, this.currentShipClass.color, isHeavy);
      this.particles.emitMuzzleFlash(b2X, b2Y, p.angle, this.currentShipClass.color, isHeavy);
    } else {
      const bX = p.x + forwardX * 18;
      const bY = p.y + forwardY * 18;
      this.createPlayerBullet(bX, bY, forwardX, forwardY, baseSpeed);
      this.particles.emitMuzzleFlash(bX, bY, p.angle, this.currentShipClass.color, isHeavy);
    }

    // Camera punch for visceral recoil
    this.trauma = Math.min(1, this.trauma + (isHeavy ? 0.08 : 0.03));

    // Homing micro-missiles if unlocked
    if (p.homingCount > 0 && Math.random() < 0.45) {
      const spread = (Math.random() - 0.5) * 0.8;
      const hAngle = p.angle + spread;
      this.playerBullets.push({
        id: this.nextEntityId++,
        x: p.x,
        y: p.y,
        vx: Math.cos(hAngle) * (baseSpeed * 0.8),
        vy: Math.sin(hAngle) * (baseSpeed * 0.8),
        radius: 4,
        damage: Math.round(p.bulletDamage * 0.7),
        isPlayer: true,
        color: '#f59e0b',
        pierce: 1,
        homing: true,
        life: 2.2,
        maxLife: 2.2,
      });
      this.particles.emitMuzzleFlash(p.x, p.y, hAngle, '#f59e0b', false);
    }

    // Recoil
    p.vx -= forwardX * 18;
    p.vy -= forwardY * 18;
  }

  private createPlayerBullet(x: number, y: number, dirX: number, dirY: number, speed: number) {
    this.playerBullets.push({
      id: this.nextEntityId++,
      x,
      y,
      vx: dirX * speed,
      vy: dirY * speed,
      radius: 3.5,
      damage: this.player.bulletDamage,
      isPlayer: true,
      color: this.currentShipClass.color,
      pierce: this.player.pierceCount + 1,
      homing: false,
      life: 1.4,
      maxLife: 1.4,
    });
  }

  private updateBullets(dt: number) {
    // Player bullets
    for (let i = this.playerBullets.length - 1; i >= 0; i--) {
      const b = this.playerBullets[i];
      b.life -= dt;

      // Homing steer towards nearest enemy
      if (b.homing) {
        let nearest: Enemy | null = null;
        let minDist = 400;
        for (const e of this.enemies) {
          const d = distance(b.x, b.y, e.x, e.y);
          if (d < minDist) {
            minDist = d;
            nearest = e;
          }
        }
        if (nearest) {
          const toX = nearest.x - b.x;
          const toY = nearest.y - b.y;
          const dist = Math.hypot(toX, toY);
          if (dist > 0) {
            const desiredVx = (toX / dist) * this.player.bulletSpeed;
            const desiredVy = (toY / dist) * this.player.bulletSpeed;
            b.vx += (desiredVx - b.vx) * 0.12;
            b.vy += (desiredVy - b.vy) * 0.12;
          }
        }
      }

      b.x += b.vx * dt;
      b.y += b.vy * dt;

      // Projectile exhaust trail
      if (b.homing) {
        this.particles.emitProjectileTrail(b.x, b.y, b.vx, b.vy, b.color, { size: 3.2, isHoming: true });
      } else if (Math.random() < 0.4) {
        this.particles.emitProjectileTrail(b.x, b.y, b.vx, b.vy, b.color, { size: b.radius * 0.75 });
      }

      // Check collision with enemies
      for (const enemy of this.enemies) {
        if (circleIntersectsCircle(b.x, b.y, b.radius, enemy.x, enemy.y, enemy.radius)) {
          enemy.hp -= b.damage;
          enemy.hitFlashTimer = 0.08;
          this.stats.damageDealt += b.damage;
          soundEngine.playHit();
          this.particles.emitHitSparks(b.x, b.y, b.color, 5);
          this.addFloatingText(enemy.x, enemy.y, `-${b.damage}`, '#ffffff');

          b.pierce -= 1;
          if (b.pierce <= 0) {
            b.life = 0;
            break;
          }
        }
      }

      if (b.life <= 0 || b.x < 0 || b.x > WORLD_BOUNDS.width || b.y < 0 || b.y > WORLD_BOUNDS.height) {
        this.playerBullets.splice(i, 1);
      }
    }

    // Enemy bullets
    for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
      const b = this.enemyBullets[i];
      b.life -= dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;

      // Trailing exhaust for enemy plasma / sniper bolts
      if (Math.random() < 0.35) {
        this.particles.emitProjectileTrail(b.x, b.y, b.vx, b.vy, b.color, { size: b.radius * 0.65 });
      }

      // Collision with player
      if (
        !this.player.isDashing &&
        circleIntersectsCircle(b.x, b.y, b.radius, this.player.x, this.player.y, 16)
      ) {
        this.damagePlayer(b.damage);
        this.enemyBullets.splice(i, 1);
        continue;
      }

      if (b.life <= 0 || b.x < 0 || b.x > WORLD_BOUNDS.width || b.y < 0 || b.y > WORLD_BOUNDS.height) {
        this.enemyBullets.splice(i, 1);
      }
    }
  }

  private updateEnemies(dt: number) {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];

      if (e.hitFlashTimer > 0) {
        e.hitFlashTimer -= dt;
      }

      // Check KO
      if (e.hp <= 0) {
        this.handleEnemyDefeat(e);
        this.enemies.splice(i, 1);
        continue;
      }

      const distToPlayer = distance(e.x, e.y, this.player.x, this.player.y);
      const angleToPlayer = Math.atan2(this.player.y - e.y, this.player.x - e.x);

      // Archetype specific movement & state machines
      switch (e.type) {
        case 'swarmer': {
          // Swarmer: Flocks towards player, telegraphs at close range, lunges!
          if (e.state === 'idle') {
            e.angle = angleToPlayer;
            e.vx = Math.cos(e.angle) * e.speed;
            e.vy = Math.sin(e.angle) * e.speed;

            if (distToPlayer < 150) {
              e.state = 'telegraphing';
              e.stateTimer = 0.35; // 0.35s windup telegraph
              soundEngine.playTelegraph();
            }
          } else if (e.state === 'telegraphing') {
            e.stateTimer -= dt;
            e.telegraphProgress = 1 - (e.stateTimer / 0.35);
            // Slow down while winding up
            e.vx *= 0.85;
            e.vy *= 0.85;

            if (e.stateTimer <= 0) {
              e.state = 'attacking';
              e.stateTimer = 0.3;
              // High speed lunge towards player
              e.vx = Math.cos(e.angle) * (e.speed * 2.4);
              e.vy = Math.sin(e.angle) * (e.speed * 2.4);
            }
          } else if (e.state === 'attacking') {
            e.stateTimer -= dt;
            if (e.stateTimer <= 0) {
              e.state = 'idle';
              e.telegraphProgress = 0;
            }
          }
          break;
        }

        case 'sniper': {
          // Sniper: maintains standoff distance (320-400px), aims laser line, fires high-speed bolt
          e.angle = angleToPlayer;
          e.attackCooldown -= dt;

          if (distToPlayer < 280) {
            // Back away
            e.vx = -Math.cos(angleToPlayer) * e.speed;
            e.vy = -Math.sin(angleToPlayer) * e.speed;
          } else if (distToPlayer > 440) {
            // Close in
            e.vx = Math.cos(angleToPlayer) * e.speed;
            e.vy = Math.sin(angleToPlayer) * e.speed;
          } else {
            // Orbit tangentially
            const orbitAngle = angleToPlayer + Math.PI / 2;
            e.vx = Math.cos(orbitAngle) * (e.speed * 0.7);
            e.vy = Math.sin(orbitAngle) * (e.speed * 0.7);
          }

          if (e.state === 'idle' && e.attackCooldown <= 0) {
            e.state = 'telegraphing';
            e.stateTimer = 0.7; // 0.7s visible laser sight telegraph
            e.aimX = this.player.x;
            e.aimY = this.player.y;
            soundEngine.playTelegraph();
          } else if (e.state === 'telegraphing') {
            e.stateTimer -= dt;
            e.telegraphProgress = 1 - (e.stateTimer / 0.7);
            // Smoothly track player
            e.aimX = this.player.x;
            e.aimY = this.player.y;

            if (e.stateTimer <= 0) {
              e.state = 'idle';
              e.telegraphProgress = 0;
              e.attackCooldown = 2.4;
              // Fire sniper bolt
              const shotAngle = Math.atan2(e.aimY! - e.y, e.aimX! - e.x);
              const muzzleX = e.x + Math.cos(shotAngle) * 16;
              const muzzleY = e.y + Math.sin(shotAngle) * 16;
              this.particles.emitMuzzleFlash(muzzleX, muzzleY, shotAngle, '#c084fc', true);
              this.enemyBullets.push({
                id: this.nextEntityId++,
                x: muzzleX,
                y: muzzleY,
                vx: Math.cos(shotAngle) * 520,
                vy: Math.sin(shotAngle) * 520,
                radius: 4.5,
                damage: 26,
                isPlayer: false,
                color: '#a855f7',
                pierce: 1,
                homing: false,
                life: 2.0,
                maxLife: 2.0,
              });
              soundEngine.playLaser(0.2);
            }
          }
          break;
        }

        case 'charger': {
          // Charger: Heavy armored bruiser. Locks target, winds up, dashes straight
          if (e.state === 'idle') {
            e.angle = angleToPlayer;
            e.vx = Math.cos(angleToPlayer) * (e.speed * 0.75);
            e.vy = Math.sin(angleToPlayer) * (e.speed * 0.75);
            e.attackCooldown -= dt;

            if (distToPlayer < 360 && e.attackCooldown <= 0) {
              e.state = 'telegraphing';
              e.stateTimer = 0.65;
              e.chargeTargetX = this.player.x;
              e.chargeTargetY = this.player.y;
              soundEngine.playTelegraph();
            }
          } else if (e.state === 'telegraphing') {
            e.stateTimer -= dt;
            e.telegraphProgress = 1 - (e.stateTimer / 0.65);
            e.vx *= 0.8;
            e.vy *= 0.8;

            if (e.stateTimer <= 0) {
              e.state = 'attacking';
              e.stateTimer = 0.6;
              const chargeAngle = Math.atan2(e.chargeTargetY! - e.y, e.chargeTargetX! - e.x);
              e.angle = chargeAngle;
              e.vx = Math.cos(chargeAngle) * (e.speed * 3.2);
              e.vy = Math.sin(chargeAngle) * (e.speed * 3.2);
            }
          } else if (e.state === 'attacking') {
            e.stateTimer -= dt;
            // Leave danger exhaust trail
            this.particles.emitThrust(e.x, e.y, e.angle, '#ef4444');
            if (e.stateTimer <= 0) {
              e.state = 'idle';
              e.telegraphProgress = 0;
              e.attackCooldown = 3.0;
            }
          }
          break;
        }

        case 'titan_boss':
        case 'aegis_sentinel':
        case 'hive_queen':
        case 'omega_primus': {
          e.angle = angleToPlayer;
          e.attackCooldown -= dt;

          const targetDist = e.type === 'omega_primus' ? 320 : 250;
          if (distToPlayer > targetDist) {
            e.vx = Math.cos(angleToPlayer) * e.speed;
            e.vy = Math.sin(angleToPlayer) * e.speed;
          } else {
            e.vx *= 0.9;
            e.vy *= 0.9;
          }

          if (e.attackCooldown <= 0) {
            e.attackCooldown = e.type === 'omega_primus' ? 1.6 : e.type === 'aegis_sentinel' ? 1.8 : 2.1;
            this.fireBossAttackPattern(e);
          }
          break;
        }
      }

      e.x += e.vx * dt;
      e.y += e.vy * dt;

      // Bounds
      e.x = clamp(e.x, 60, WORLD_BOUNDS.width - 60);
      e.y = clamp(e.y, 60, WORLD_BOUNDS.height - 60);

      // Collision with player
      if (
        !this.player.isDashing &&
        circleIntersectsCircle(e.x, e.y, e.radius, this.player.x, this.player.y, 16)
      ) {
        const contactDamage =
          e.type === 'omega_primus'
            ? 45
            : e.type === 'titan_boss' || e.type === 'aegis_sentinel' || e.type === 'hive_queen'
            ? 35
            : e.type === 'charger'
            ? 30
            : 15;
        this.damagePlayer(contactDamage);
        // Push enemy back slightly
        e.vx = -Math.cos(angleToPlayer) * 120;
        e.vy = -Math.sin(angleToPlayer) * 120;
      }
    }
  }

  private fireBossAttackPattern(boss: Enemy) {
    const isEnraged = boss.hp < boss.maxHp * 0.5;
    soundEngine.playLaser(-0.2);
    const baseAngle = Math.atan2(this.player.y - boss.y, this.player.x - boss.x);

    if (boss.type === 'omega_primus') {
      // Omega Titan Primus: 16-bullet radial storm + 2 high-speed sniper bolts
      const count = isEnraged ? 18 : 14;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + (isEnraged ? boss.angle : 0);
        const bx = boss.x + Math.cos(angle) * (boss.radius * 0.8);
        const by = boss.y + Math.sin(angle) * (boss.radius * 0.8);
        this.particles.emitMuzzleFlash(bx, by, angle, '#ef4444', true);
        this.enemyBullets.push({
          id: this.nextEntityId++,
          x: bx,
          y: by,
          vx: Math.cos(angle) * 310,
          vy: Math.sin(angle) * 310,
          radius: 7,
          damage: 24,
          isPlayer: false,
          color: '#ef4444',
          pierce: 1,
          homing: false,
          life: 4.0,
          maxLife: 4.0,
        });
      }
      // Direct sniper bolt towards player
      this.enemyBullets.push({
        id: this.nextEntityId++,
        x: boss.x + Math.cos(baseAngle) * boss.radius,
        y: boss.y + Math.sin(baseAngle) * boss.radius,
        vx: Math.cos(baseAngle) * 540,
        vy: Math.sin(baseAngle) * 540,
        radius: 6,
        damage: 28,
        isPlayer: false,
        color: '#facc15',
        pierce: 1,
        homing: false,
        life: 2.2,
        maxLife: 2.2,
      });
      if (isEnraged) this.addFloatingText(boss.x, boss.y - 40, 'HİÇLİK GAZI!', '#ef4444');
      return;
    }

    if (boss.type === 'aegis_sentinel') {
      // Aegis Sentinel: 7-bullet wide spread volley
      const spread = 0.16;
      for (let i = -3; i <= 3; i++) {
        const angle = baseAngle + i * spread;
        const bx = boss.x + Math.cos(angle) * (boss.radius * 0.7);
        const by = boss.y + Math.sin(angle) * (boss.radius * 0.7);
        this.particles.emitMuzzleFlash(bx, by, angle, '#6366f1', false);
        this.enemyBullets.push({
          id: this.nextEntityId++,
          x: bx,
          y: by,
          vx: Math.cos(angle) * 340,
          vy: Math.sin(angle) * 340,
          radius: 5.5,
          damage: 20,
          isPlayer: false,
          color: '#6366f1',
          pierce: 1,
          homing: false,
          life: 3.2,
          maxLife: 3.2,
        });
      }
      return;
    }

    if (boss.type === 'hive_queen') {
      // Hive Queen: Cluster venom barrage + minion swarm reinforcement
      for (let i = -2; i <= 2; i++) {
        const angle = baseAngle + (Math.random() - 0.5) * 0.6;
        const bx = boss.x + Math.cos(angle) * (boss.radius * 0.7);
        const by = boss.y + Math.sin(angle) * (boss.radius * 0.7);
        this.particles.emitMuzzleFlash(bx, by, angle, '#ec4899', false);
        this.enemyBullets.push({
          id: this.nextEntityId++,
          x: bx,
          y: by,
          vx: Math.cos(angle) * (260 + Math.random() * 80),
          vy: Math.sin(angle) * (260 + Math.random() * 80),
          radius: 6.5,
          damage: 19,
          isPlayer: false,
          color: '#ec4899',
          pierce: 1,
          homing: false,
          life: 3.5,
          maxLife: 3.5,
        });
      }
      // Spawn extra swarmers if room
      if (this.enemies.length < 8) {
        this.spawnRandomEnemy();
      }
      return;
    }

    // Default Titan Boss
    if (!isEnraged) {
      // 5-bullet arc towards player
      const spread = 0.2;
      for (let i = -2; i <= 2; i++) {
        const angle = baseAngle + i * spread;
        const bx = boss.x + Math.cos(angle) * (boss.radius * 0.7);
        const by = boss.y + Math.sin(angle) * (boss.radius * 0.7);
        this.particles.emitMuzzleFlash(bx, by, angle, '#f43f5e', false);
        this.enemyBullets.push({
          id: this.nextEntityId++,
          x: bx,
          y: by,
          vx: Math.cos(angle) * 320,
          vy: Math.sin(angle) * 320,
          radius: 6,
          damage: 18,
          isPlayer: false,
          color: '#f43f5e',
          pierce: 1,
          homing: false,
          life: 3.5,
          maxLife: 3.5,
        });
      }
    } else {
      // Enraged: 12-bullet radial shockwave ring!
      const count = 12;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const bx = boss.x + Math.cos(angle) * (boss.radius * 0.7);
        const by = boss.y + Math.sin(angle) * (boss.radius * 0.7);
        this.particles.emitMuzzleFlash(bx, by, angle, '#c084fc', true);
        this.enemyBullets.push({
          id: this.nextEntityId++,
          x: bx,
          y: by,
          vx: Math.cos(angle) * 280,
          vy: Math.sin(angle) * 280,
          radius: 7,
          damage: 22,
          isPlayer: false,
          color: '#a855f7',
          pierce: 1,
          homing: false,
          life: 4.0,
          maxLife: 4.0,
        });
      }
      this.addFloatingText(boss.x, boss.y - 40, 'ÖFKE MODU!', '#ef4444');
    }
  }

  private handleEnemyDefeat(e: Enemy) {
    this.stats.kills += 1;
    this.stats.combo += 1;
    this.stats.comboTimer = 2.5; // combo window
    if (this.stats.combo > this.stats.highestCombo) {
      this.stats.highestCombo = this.stats.combo;
      this.dispatchMissionEvent({ type: 'combo_reached', combo: this.stats.combo });
    }

    const earnedScore = Math.round(e.scoreValue * this.stats.combo * this.activeBuffs.scoreMultiplier);
    this.stats.score += earnedScore;
    this.saveHighScore();
    this.dispatchMissionEvent({ type: 'enemy_killed' });

    soundEngine.playExplosion(e.type === 'titan_boss' || e.type === 'charger');
    this.particles.emitEnemyExplosion(e.x, e.y, e.type, e.color);

    // Dynamic screen shake and hitstop scaled by threat
    if (e.type === 'titan_boss') {
      this.trauma = Math.min(1, this.trauma + 0.65);
      this.hitstopTimer = 0.08;
    } else if (e.type === 'charger') {
      this.trauma = Math.min(1, this.trauma + 0.32);
      this.hitstopTimer = 0.03;
    } else if (e.type === 'sniper') {
      this.trauma = Math.min(1, this.trauma + 0.18);
    } else {
      this.trauma = Math.min(1, this.trauma + 0.12);
    }

    // Spawn XP gems and chance for healing drop
    const gemCount = e.type === 'titan_boss' ? 12 : e.type === 'charger' ? 3 : 1;
    for (let i = 0; i < gemCount; i++) {
      this.gems.push({
        id: this.nextEntityId++,
        x: e.x + (Math.random() - 0.5) * 30,
        y: e.y + (Math.random() - 0.5) * 30,
        vx: (Math.random() - 0.5) * 60,
        vy: (Math.random() - 0.5) * 60,
        value: Math.ceil(e.xpValue / gemCount),
        type: 'xp',
        radius: 6,
      });
    }

    // Rare heal or shield drop
    if (Math.random() < 0.12) {
      this.gems.push({
        id: this.nextEntityId++,
        x: e.x,
        y: e.y,
        vx: 0,
        vy: 0,
        value: 25,
        type: Math.random() < 0.5 ? 'heal' : 'shield',
        radius: 8,
      });
    }

    const isBoss =
      e.type === 'titan_boss' ||
      e.type === 'aegis_sentinel' ||
      e.type === 'hive_queen' ||
      e.type === 'omega_primus';

    if (isBoss) {
      this.dispatchMissionEvent({ type: 'boss_defeated' });
      // Massive boss explosion effect
      this.particles.emitEnemyExplosion(e.x, e.y, 'titan_boss', e.color);
      setTimeout(() => {
        this.handleSectorVictory();
      }, 700);
    }
  }

  public handleSectorVictory() {
    const hpPct = this.player.hp / Math.max(1, this.player.maxHp);
    const { updatedList, starsEarned, nextSectorUnlocked } = recordSectorVictory(
      this.currentSector.id,
      this.stats.score,
      this.stats.timeElapsed,
      hpPct,
      this.sectorProgress
    );
    this.sectorProgress = updatedList;

    soundEngine.playVictory();
    soundEngine.setMusicMood('victory');
    this.setStatus('victory');

    if (this.callbacks.onSectorVictory) {
      this.callbacks.onSectorVictory({
        sector: this.currentSector,
        stars: starsEarned,
        score: this.stats.score,
        time: this.stats.timeElapsed,
        nextSectorUnlocked,
      });
    }
  }

  private damagePlayer(amount: number) {
    if (this.player.isDashing || this.player.invulnerabilityTimer > 0) return; // Invincible during dash or i-frames

    this.player.invulnerabilityTimer = 0.65; // 650ms i-frame protection
    const result = applyDamageToPlayer(this.player.hp, this.player.shield, amount);
    this.player.shield = result.remainingShield;
    this.player.hp = result.remainingHp;
    this.player.shieldRechargeTimer = 0; // reset recharge
    this.player.hitFlashTimer = 0.18;

    // Camera shake trauma
    this.trauma = Math.min(1.0, this.trauma + (amount > 20 ? 0.6 : 0.35));
    this.hitstopTimer = 0.05; // 50ms hitstop
    soundEngine.playHit();

    this.particles.emitExplosion(this.player.x, this.player.y, '#ef4444', 10, 0.8);

    if (result.isDead) {
      soundEngine.playDefeat();
      this.particles.emitExplosion(this.player.x, this.player.y, this.currentShipClass.color, 45, 1.6);
      setTimeout(() => {
        this.setStatus('gameover');
      }, 500);
    }
  }

  private updateGems(dt: number) {
    const p = this.player;
    for (let i = this.gems.length - 1; i >= 0; i--) {
      const g = this.gems[i];
      const d = distance(g.x, g.y, p.x, p.y);

      // Magnet attraction
      if (d < p.magnetRadius) {
        const angle = Math.atan2(p.y - g.y, p.x - g.x);
        const magnetSpeed = 480;
        g.vx += Math.cos(angle) * magnetSpeed * dt;
        g.vy += Math.sin(angle) * magnetSpeed * dt;
      }

      g.x += g.vx * dt;
      g.y += g.vy * dt;
      g.vx *= 0.94;
      g.vy *= 0.94;

      // Pickup
      if (d < 22) {
        if (g.type === 'xp') {
          p.xp += g.value;
          soundEngine.playPickup();
          this.checkLevelUp();
        } else if (g.type === 'heal') {
          p.hp = Math.min(p.maxHp, p.hp + g.value);
          this.addFloatingText(p.x, p.y - 20, `+${g.value} HP`, '#22c55e');
          soundEngine.playPickup();
        } else if (g.type === 'shield') {
          p.shield = p.maxShield;
          this.addFloatingText(p.x, p.y - 20, 'KALKAN DOLDU', '#06b6d4');
          soundEngine.playPickup();
        }
        this.dispatchMissionEvent({ type: 'gem_collected' });
        this.gems.splice(i, 1);
      }
    }
  }

  private checkLevelUp() {
    const p = this.player;
    if (p.xp >= p.xpToNextLevel) {
      p.xp -= p.xpToNextLevel;
      p.level += 1;
      p.xpToNextLevel = getXpRequiredForLevel(p.level);

      soundEngine.playLevelUp();
      this.addFloatingText(p.x, p.y - 40, `SEVİYE ${p.level}!`, '#f59e0b');

      // Trigger Roguelite Perk modal (choose 3 random perks)
      this.offerPerks();
    }
  }

  private offerPerks() {
    // Pick 3 random distinct perks
    const shuffled = [...ALL_PERKS].sort(() => 0.5 - Math.random());
    const choices = shuffled.slice(0, 3);
    this.setStatus('perk_selection');
    this.callbacks.onPerkSelectionRequired(choices);
  }

  private updateFloatingTexts(dt: number) {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= dt;
      ft.y += ft.vy * dt;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  public addFloatingText(x: number, y: number, text: string, color: string) {
    this.floatingTexts.push({
      id: this.nextEntityId++,
      x,
      y,
      text,
      color,
      life: 0.8,
      maxLife: 0.8,
      vy: -35,
    });
  }

  private updateWaveSpawning(dt: number) {
    this.spawnCooldown -= dt;

    const isFinalWave = this.currentWave === this.maxWaves;
    const hasBoss = this.currentSector.bossArchetype && this.currentSector.bossArchetype !== 'none';

    if (isFinalWave && hasBoss && !this.bossSpawned) {
      this.bossSpawned = true;
      soundEngine.playBossAlarm();
      soundEngine.setMusicMood('boss');
      this.spawnSectorBoss();
      return;
    }

    if (this.waveSpawnRemaining > 0 && this.spawnCooldown <= 0) {
      this.spawnCooldown = Math.max(0.5, (2.0 - this.currentWave * 0.2) / this.currentSector.spawnRateMultiplier);
      this.waveSpawnRemaining -= 1;
      this.spawnRandomEnemy();
    }

    // Check if wave is completed
    if (this.waveSpawnRemaining <= 0 && this.enemies.length === 0) {
      if (this.currentWave < this.maxWaves) {
        this.currentWave += 1;
        this.stats.waveReached = this.currentWave;
        this.waveSpawnRemaining = Math.round((10 + this.currentWave * 4) * this.currentSector.spawnRateMultiplier);
        soundEngine.playLevelUp();
        this.callbacks.onWaveStart(this.currentWave);
        this.addFloatingText(this.player.x, this.player.y - 50, `DALGA ${this.currentWave} / ${this.maxWaves}`, '#38bdf8');
      } else if (!hasBoss) {
        // Sector completed (non-boss sector)
        this.handleSectorVictory();
      }
    }
  }

  private spawnSectorBoss() {
    const s = this.currentSector;
    const hpMult = s.enemyHpMultiplier;
    let bossType: EnemyType = 'titan_boss';
    let bossHp = 750;
    let bossRadius = 42;
    let bossColor = '#f43f5e';
    let alertText = 'UYARI: TİTAN VOİD MUHAFIZI!';

    if (s.bossArchetype === 'aegis_sentinel') {
      bossType = 'aegis_sentinel';
      bossHp = 650;
      bossRadius = 40;
      bossColor = '#6366f1';
      alertText = 'UYARI: AEGIS MUHAFIZ DRETNOTU!';
    } else if (s.bossArchetype === 'hive_queen') {
      bossType = 'hive_queen';
      bossHp = 850;
      bossRadius = 44;
      bossColor = '#ec4899';
      alertText = 'UYARI: BİYOLOJİK KOVAN KRALİÇESİ!';
    } else if (s.bossArchetype === 'omega_primus') {
      bossType = 'omega_primus';
      bossHp = 1400;
      bossRadius = 50;
      bossColor = '#ef4444';
      alertText = 'KRİTİK TEHDİT: OMEGA TİTAN PRİMUS!';
    }

    bossHp = Math.round(bossHp * hpMult);
    this.addFloatingText(this.player.x, this.player.y - 60, alertText, bossColor);

    this.enemies.push({
      id: this.nextEntityId++,
      type: bossType,
      x: this.player.x + 350,
      y: this.player.y - 200,
      vx: 0,
      vy: 0,
      radius: bossRadius,
      hp: bossHp,
      maxHp: bossHp,
      speed: Math.round(95 * s.enemySpeedMultiplier),
      scoreValue: 6000,
      xpValue: 240,
      color: bossColor,
      angle: 0,
      telegraphProgress: 0,
      state: 'idle',
      stateTimer: 0,
      attackCooldown: 1.5,
      hitFlashTimer: 0,
    });
  }

  private spawnRandomEnemy() {
    // Spawn outside camera viewport
    const angle = Math.random() * Math.PI * 2;
    const distance = 800;
    const spawnX = clamp(this.player.x + Math.cos(angle) * distance, 100, WORLD_BOUNDS.width - 100);
    const spawnY = clamp(this.player.y + Math.sin(angle) * distance, 100, WORLD_BOUNDS.height - 100);

    const hpMult = this.currentSector.enemyHpMultiplier;
    const speedMult = this.currentSector.enemySpeedMultiplier;
    const roll = Math.random();

    let type: Enemy = {
      id: this.nextEntityId++,
      type: 'swarmer',
      x: spawnX,
      y: spawnY,
      vx: 0,
      vy: 0,
      radius: 14,
      hp: Math.round((35 + this.currentWave * 6) * hpMult),
      maxHp: Math.round((35 + this.currentWave * 6) * hpMult),
      speed: Math.round((160 + this.currentWave * 8) * speedMult),
      scoreValue: 120,
      xpValue: 14,
      color: '#f97316', // Orange
      angle: 0,
      telegraphProgress: 0,
      state: 'idle',
      stateTimer: 0,
      attackCooldown: 0,
      hitFlashTimer: 0,
    };

    if (this.currentWave >= 2 && roll > 0.65) {
      // Sniper
      type = {
        ...type,
        type: 'sniper',
        radius: 17,
        hp: Math.round((45 + this.currentWave * 7) * hpMult),
        maxHp: Math.round((45 + this.currentWave * 7) * hpMult),
        speed: Math.round(130 * speedMult),
        scoreValue: 220,
        xpValue: 22,
        color: '#a855f7', // Purple
        attackCooldown: 1.0,
      };
    } else if (this.currentWave >= 3 && roll > 0.45) {
      // Charger
      type = {
        ...type,
        type: 'charger',
        radius: 22,
        hp: Math.round((95 + this.currentWave * 15) * hpMult),
        maxHp: Math.round((95 + this.currentWave * 15) * hpMult),
        speed: Math.round(110 * speedMult),
        scoreValue: 350,
        xpValue: 35,
        color: '#ef4444', // Red
        attackCooldown: 1.2,
      };
    }

    this.enemies.push(type);
  }

  // Canvas Rendering
  public render() {
    const { width, height } = this.canvas;
    const ctx = this.ctx;

    // Clear frame
    ctx.clearRect(0, 0, width, height);

    // Screen Shake Offset
    let shakeX = 0;
    let shakeY = 0;
    if (this.trauma > 0) {
      const shakeMagnitude = this.trauma * this.trauma * 16;
      shakeX = (Math.random() - 0.5) * shakeMagnitude;
      shakeY = (Math.random() - 0.5) * shakeMagnitude;
    }

    const camX = this.player.x - width / 2 + shakeX;
    const camY = this.player.y - height / 2 + shakeY;

    // 1. Draw Space Background, Nebulae & Starfield
    this.renderStarfield(ctx, camX, camY, width, height);

    // 2. Draw Distant Celestial Spiral Galaxies
    for (const g of this.galaxies) {
      drawGalaxy(ctx, g, camX, camY, width, height);
    }

    // 3. Draw Celestial Planets with 3D spherical shading, rings and orbit markers
    for (const p of this.planets) {
      drawPlanet(ctx, p, camX, camY, this.player.x, this.player.y);
    }

    // 4. Draw Arena Boundaries
    this.renderArenaBounds(ctx, camX, camY);

    // 5. Draw Gems & Drops
    this.renderGems(ctx, camX, camY);

    // 6. Draw Particles
    this.particles.draw(ctx, camX, camY);

    // 7. Draw Enemy Telegraph Lines & Circles
    this.renderTelegraphs(ctx, camX, camY);

    // 8. Draw Enemies
    this.renderEnemies(ctx, camX, camY);

    // 9. Draw Bullets
    this.renderBullets(ctx, camX, camY);

    // 10. Draw Player Ship
    this.renderPlayer(ctx, camX, camY);

    // 11. Draw Floating Text Popups
    this.renderFloatingTexts(ctx, camX, camY);

    // 12. Draw Tactical Radar Minimap
    this.renderRadar(ctx, width, height);
  }

  private renderStarfield(
    ctx: CanvasRenderingContext2D,
    camX: number,
    camY: number,
    w: number,
    h: number
  ) {
    // Deep space gradient
    const grad = ctx.createRadialGradient(w / 2, h / 2, 80, w / 2, h / 2, w * 0.7);
    grad.addColorStop(0, '#090e24');
    grad.addColorStop(1, '#020308');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Cosmic Nebulae Dust Clouds with translucent cosmic colors
    const nebulae = [
      { x: w * 0.2 - camX * 0.05, y: h * 0.25 - camY * 0.05, r: 280, color: 'rgba(168, 85, 247, 0.12)' }, // Purple
      { x: w * 0.75 - camX * 0.06, y: h * 0.7 - camY * 0.06, r: 320, color: 'rgba(6, 182, 212, 0.10)' }, // Cyan
      { x: w * 0.45 - camX * 0.04, y: h * 0.85 - camY * 0.04, r: 240, color: 'rgba(236, 72, 153, 0.08)' }, // Magenta
    ];
    for (const n of nebulae) {
      const nGrad = ctx.createRadialGradient(n.x, n.y, 10, n.x, n.y, n.r);
      nGrad.addColorStop(0, n.color);
      nGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nGrad;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Stars with multi-layer depth
    ctx.save();
    for (const star of this.stars) {
      const screenX = ((star.x - camX * star.speed) % w + w) % w;
      const screenY = ((star.y - camY * star.speed) % h + h) % h;
      ctx.globalAlpha = star.alpha;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(screenX, screenY, star.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private renderRadar(ctx: CanvasRenderingContext2D, screenW: number, screenH: number) {
    const radarSize = 130;
    const padding = 16;
    const rx = padding;
    const ry = screenH - radarSize - padding;

    ctx.save();
    // Radar backdrop
    ctx.fillStyle = 'rgba(5, 8, 20, 0.8)';
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.fillRect(rx, ry, radarSize, radarSize);
    ctx.strokeRect(rx, ry, radarSize, radarSize);

    // Crosshairs
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.moveTo(rx + radarSize / 2, ry);
    ctx.lineTo(rx + radarSize / 2, ry + radarSize);
    ctx.moveTo(rx, ry + radarSize / 2);
    ctx.lineTo(rx + radarSize, ry + radarSize / 2);
    ctx.stroke();

    const scale = radarSize / WORLD_BOUNDS.width;

    // Draw Planets on radar
    for (const p of this.planets) {
      const px = rx + p.worldX * scale;
      const py = ry + p.worldY * scale;
      ctx.fillStyle = p.scanned ? '#4ade80' : p.colorBase;
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw Enemies on radar
    for (const e of this.enemies) {
      const ex = rx + e.x * scale;
      const ey = ry + e.y * scale;
      ctx.fillStyle = e.type === 'titan_boss' ? '#f43f5e' : '#f97316';
      ctx.beginPath();
      ctx.arc(ex, ey, e.type === 'titan_boss' ? 4 : 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw Player dot (pulsing cyan)
    const plx = rx + this.player.x * scale;
    const ply = ry + this.player.y * scale;
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(plx, ply, 3, 0, Math.PI * 2);
    ctx.fill();

    // Radar title
    ctx.font = '700 9px "Orbitron", sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'left';
    ctx.fillText('SEKTÖR RADARI', rx + 6, ry + 12);

    ctx.restore();
  }

  private renderArenaBounds(ctx: CanvasRenderingContext2D, camX: number, camY: number) {
    ctx.save();
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
    ctx.lineWidth = 3;
    ctx.setLineDash([12, 8]);
    ctx.strokeRect(-camX, -camY, WORLD_BOUNDS.width, WORLD_BOUNDS.height);

    // Grid lines for spatial sense with sector ambient theme
    ctx.strokeStyle = this.currentSector.gridColor || 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([]);
    const gridSize = 160;
    const startX = Math.floor(camX / gridSize) * gridSize - camX;
    const startY = Math.floor(camY / gridSize) * gridSize - camY;

    for (let x = startX; x < this.canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.canvas.height);
      ctx.stroke();
    }
    for (let y = startY; y < this.canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.canvas.width, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  private renderTelegraphs(ctx: CanvasRenderingContext2D, camX: number, camY: number) {
    ctx.save();
    for (const e of this.enemies) {
      const sx = e.x - camX;
      const sy = e.y - camY;

      if (
        e.type === 'sniper' &&
        e.state === 'telegraphing' &&
        e.aimX !== undefined &&
        e.aimY !== undefined
      ) {
        // Red / purple laser line targeting player
        const aimScreenX = e.aimX - camX;
        const aimScreenY = e.aimY - camY;
        ctx.strokeStyle = `rgba(168, 85, 247, ${0.4 + e.telegraphProgress * 0.6})`;
        ctx.lineWidth = 1 + e.telegraphProgress * 2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(aimScreenX, aimScreenY);
        ctx.stroke();
      } else if (
        e.type === 'charger' &&
        e.state === 'telegraphing' &&
        e.chargeTargetX !== undefined &&
        e.chargeTargetY !== undefined
      ) {
        // Red warning charge path
        const chargeAngle = Math.atan2(e.chargeTargetY - e.y, e.chargeTargetX - e.x);
        const lineLen = 350;
        ctx.strokeStyle = `rgba(239, 68, 68, ${0.3 + e.telegraphProgress * 0.7})`;
        ctx.lineWidth = 2 + e.telegraphProgress * 3;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + Math.cos(chargeAngle) * lineLen, sy + Math.sin(chargeAngle) * lineLen);
        ctx.stroke();
      } else if (e.type === 'swarmer' && e.state === 'telegraphing') {
        // Pulsing warning ring around swarmer
        ctx.strokeStyle = `rgba(249, 115, 22, ${e.telegraphProgress})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(sx, sy, e.radius * (1 + e.telegraphProgress * 0.8), 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  private renderEnemies(ctx: CanvasRenderingContext2D, camX: number, camY: number) {
    ctx.save();
    for (const e of this.enemies) {
      const sx = e.x - camX;
      const sy = e.y - camY;

      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(e.angle);

      // Hit flash
      const isHit = e.hitFlashTimer > 0;
      ctx.fillStyle = isHit ? '#ffffff' : e.color;

      if (e.type === 'swarmer') {
        // Sleek dart triangle
        ctx.beginPath();
        ctx.moveTo(14, 0);
        ctx.lineTo(-12, -9);
        ctx.lineTo(-6, 0);
        ctx.lineTo(-12, 9);
        ctx.closePath();
        ctx.fill();
      } else if (e.type === 'sniper') {
        // Diamond sniper craft
        ctx.beginPath();
        ctx.moveTo(16, 0);
        ctx.lineTo(0, -12);
        ctx.lineTo(-14, 0);
        ctx.lineTo(0, 12);
        ctx.closePath();
        ctx.fill();
      } else if (e.type === 'charger') {
        // Heavy armored hexagon
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          const px = Math.cos(a) * 20;
          const py = Math.sin(a) * 20;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (e.type === 'aegis_sentinel') {
        // Aegis Sentinel: Heavy Bastion Shield Diamond with revolving barrier plates
        ctx.beginPath();
        ctx.moveTo(38, 0);
        ctx.lineTo(0, -28);
        ctx.lineTo(-32, 0);
        ctx.lineTo(0, 28);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#818cf8';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Glowing aegis core
        ctx.fillStyle = '#c7d2fe';
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
      } else if (e.type === 'hive_queen') {
        // Hive Queen: Multi-segment organic carapace
        ctx.beginPath();
        ctx.ellipse(0, 0, 36, 24, 0, 0, Math.PI * 2);
        ctx.fill();

        // Mandibles
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.moveTo(32, -10);
        ctx.lineTo(48, -4);
        ctx.lineTo(32, 0);
        ctx.moveTo(32, 0);
        ctx.lineTo(48, 4);
        ctx.lineTo(32, 10);
        ctx.fill();

        // Venom glow core
        ctx.fillStyle = '#f472b6';
        ctx.beginPath();
        ctx.arc(-8, 0, 11, 0, Math.PI * 2);
        ctx.fill();
      } else if (e.type === 'omega_primus') {
        // Omega Titan Primus: 16-point colossal warship dreadnought
        ctx.beginPath();
        for (let i = 0; i < 16; i++) {
          const a = (i / 16) * Math.PI * 2;
          const r = i % 2 === 0 ? 50 : 36;
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#fca5a5';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Pulsing dark matter singularity center
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (e.type === 'titan_boss') {
        // Titan Boss: Concentric spiked armored core
        ctx.beginPath();
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2;
          const r = i % 2 === 0 ? 42 : 32;
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        // Pulsing core eye
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // Enemy Health Bar (if damaged)
      if (e.hp < e.maxHp) {
        const isBoss =
          e.type === 'titan_boss' ||
          e.type === 'aegis_sentinel' ||
          e.type === 'hive_queen' ||
          e.type === 'omega_primus';
        const barWidth = isBoss ? e.radius * 2.8 : e.radius * 2.2;
        const barHeight = isBoss ? 6 : 4;
        const barX = sx - barWidth / 2;
        const barY = sy - e.radius - (isBoss ? 16 : 12);

        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        const healthPct = clamp(e.hp / e.maxHp, 0, 1);
        ctx.fillStyle = isBoss ? e.color : '#eab308';
        ctx.fillRect(barX, barY, barWidth * healthPct, barHeight);
      }
    }
    ctx.restore();
  }

  private renderBullets(ctx: CanvasRenderingContext2D, camX: number, camY: number) {
    ctx.save();
    for (const b of this.playerBullets) {
      const sx = b.x - camX;
      const sy = b.y - camY;
      ctx.fillStyle = b.color;
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(sx, sy, b.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    for (const b of this.enemyBullets) {
      const sx = b.x - camX;
      const sy = b.y - camY;
      ctx.fillStyle = b.color;
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(sx, sy, b.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private renderPlayer(ctx: CanvasRenderingContext2D, camX: number, camY: number) {
    const p = this.player;
    const sx = p.x - camX;
    const sy = p.y - camY;

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(p.angle);

    // Hit flash
    const isHit = p.hitFlashTimer > 0;
    const shipColor = isHit ? '#ffffff' : this.currentShipClass.color;

    // Draw Ship Hull
    ctx.fillStyle = shipColor;
    ctx.shadowColor = shipColor;
    ctx.shadowBlur = p.isDashing ? 18 : 8;

    ctx.beginPath();
    ctx.moveTo(18, 0); // Tip
    ctx.lineTo(-14, -12); // Left wing
    ctx.lineTo(-8, 0); // Back indent
    ctx.lineTo(-14, 12); // Right wing
    ctx.closePath();
    ctx.fill();

    // Cockpit
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(2, 0, 6, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Shield Aura
    if (p.shield > 0) {
      ctx.strokeStyle = `rgba(6, 182, 212, ${0.25 + (p.shield / p.maxShield) * 0.45})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  private renderGems(ctx: CanvasRenderingContext2D, camX: number, camY: number) {
    ctx.save();
    for (const g of this.gems) {
      const sx = g.x - camX;
      const sy = g.y - camY;
      const color = g.type === 'xp' ? '#06b6d4' : g.type === 'heal' ? '#22c55e' : '#f59e0b';

      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(sx, sy, g.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private renderFloatingTexts(ctx: CanvasRenderingContext2D, camX: number, camY: number) {
    ctx.save();
    ctx.font = '700 14px "Orbitron", sans-serif';
    ctx.textAlign = 'center';

    for (const ft of this.floatingTexts) {
      const alpha = ft.life / ft.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = ft.color;
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.fillText(ft.text, ft.x - camX, ft.y - camY);
    }
    ctx.restore();
  }
}
