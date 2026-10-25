import test from 'node:test';
import assert from 'node:assert/strict';
import {
  distance,
  clamp,
  circleIntersectsCircle,
  calculateScore,
  getXpRequiredForLevel,
  applyDamageToPlayer,
  applyPerk,
  checkWaveCompletion,
  getWaveTargetEnemies,
  calculateCombatIntensity,
  preparePlayerForNextSector,
  ACTIVE_DASH_DURATION,
  calculateDashVelocity,
  estimateDashDistance,
} from './rules';
import { PlayerState } from './types';

test('distance calculates Euclidean length correctly', () => {
  assert.equal(distance(0, 0, 3, 4), 5);
  assert.equal(distance(10, 10, 10, 10), 0);
  assert.ok(Math.abs(distance(1, 1, 4, 5) - 5) < 0.001);
});

test('clamp restricts values to min and max', () => {
  assert.equal(clamp(5, 0, 10), 5);
  assert.equal(clamp(-3, 0, 10), 0);
  assert.equal(clamp(15, 0, 10), 10);
});

test('circleIntersectsCircle detects hits and misses accurately', () => {
  // touching or overlapping
  assert.equal(circleIntersectsCircle(0, 0, 10, 15, 0, 10), true); // dist 15 <= 20
  // separated
  assert.equal(circleIntersectsCircle(0, 0, 5, 20, 0, 5), false); // dist 20 > 10
  // concentric
  assert.equal(circleIntersectsCircle(10, 10, 5, 10, 10, 2), true);
});

test('calculateScore scales with combo floor', () => {
  assert.equal(calculateScore(100, 1), 100);
  assert.equal(calculateScore(100, 2.7), 200);
  assert.equal(calculateScore(150, 0.5), 150);
});

test('getXpRequiredForLevel scales strictly positively', () => {
  const lvl1 = getXpRequiredForLevel(1);
  const lvl2 = getXpRequiredForLevel(2);
  const lvl3 = getXpRequiredForLevel(3);
  assert.ok(lvl1 > 0);
  assert.ok(lvl2 > lvl1);
  assert.ok(lvl3 > lvl2);
});

test('applyDamageToPlayer prioritizes shields before hitting HP', () => {
  // Full shield absorb
  const res1 = applyDamageToPlayer(100, 50, 30);
  assert.equal(res1.shieldDamage, 30);
  assert.equal(res1.hpDamage, 0);
  assert.equal(res1.remainingShield, 20);
  assert.equal(res1.remainingHp, 100);
  assert.equal(res1.isDead, false);

  // Partial shield + partial HP damage
  const res2 = applyDamageToPlayer(100, 20, 50);
  assert.equal(res2.shieldDamage, 20);
  assert.equal(res2.hpDamage, 30);
  assert.equal(res2.remainingShield, 0);
  assert.equal(res2.remainingHp, 70);
  assert.equal(res2.isDead, false);

  // Fatal blow
  const res3 = applyDamageToPlayer(40, 10, 60);
  assert.equal(res3.shieldDamage, 10);
  assert.equal(res3.hpDamage, 40);
  assert.equal(res3.remainingShield, 0);
  assert.equal(res3.remainingHp, 0);
  assert.equal(res3.isDead, true);
});

test('applyPerk updates player state attributes properly', () => {
  const mockPlayer: PlayerState = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    angle: 0,
    hp: 100,
    maxHp: 100,
    shield: 50,
    maxShield: 50,
    shieldRechargeTimer: 0,
    speed: 200,
    fireRate: 4,
    fireCooldown: 0,
    dashCooldown: 3.0,
    dashTimer: 0,
    isDashing: false,
    bulletDamage: 20,
    bulletSpeed: 500,
    pierceCount: 0,
    doubleShot: false,
    homingCount: 0,
    magnetRadius: 100,
    empCooldown: 0,
    empTimer: 0,
    level: 1,
    xp: 0,
    xpToNextLevel: 35,
    hitFlashTimer: 0,
    invulnerabilityTimer: 0,
    recentDamageGhost: 0,
    ghostFadeTimer: 0,
    currentWeapon: 'plasma_blaster',
    unlockedWeapons: ['plasma_blaster'],
    wingRocketCooldown: 0,
    wingRocketMaxCooldown: 1.8,
    wingRocketAlternate: false,
    wingRocketReady: true,
  };

  applyPerk(mockPlayer, 'double_barrel');
  assert.equal(mockPlayer.doubleShot, true);

  applyPerk(mockPlayer, 'piercing_rounds');
  assert.equal(mockPlayer.pierceCount, 2);

  applyPerk(mockPlayer, 'plasma_shield');
  assert.equal(mockPlayer.maxShield, 100);

  applyPerk(mockPlayer, 'magnetic_collector');
  assert.equal(mockPlayer.magnetRadius, 300);
});

test('checkWaveCompletion verifies when wave ends', () => {
  assert.equal(checkWaveCompletion(0, 0), true);
  assert.equal(checkWaveCompletion(3, 0), false);
  assert.equal(checkWaveCompletion(0, 5), false);
});

test('getWaveTargetEnemies supplies appropriate counts', () => {
  assert.equal(getWaveTargetEnemies(1), 18);
  assert.equal(getWaveTargetEnemies(2), 24);
  assert.equal(getWaveTargetEnemies(5), 16); // Boss encounter
});

test('calculateCombatIntensity computes responsive intensity', () => {
  // Calm state: 0 enemies, no boss, 100% HP, combo 1 => 0.0
  const calm = calculateCombatIntensity(0, false, 1.0, 1);
  assert.equal(calm, 0);

  // Moderate battle: 7 enemies, no boss, high HP, combo 2
  const mid = calculateCombatIntensity(7, false, 1.0, 2);
  assert.ok(mid >= 0.2 && mid <= 0.35);

  // Severe boss fight with low HP: boss alive, 10 enemies, 20% HP, combo 5
  const intense = calculateCombatIntensity(10, true, 0.2, 5);
  assert.ok(intense >= 0.8 && intense <= 1.0);
});

test('preparePlayerForNextSector preserves all acquired attributes, levels, perks, and weapons', () => {
  const upgradedPlayer: PlayerState = {
    x: 450,
    y: 890,
    vx: 120,
    vy: -80,
    angle: 1.57,
    hp: 45,
    maxHp: 180, // upgraded via nanites
    shield: 10,
    maxShield: 120, // upgraded via plasma shield
    shieldRechargeTimer: 1.2,
    speed: 285, // upgraded via overcharge thrust
    fireRate: 6.8, // upgraded via hyper cooling
    fireCooldown: 0.1,
    dashCooldown: 1.8,
    dashTimer: 0.8,
    isDashing: true,
    bulletDamage: 38,
    bulletSpeed: 620,
    pierceCount: 3,
    doubleShot: true,
    homingCount: 2,
    magnetRadius: 280,
    empCooldown: 8.0,
    empTimer: 3.5,
    level: 7,
    xp: 42,
    xpToNextLevel: 140,
    hitFlashTimer: 0.05,
    invulnerabilityTimer: 0,
    recentDamageGhost: 70,
    ghostFadeTimer: 0.4,
    currentWeapon: 'quantum_railgun',
    unlockedWeapons: [
      'plasma_blaster',
      'scatter_cannon',
      'quantum_railgun',
      'vortex_missiles',
      'tesla_arc',
    ],
    wingRocketCooldown: 0.7,
    wingRocketMaxCooldown: 1.8,
    wingRocketAlternate: true,
    wingRocketReady: false,
  };

  const nextSectorPlayer = preparePlayerForNextSector(upgradedPlayer, 1200, 1200);

  // Attributes must be strictly preserved!
  assert.equal(nextSectorPlayer.level, 7);
  assert.equal(nextSectorPlayer.xp, 42);
  assert.equal(nextSectorPlayer.xpToNextLevel, 140);
  assert.equal(nextSectorPlayer.maxHp, 180);
  assert.equal(nextSectorPlayer.maxShield, 120);
  assert.equal(nextSectorPlayer.speed, 285);
  assert.equal(nextSectorPlayer.fireRate, 6.8);
  assert.equal(nextSectorPlayer.bulletDamage, 38);
  assert.equal(nextSectorPlayer.bulletSpeed, 620);
  assert.equal(nextSectorPlayer.pierceCount, 3);
  assert.equal(nextSectorPlayer.doubleShot, true);
  assert.equal(nextSectorPlayer.homingCount, 2);
  assert.equal(nextSectorPlayer.magnetRadius, 280);
  assert.equal(nextSectorPlayer.empCooldown, 8.0);
  assert.equal(nextSectorPlayer.currentWeapon, 'quantum_railgun');
  assert.equal(nextSectorPlayer.unlockedWeapons.length, 5);

  // Ship must be repaired and shielded for new sector
  assert.equal(nextSectorPlayer.hp, 180);
  assert.equal(nextSectorPlayer.shield, 120);
  assert.equal(nextSectorPlayer.shieldRechargeTimer, 0);

  // Transient state reset at new coordinates
  assert.equal(nextSectorPlayer.x, 1200);
  assert.equal(nextSectorPlayer.y, 1200);
  assert.equal(nextSectorPlayer.vx, 0);
  assert.equal(nextSectorPlayer.vy, 0);
  assert.equal(nextSectorPlayer.isDashing, false);
  assert.equal(nextSectorPlayer.dashTimer, 0);
  assert.equal(nextSectorPlayer.invulnerabilityTimer, 2.5);
  assert.equal(nextSectorPlayer.wingRocketCooldown, 0);
  assert.equal(nextSectorPlayer.wingRocketReady, true);
});

test('calculateDashVelocity and estimateDashDistance reach long deep space distances', () => {
  const baseSpeed = 240;
  const leap = calculateDashVelocity(0, baseSpeed);

  // Impulse speed should be at least 1500px/s (default 1800)
  assert.ok(leap.speed >= 1500);
  assert.equal(leap.vx, leap.speed);
  assert.equal(leap.vy, 0);

  // Distance across deep space leap must be significantly greater than old 200px hop
  const estDist = estimateDashDistance(leap.speed, ACTIVE_DASH_DURATION);
  assert.ok(
    estDist >= 600,
    `Deep space leap distance should be >= 600px, but was ${estDist}px`
  );
});
