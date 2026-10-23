import { MAX_PARTICLES } from './constants';
import { Particle } from './types';

export class ParticlePool {
  private particles: Particle[];
  private nextIndex: number = 0;

  constructor() {
    this.particles = new Array(MAX_PARTICLES);
    for (let i = 0; i < MAX_PARTICLES; i++) {
      this.particles[i] = {
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: 1,
        size: 2,
        color: '#ffffff',
        alpha: 1,
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
    color: string
  ) {
    const p = this.particles[this.nextIndex];
    this.nextIndex = (this.nextIndex + 1) % MAX_PARTICLES;

    p.active = true;
    p.x = x;
    p.y = y;
    p.vx = vx;
    p.vy = vy;
    p.life = maxLife;
    p.maxLife = maxLife;
    p.size = size;
    p.color = color;
    p.alpha = 1;
  }

  public emitExplosion(x: number, y: number, color: string, count: number = 18, speedMult: number = 1) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 160 + 60) * speedMult;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const life = Math.random() * 0.4 + 0.25;
      const size = Math.random() * 3 + 1.5;
      this.emit(x, y, vx, vy, life, size, color);
    }
  }

  public emitThrust(x: number, y: number, angle: number, color: string) {
    // Jet thrust opposite to ship facing
    const spread = (Math.random() - 0.5) * 0.5;
    const thrustAngle = angle + Math.PI + spread;
    const speed = Math.random() * 90 + 70;
    const vx = Math.cos(thrustAngle) * speed;
    const vy = Math.sin(thrustAngle) * speed;
    const life = Math.random() * 0.18 + 0.08;
    const size = Math.random() * 3 + 2;
    this.emit(x, y, vx, vy, life, size, color);
  }

  public emitHitSparks(x: number, y: number, color: string, count: number = 6) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 180 + 80;
      this.emit(
        x,
        y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        Math.random() * 0.2 + 0.1,
        Math.random() * 2 + 1,
        color
      );
    }
  }

  public update(dt: number) {
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
      // Linear drag
      p.vx *= Math.pow(0.85, dt * 60);
      p.vy *= Math.pow(0.85, dt * 60);
      p.alpha = Math.max(0, p.life / p.maxLife);
    }
  }

  public draw(ctx: CanvasRenderingContext2D, camX: number, camY: number) {
    ctx.save();
    for (let i = 0; i < MAX_PARTICLES; i++) {
      const p = this.particles[i];
      if (!p.active) continue;

      const screenX = p.x - camX;
      const screenY = p.y - camY;

      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(screenX, screenY, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  public clear() {
    for (let i = 0; i < MAX_PARTICLES; i++) {
      this.particles[i].active = false;
    }
  }
}
