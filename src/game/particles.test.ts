import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ParticlePool } from './particles';
import { MAX_PARTICLES } from './constants';

describe('Particle System Tests', () => {
  it('initializes with MAX_PARTICLES inactive particles', () => {
    const pool = new ParticlePool();
    assert.equal(pool.getActiveCount(), 0);
    const particles = pool.getParticles();
    assert.equal(particles.length, MAX_PARTICLES);
    for (const p of particles) {
      assert.equal(p.active, false);
    }
  });

  it('emitMuzzleFlash spawns muzzle flash core, directional sparks, and smoke puff', () => {
    const pool = new ParticlePool();
    pool.emitMuzzleFlash(100, 200, 0, '#06b6d4', false);

    const activeCount = pool.getActiveCount();
    // 2 flash halos + 6 directional sparks + 1 dissipation puff = 9
    assert.ok(activeCount >= 8, `Expected at least 8 particles for muzzle flash, got ${activeCount}`);

    const particles = pool.getParticles().filter(p => p.active);
    const flashCore = particles.find(p => p.type === 'muzzle_flash' && p.color === '#ffffff');
    assert.ok(flashCore, 'Expected white muzzle flash core particle');
    assert.equal(flashCore?.blendMode, 'lighter');

    const smoke = particles.find(p => p.type === 'smoke');
    assert.ok(smoke, 'Expected smoke particle');
    assert.equal(smoke?.blendMode, 'source-over');
  });

  it('emitProjectileTrail creates exhaust wake particle behind projectile', () => {
    const pool = new ParticlePool();
    // Bullet moving right at 500 px/s
    pool.emitProjectileTrail(50, 50, 500, 0, '#3b82f6', { isHoming: false });

    assert.equal(pool.getActiveCount(), 1);
    const p = pool.getParticles().find(x => x.active)!;
    assert.equal(p.type, 'plasma_trail');
    // vx should drift backwards opposite to projectile
    assert.ok(p.vx < 0, `Expected negative drift, got vx=${p.vx}`);
  });

  it('emitShockwave creates expanding ring particle', () => {
    const pool = new ParticlePool();
    pool.emitShockwave(200, 300, '#a855f7', 10, 80, 0.4);

    assert.equal(pool.getActiveCount(), 1);
    const p = pool.getParticles().find(x => x.active)!;
    assert.equal(p.type, 'shockwave');
    assert.equal(p.shape, 'ring');
    assert.equal(p.size, 10);
    assert.equal(p.endSize, 80);
    assert.equal(p.maxLife, 0.4);
  });

  it('emitEnemyExplosion scales particle count and shockwaves according to archetype', () => {
    const poolSwarmer = new ParticlePool();
    poolSwarmer.emitEnemyExplosion(0, 0, 'swarmer', '#f97316');
    const swarmerCount = poolSwarmer.getActiveCount();

    const poolCharger = new ParticlePool();
    poolCharger.emitEnemyExplosion(0, 0, 'charger', '#ef4444');
    const chargerCount = poolCharger.getActiveCount();

    const poolTitan = new ParticlePool();
    poolTitan.emitEnemyExplosion(0, 0, 'titan_boss', '#f43f5e');
    const titanCount = poolTitan.getActiveCount();

    assert.ok(swarmerCount > 15, `Swarmer should have >15 particles, got ${swarmerCount}`);
    assert.ok(chargerCount > swarmerCount, `Charger (${chargerCount}) should exceed Swarmer (${swarmerCount})`);
    assert.ok(titanCount > chargerCount, `Titan Boss (${titanCount}) should exceed Charger (${chargerCount})`);

    // Verify Titan Boss has multiple shockwave rings
    const titanShockwaves = poolTitan.getParticles().filter(p => p.active && p.type === 'shockwave');
    assert.ok(titanShockwaves.length >= 3, `Titan boss should have >=3 shockwaves, got ${titanShockwaves.length}`);

    // Verify debris chunks are created
    const debris = poolCharger.getParticles().filter(p => p.active && p.type === 'debris');
    assert.ok(debris.length >= 8, `Charger should spawn hull debris chunks, got ${debris.length}`);
  });

  it('update() decays particle life, applies drag, and deactivates expired particles', () => {
    const pool = new ParticlePool();
    pool.emit(0, 0, 100, 0, 0.1, 5, '#ffffff', { drag: 0.8 });

    assert.equal(pool.getActiveCount(), 1);
    const p = pool.getParticles().find(x => x.active)!;

    // Simulate 0.05s
    pool.update(0.05);
    assert.ok(p.life < 0.1, 'Life should have decreased');
    assert.ok(p.x > 0, 'Position should advance');
    assert.ok(p.vx < 100, 'Velocity should decelerate with drag');
    assert.equal(p.active, true);

    // Simulate another 0.06s (total > 0.1s life)
    pool.update(0.06);
    assert.equal(p.active, false, 'Particle should be deactivated upon life expiration');
    assert.equal(pool.getActiveCount(), 0);
  });

  it('circular pool safely wraps around without exceeding capacity', () => {
    const pool = new ParticlePool();
    // Emit twice MAX_PARTICLES
    for (let i = 0; i < MAX_PARTICLES * 2; i++) {
      pool.emit(i, i, 0, 0, 5, 2, '#ffffff');
    }
    assert.equal(pool.getActiveCount(), MAX_PARTICLES);
  });

  it('clear() deactivates all particles instantly', () => {
    const pool = new ParticlePool();
    pool.emitEnemyExplosion(100, 100, 'titan_boss', '#ffffff');
    assert.ok(pool.getActiveCount() > 0);

    pool.clear();
    assert.equal(pool.getActiveCount(), 0);
  });
});
