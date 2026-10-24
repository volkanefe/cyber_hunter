import { MAX_PARTICLES } from './constants';
import { EnemyType, Particle, ParticleType } from './types';

export interface EmitParticleOptions {
  type?: ParticleType;
  drag?: number;
  endSize?: number;
  endColor?: string;
  angle?: number;
  angularVelocity?: number;
  shape?: 'circle' | 'debris' | 'ring' | 'line';
  blendMode?: 'source-over' | 'lighter';
}

export class ParticlePool {
  private particles: Particle[];
  private nextIndex: number = 0;

  constructor() {
    this.particles = new Array(MAX_PARTICLES);
    for (let i = 0; i < MAX_PARTICLES; i++) {
      this.particles[i] = {
        active: false,
        type: 'spark',
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: 1,
        size: 2,
        endSize: 0,
        color: '#ffffff',
        alpha: 1,
        drag: 0.88,
        angle: 0,
        angularVelocity: 0,
        shape: 'circle',
        blendMode: 'lighter',
      };
    }
  }

  public emit(
    x: number,
    y: number,
    vx: number,
    vy: number,
    maxLife: number,
    size: number,
    color: string,
    options?: EmitParticleOptions
  ) {
    const p = this.particles[this.nextIndex];
    this.nextIndex = (this.nextIndex + 1) % MAX_PARTICLES;

    p.active = true;
    p.type = options?.type ?? 'spark';
    p.x = x;
    p.y = y;
    p.vx = vx;
    p.vy = vy;
    p.life = maxLife;
    p.maxLife = maxLife;
    p.size = size;
    p.endSize = options?.endSize ?? (options?.type === 'smoke' ? size * 2.8 : 0);
    p.color = color;
    p.endColor = options?.endColor;
    p.alpha = 1;
    p.drag = options?.drag ?? 0.88;
    p.angle = options?.angle ?? Math.random() * Math.PI * 2;
    p.angularVelocity = options?.angularVelocity ?? (Math.random() - 0.5) * 6;
    p.shape = options?.shape ?? 'circle';
    p.blendMode = options?.blendMode ?? (options?.type === 'debris' || options?.type === 'smoke' ? 'source-over' : 'lighter');
  }

  /**
   * Weapon Fire Muzzle Flash:
   * Generates a high-intensity directional burst with a central flash halo,
   * high-velocity kinetic sparks aligned with the barrel, and a micro smoke puff.
   */
  public emitMuzzleFlash(x: number, y: number, angle: number, color: string, isHeavy: boolean = false) {
    // 1. Central high-intensity flash halo (pure white core transitioning out)
    const flashSize = isHeavy ? 14 : 9;
    this.emit(x, y, 0, 0, 0.08, flashSize, '#ffffff', {
      type: 'muzzle_flash',
      shape: 'circle',
      blendMode: 'lighter',
      endSize: flashSize * 1.5,
    });

    this.emit(x, y, Math.cos(angle) * 40, Math.sin(angle) * 40, 0.12, flashSize * 0.9, color, {
      type: 'muzzle_flash',
      shape: 'circle',
      blendMode: 'lighter',
      endSize: 0,
    });

    // 2. Directional forward spark cone
    const sparkCount = isHeavy ? 10 : 6;
    const baseSpeed = isHeavy ? 320 : 260;
    const coneAngle = 0.45; // ~26 degrees cone

    for (let i = 0; i < sparkCount; i++) {
      const spread = (Math.random() - 0.5) * coneAngle;
      const sAngle = angle + spread;
      const speed = baseSpeed * (0.6 + Math.random() * 0.7);
      const vx = Math.cos(sAngle) * speed;
      const vy = Math.sin(sAngle) * speed;
      const life = 0.08 + Math.random() * 0.08;
      const size = 1.5 + Math.random() * (isHeavy ? 2.5 : 1.5);

      this.emit(x, y, vx, vy, life, size, Math.random() < 0.4 ? '#ffffff' : color, {
        type: 'muzzle_flash',
        shape: 'line',
        drag: 0.75,
        blendMode: 'lighter',
      });
    }

    // 3. Subtle expanding dissipation gas
    const puffVx = Math.cos(angle) * 45 + (Math.random() - 0.5) * 20;
    const puffVy = Math.sin(angle) * 45 + (Math.random() - 0.5) * 20;
    this.emit(x, y, puffVx, puffVy, 0.22, 4, 'rgba(255, 255, 255, 0.3)', {
      type: 'smoke',
      shape: 'circle',
      drag: 0.85,
      endSize: 12,
      blendMode: 'source-over',
    });
  }

  /**
   * Projectile Exhaust Trail:
   * Emitted behind moving bullets/missiles for fluid combat dynamics.
   */
  public emitProjectileTrail(
    x: number,
    y: number,
    vx: number,
    vy: number,
    color: string,
    options?: { size?: number; isHoming?: boolean }
  ) {
    const isHoming = options?.isHoming ?? false;
    const size = options?.size ?? (isHoming ? 3.5 : 2.0);

    // Wake particle with slight negative drift opposite to projectile velocity
    const wakeVx = -vx * 0.08 + (Math.random() - 0.5) * 20;
    const wakeVy = -vy * 0.08 + (Math.random() - 0.5) * 20;
    const life = isHoming ? 0.28 : 0.16;

    this.emit(x, y, wakeVx, wakeVy, life, size, color, {
      type: 'plasma_trail',
      shape: 'circle',
      drag: 0.85,
      endSize: 0.5,
      blendMode: 'lighter',
    });

    if (isHoming && Math.random() < 0.5) {
      // Fiery micro-ember for homing missiles
      this.emit(x, y, wakeVx * 1.5, wakeVy * 1.5, 0.24, 1.8, '#f59e0b', {
        type: 'ember',
        shape: 'circle',
        drag: 0.8,
        blendMode: 'lighter',
      });
    }
  }

  /**
   * Expanding Shockwave Ring:
   * Kinetic shockwave that expands rapidly while fading.
   */
  public emitShockwave(
    x: number,
    y: number,
    color: string,
    startRadius: number,
    endRadius: number,
    maxLife: number = 0.35
  ) {
    this.emit(x, y, 0, 0, maxLife, startRadius, color, {
      type: 'shockwave',
      shape: 'ring',
      endSize: endRadius,
      blendMode: 'lighter',
      drag: 1,
    });
  }

  /**
   * Hull Shrapnel Debris:
   * Polygonal rotating fragments of ship armor spinning away from blast epicenter.
   */
  public emitDebris(x: number, y: number, color: string, count: number, speedMult: number = 1) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 160 + 60) * speedMult;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const life = 0.4 + Math.random() * 0.4;
      const size = 3 + Math.random() * 4;

      this.emit(x, y, vx, vy, life, size, color, {
        type: 'debris',
        shape: 'debris',
        angle: Math.random() * Math.PI * 2,
        angularVelocity: (Math.random() - 0.5) * 14,
        drag: 0.92,
        blendMode: 'source-over',
      });
    }
  }

  /**
   * Multi-Layered Enemy Destruction:
   * Tailored visual signatures for each enemy archetype.
   */
  public emitEnemyExplosion(x: number, y: number, enemyType: EnemyType, baseColor: string) {
    switch (enemyType) {
      case 'swarmer': {
        // Fast kinetic dispersal: single shockwave, high-speed amber/orange sparks, small metal shards
        this.emitShockwave(x, y, baseColor, 6, 45, 0.28);
        this.emitHitSparks(x, y, '#ffffff', 6);
        this.emitExplosion(x, y, baseColor, 16, 1.1);
        this.emitDebris(x, y, '#fdba74', 5, 1.2);
        this.emitSmoke(x, y, 3, 22);
        break;
      }

      case 'sniper': {
        // Crystalline fracture: violet shockwave, high-velocity needle sparks, sharp debris
        this.emitShockwave(x, y, '#c084fc', 8, 65, 0.35);
        this.emitHitSparks(x, y, '#f3e8ff', 10);
        this.emitExplosion(x, y, '#a855f7', 22, 1.3);
        this.emitDebris(x, y, '#9333ea', 7, 1.4);
        this.emitSmoke(x, y, 4, 30);
        break;
      }

      case 'charger': {
        // Heavy demolition blast: dual shockwaves, intense fiery sparks, heavy tumbling hull chunks
        this.emitShockwave(x, y, '#fca5a5', 10, 85, 0.4);
        this.emitShockwave(x, y, '#ef4444', 4, 55, 0.25);
        this.emitHitSparks(x, y, '#ffffff', 14);
        this.emitExplosion(x, y, '#ef4444', 36, 1.6);
        this.emitDebris(x, y, '#b91c1c', 12, 1.7);
        this.emitEmbers(x, y, '#f59e0b', 10);
        this.emitSmoke(x, y, 8, 45);
        break;
      }

      case 'titan_boss': {
        // Catastrophic Supernova: triple cascading shockwaves, dense neon sparks, spinning heavy plates
        this.emitShockwave(x, y, '#ffffff', 12, 140, 0.6);
        this.emitShockwave(x, y, '#f43f5e', 8, 100, 0.45);
        this.emitShockwave(x, y, '#a855f7', 4, 70, 0.3);
        this.emitHitSparks(x, y, '#ffffff', 25);
        this.emitExplosion(x, y, '#f43f5e', 45, 2.0);
        this.emitExplosion(x, y, '#fbbf24', 30, 1.5);
        this.emitDebris(x, y, '#e11d48', 18, 2.1);
        this.emitEmbers(x, y, '#fbbf24', 22);
        this.emitSmoke(x, y, 14, 60);

        // Radial offset sub-detonations
        for (let i = 0; i < 4; i++) {
          const offAngle = (i / 4) * Math.PI * 2;
          const offDist = 24 + Math.random() * 18;
          const ox = x + Math.cos(offAngle) * offDist;
          const oy = y + Math.sin(offAngle) * offDist;
          this.emitExplosion(ox, oy, '#f43f5e', 12, 1.3);
        }
        break;
      }
    }
  }

  /**
   * Burning Embers that linger and drift with slight atmospheric friction.
   */
  public emitEmbers(x: number, y: number, color: string, count: number = 8) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 120 + 30;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const life = 0.45 + Math.random() * 0.45;
      const size = 1.8 + Math.random() * 2.0;

      this.emit(x, y, vx, vy, life, size, color, {
        type: 'ember',
        shape: 'circle',
        drag: 0.88,
        blendMode: 'lighter',
      });
    }
  }

  /**
   * Smoke / Gas Dissipation Puffs.
   */
  public emitSmoke(x: number, y: number, count: number = 4, maxRadius: number = 32) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 50 + 15;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const life = 0.4 + Math.random() * 0.35;
      const startSize = 6 + Math.random() * 6;

      this.emit(x, y, vx, vy, life, startSize, 'rgba(148, 163, 184, 0.45)', {
        type: 'smoke',
        shape: 'circle',
        drag: 0.82,
        endSize: maxRadius,
        blendMode: 'source-over',
      });
    }
  }

  public emitExplosion(x: number, y: number, color: string, count: number = 18, speedMult: number = 1) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 160 + 60) * speedMult;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const life = Math.random() * 0.35 + 0.2;
      const size = Math.random() * 3 + 1.5;

      this.emit(x, y, vx, vy, life, size, color, {
        type: 'spark',
        drag: 0.86,
        blendMode: 'lighter',
      });
    }
  }

  public emitThrust(x: number, y: number, angle: number, color: string) {
    const spread = (Math.random() - 0.5) * 0.5;
    const thrustAngle = angle + Math.PI + spread;
    const speed = Math.random() * 110 + 80;
    const vx = Math.cos(thrustAngle) * speed;
    const vy = Math.sin(thrustAngle) * speed;
    const life = Math.random() * 0.18 + 0.08;
    const size = Math.random() * 3.5 + 2;

    this.emit(x, y, vx, vy, life, size, color, {
      type: 'plasma_trail',
      shape: 'circle',
      drag: 0.84,
      blendMode: 'lighter',
    });
  }

  public emitHitSparks(x: number, y: number, color: string, count: number = 6) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 220 + 90;
      this.emit(
        x,
        y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        Math.random() * 0.2 + 0.08,
        Math.random() * 2.2 + 1.2,
        color,
        {
          type: 'spark',
          shape: 'line',
          drag: 0.78,
          blendMode: 'lighter',
        }
      );
    }
  }

  public update(dt: number) {
    const dt60 = dt * 60;
    for (let i = 0; i < MAX_PARTICLES; i++) {
      const p = this.particles[i];
      if (!p.active) continue;

      p.life -= dt;
      if (p.life <= 0) {
        p.active = false;
        continue;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Friction / drag
      const dragFactor = Math.pow(p.drag, dt60);
      p.vx *= dragFactor;
      p.vy *= dragFactor;

      // Angular rotation
      p.angle += p.angularVelocity * dt;

      // Normalized progress: 0 (newborn) to 1 (expired)
      const progress = 1 - p.life / p.maxLife;

      // Alpha fade out
      if (p.type === 'shockwave') {
        // Shockwaves stay bold at start then fade quickly as they hit max radius
        p.alpha = Math.pow(1 - progress, 1.4);
      } else if (p.type === 'muzzle_flash') {
        p.alpha = Math.max(0, 1 - progress * 1.2);
      } else {
        p.alpha = Math.max(0, 1 - progress);
      }
    }
  }

  public draw(ctx: CanvasRenderingContext2D, camX: number, camY: number) {
    ctx.save();

    // Pass 1: standard blending (opaque smoke and metallic debris)
    ctx.globalCompositeOperation = 'source-over';
    for (let i = 0; i < MAX_PARTICLES; i++) {
      const p = this.particles[i];
      if (!p.active || p.blendMode !== 'source-over') continue;

      const screenX = p.x - camX;
      const screenY = p.y - camY;
      const progress = 1 - p.life / p.maxLife;
      const currentSize = p.endSize !== undefined
        ? p.size + (p.endSize - p.size) * progress
        : p.size;

      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      if (p.shape === 'debris') {
        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.rotate(p.angle);
        ctx.fillRect(-currentSize / 2, -currentSize / 4, currentSize, currentSize / 2);
        ctx.restore();
      } else {
        // Smoke circle puff
        ctx.beginPath();
        ctx.arc(screenX, screenY, Math.max(0.5, currentSize), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Pass 2: Additive blending ('lighter') for high-luminosity plasma, sparks, shockwaves, muzzle flashes
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < MAX_PARTICLES; i++) {
      const p = this.particles[i];
      if (!p.active || p.blendMode === 'source-over') continue;

      const screenX = p.x - camX;
      const screenY = p.y - camY;
      const progress = 1 - p.life / p.maxLife;
      const currentSize = p.endSize !== undefined
        ? p.size + (p.endSize - p.size) * progress
        : p.size;

      ctx.globalAlpha = p.alpha;

      if (p.shape === 'ring') {
        // Shockwave ring
        ctx.strokeStyle = p.color;
        ctx.lineWidth = Math.max(1, (1 - progress) * 4);
        ctx.beginPath();
        ctx.arc(screenX, screenY, Math.max(0.1, currentSize), 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.shape === 'line') {
        // Elongated spark needle oriented along velocity vector
        const speed = Math.hypot(p.vx, p.vy);
        const lineLen = Math.min(18, Math.max(4, speed * 0.04));
        const heading = Math.atan2(p.vy, p.vx);

        ctx.strokeStyle = p.color;
        ctx.lineWidth = Math.max(1, currentSize);
        ctx.beginPath();
        ctx.moveTo(screenX, screenY);
        ctx.lineTo(
          screenX - Math.cos(heading) * lineLen,
          screenY - Math.sin(heading) * lineLen
        );
        ctx.stroke();
      } else {
        // Glowing circle (sparks, muzzle flash halo, plasma trail, embers)
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(screenX, screenY, Math.max(0.5, currentSize), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  public getActiveCount(): number {
    let count = 0;
    for (let i = 0; i < MAX_PARTICLES; i++) {
      if (this.particles[i].active) count++;
    }
    return count;
  }

  public getParticles(): readonly Particle[] {
    return this.particles;
  }

  public clear() {
    for (let i = 0; i < MAX_PARTICLES; i++) {
      this.particles[i].active = false;
    }
  }
}
